import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EcosKeyStatisticItem {
  CLASS_NAME: string;
  KEYSTAT_NAME: string;
  DATA_VALUE: string;
  CYCLE: string;
  UNIT_NAME: string;
}

interface EcosResponse {
  KeyStatisticList?: {
    row?: EcosKeyStatisticItem[];
  };
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

async function fetchKeyStatisticsBatch(
  apiKey: string,
  start: number,
  end: number
): Promise<EcosKeyStatisticItem[]> {
  const url = `https://ecos.bok.or.kr/api/KeyStatisticList/${apiKey}/json/kr/${start}/${end}`;

  console.log(`Fetching ECOS KeyStatisticList: ${start}-${end}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ECOS API error: ${response.status}`);
  }

  const data: EcosResponse = await response.json();

  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
    console.warn(`ECOS: ${data.RESULT.CODE} - ${data.RESULT.MESSAGE}`);
    return [];
  }

  return data.KeyStatisticList?.row || [];
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Fetch Key Statistics Started ===');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ecosApiKey = Deno.env.get('ECOS_API_KEY');

    if (!ecosApiKey) {
      throw new Error('ECOS_API_KEY is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 10회 호출로 100개 데이터 수집 (1-10, 11-20, ..., 91-100)
    const allItems: EcosKeyStatisticItem[] = [];

    for (let i = 0; i < 10; i++) {
      const start = i * 10 + 1;
      const end = start + 9;

      try {
        const items = await fetchKeyStatisticsBatch(ecosApiKey, start, end);
        allItems.push(...items);
        console.log(`Batch ${i + 1}: ${items.length} items`);

        // Rate limiting - 100ms 대기
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (batchError) {
        console.error(`Batch ${i + 1} error:`, batchError);
      }
    }

    console.log(`Total fetched: ${allItems.length} items`);

    // Upsert 로직 (keystat_name + cycle 복합키)
    let insertedCount = 0;
    let errorCount = 0;

    for (const stat of allItems) {
      const { error } = await supabase
        .from('key_statistics')
        .upsert(
          {
            keystat_name: stat.KEYSTAT_NAME,
            class_name: stat.CLASS_NAME,
            data_value: stat.DATA_VALUE,
            cycle: stat.CYCLE,
            unit_name: stat.UNIT_NAME,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'keystat_name,cycle' }
        );

      if (error) {
        console.error(`Upsert error for ${stat.KEYSTAT_NAME}:`, error.message);
        errorCount++;
      } else {
        insertedCount++;
      }
    }

    console.log(`=== Completed: ${insertedCount} upserted, ${errorCount} errors ===`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalFetched: allItems.length,
          upserted: insertedCount,
          errors: errorCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
