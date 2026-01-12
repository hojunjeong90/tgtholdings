import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ECOS API 통계표 매핑
const ECOS_SERIES = [
  {
    name: 'monetary_base',
    statCode: '102Y004',
    itemCode1: 'ABA1',
    frequency: 'monthly',
    cycle: 'M',
  },
  {
    name: 'm2',
    statCode: '101Y003',
    itemCode1: 'BBHS00',
    frequency: 'monthly',
    cycle: 'M',
  },
  {
    name: 'gdp_nominal',
    statCode: '200Y103',
    itemCode1: '1400',
    frequency: 'quarterly',
    cycle: 'Q',
  },
];

interface EcosItem {
  TIME: string;
  DATA_VALUE: string;
}

interface EcosResponse {
  StatisticSearch?: {
    row?: EcosItem[];
  };
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

function formatEcosDate(time: string, cycle: string): string {
  if (cycle === 'M') {
    const year = time.substring(0, 4);
    const month = time.substring(4, 6);
    return `${year}-${month}-01`;
  } else if (cycle === 'Q') {
    const year = time.substring(0, 4);
    const quarter = parseInt(time.substring(5, 6));
    const month = ((quarter - 1) * 3 + 1).toString().padStart(2, '0');
    return `${year}-${month}-01`;
  }
  return time;
}

function getDateRange(cycle: string): { startDate: string; endDate: string } {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const startYear = endYear - 5;

  if (cycle === 'M') {
    return {
      startDate: `${startYear}01`,
      endDate: `${endYear}${endMonth}`,
    };
  } else {
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return {
      startDate: `${startYear}Q1`,
      endDate: `${endYear}Q${quarter}`,
    };
  }
}

async function fetchEcosSeries(
  apiKey: string,
  statCode: string,
  itemCode1: string,
  cycle: string
): Promise<EcosItem[]> {
  const { startDate, endDate } = getDateRange(cycle);
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/100/${statCode}/${cycle}/${startDate}/${endDate}/${itemCode1}`;

  console.log(`Fetching ECOS: ${statCode} / ${itemCode1} (${cycle})`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ECOS API error: ${response.status}`);
  }

  const data: EcosResponse = await response.json();

  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
    console.warn(`ECOS: ${data.RESULT.CODE} - ${data.RESULT.MESSAGE}`);
    return [];
  }

  return data.StatisticSearch?.row || [];
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
    console.log('=== Fetch ECOS Indicators Started ===');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ecosApiKey = Deno.env.get('ECOS_API_KEY');

    if (!ecosApiKey) {
      throw new Error('ECOS_API_KEY is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalInserted = 0;
    const results: { series: string; inserted: number; error?: string }[] = [];

    // Fetch each ECOS series
    for (const series of ECOS_SERIES) {
      try {
        console.log(`\nProcessing ${series.name}...`);

        const items = await fetchEcosSeries(
          ecosApiKey,
          series.statCode,
          series.itemCode1,
          series.cycle
        );

        console.log(`Got ${items.length} items`);

        let seriesInserted = 0;

        for (const item of items) {
          if (!item.DATA_VALUE || item.DATA_VALUE === '-') continue;

          const value = parseFloat(item.DATA_VALUE.replace(/,/g, ''));
          if (isNaN(value)) continue;

          const date = formatEcosDate(item.TIME, series.cycle);
          const indicatorType = series.name === 'gdp_nominal' ? 'gdp' : series.name;

          const { error: upsertError } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: 'KR',
                indicator_type: indicatorType,
                date: date,
                value: value,
                source: 'ECOS',
                series_id: series.statCode,
                frequency: series.frequency,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'country_code,indicator_type,date' }
            );

          if (!upsertError) {
            seriesInserted++;
            totalInserted++;
          }
        }

        results.push({ series: `KR_${series.name}`, inserted: seriesInserted });
        console.log(`✅ ${series.name}: ${seriesInserted} records`);
      } catch (seriesError) {
        const msg = seriesError instanceof Error ? seriesError.message : 'Unknown';
        console.error(`❌ ${series.name}: ${msg}`);
        results.push({ series: `KR_${series.name}`, inserted: 0, error: msg });
      }
    }

    // Calculate Korea Money Multiplier (M2 / Monetary Base)
    console.log('\nCalculating Korea Money Multiplier...');
    const { data: krM2Data } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'KR')
      .eq('indicator_type', 'm2')
      .eq('source', 'ECOS')
      .order('date', { ascending: false })
      .limit(60);

    const { data: krBaseData } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'KR')
      .eq('indicator_type', 'monetary_base')
      .order('date', { ascending: false })
      .limit(60);

    if (krM2Data?.length && krBaseData?.length) {
      const baseMap = new Map(krBaseData.map(b => [b.date, b.value]));
      let multiplierInserted = 0;

      for (const m2 of krM2Data) {
        const base = baseMap.get(m2.date);
        if (base && base > 0) {
          // 둘 다 십억원 단위
          const multiplier = m2.value / base;

          const { error } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: 'KR',
                indicator_type: 'multiplier',
                date: m2.date,
                value: multiplier,
                source: 'ECOS',
                series_id: 'CALCULATED',
                frequency: 'monthly',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'country_code,indicator_type,date' }
            );

          if (!error) {
            multiplierInserted++;
            totalInserted++;
          }
        }
      }

      results.push({ series: 'KR_multiplier', inserted: multiplierInserted });
      console.log(`✅ Korea Multiplier: ${multiplierInserted} records`);
    } else {
      results.push({ series: 'KR_multiplier', inserted: 0, error: 'Missing data' });
    }

    // Calculate Korea Velocity (GDP / M2)
    console.log('\nCalculating Korea Velocity...');
    const { data: krGdpData } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'KR')
      .eq('indicator_type', 'gdp')
      .order('date', { ascending: false })
      .limit(20);

    if (krGdpData?.length && krM2Data?.length) {
      const m2Map = new Map<string, number[]>();
      for (const m2 of krM2Data) {
        const year = m2.date.substring(0, 4);
        const month = parseInt(m2.date.substring(5, 7));
        const quarter = Math.ceil(month / 3);
        const quarterKey = `${year}-Q${quarter}`;

        if (!m2Map.has(quarterKey)) m2Map.set(quarterKey, []);
        m2Map.get(quarterKey)!.push(m2.value);
      }

      let velocityInserted = 0;

      for (const gdp of krGdpData) {
        const year = gdp.date.substring(0, 4);
        const month = parseInt(gdp.date.substring(5, 7));
        const quarter = Math.ceil(month / 3);
        const quarterKey = `${year}-Q${quarter}`;

        const m2Values = m2Map.get(quarterKey);
        if (m2Values?.length) {
          const avgM2 = m2Values.reduce((a, b) => a + b, 0) / m2Values.length;
          if (avgM2 > 0) {
            // GDP는 십억원, M2도 십억원
            const velocity = (gdp.value * 4) / avgM2;

            const { error } = await supabase
              .from('monetary_indicators')
              .upsert(
                {
                  country_code: 'KR',
                  indicator_type: 'velocity',
                  date: gdp.date,
                  value: velocity,
                  source: 'ECOS',
                  series_id: 'CALCULATED',
                  frequency: 'quarterly',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'country_code,indicator_type,date' }
              );

            if (!error) {
              velocityInserted++;
              totalInserted++;
            }
          }
        }
      }

      results.push({ series: 'KR_velocity', inserted: velocityInserted });
      console.log(`✅ Korea Velocity: ${velocityInserted} records`);
    } else {
      results.push({ series: 'KR_velocity', inserted: 0, error: 'Missing data' });
    }

    // Calculate Korea M2 Growth Rate (YoY %)
    console.log('\nCalculating Korea M2 Growth Rate (YoY)...');
    if (krM2Data?.length) {
      // Create a map of date -> value for easy lookup
      const m2DateMap = new Map(krM2Data.map(d => [d.date, d.value]));
      let m2GrowthInserted = 0;

      for (const current of krM2Data) {
        // Get the same month from previous year
        const currentDate = new Date(current.date);
        const prevYearDate = new Date(currentDate);
        prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);
        const prevYearKey = prevYearDate.toISOString().substring(0, 10);

        const prevYearValue = m2DateMap.get(prevYearKey);
        if (prevYearValue && prevYearValue > 0) {
          const growthRate = ((current.value - prevYearValue) / prevYearValue) * 100;

          const { error } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: 'KR',
                indicator_type: 'm2_growth',
                date: current.date,
                value: growthRate,
                source: 'ECOS',
                series_id: 'CALCULATED',
                frequency: 'monthly',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'country_code,indicator_type,date' }
            );

          if (!error) {
            m2GrowthInserted++;
            totalInserted++;
          }
        }
      }

      results.push({ series: 'KR_m2_growth', inserted: m2GrowthInserted });
      console.log(`✅ Korea M2 Growth: ${m2GrowthInserted} records`);
    } else {
      results.push({ series: 'KR_m2_growth', inserted: 0, error: 'Missing M2 data' });
    }

    console.log(`\n=== Total inserted: ${totalInserted} ===`);

    return new Response(
      JSON.stringify({ success: true, summary: { totalInserted }, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
