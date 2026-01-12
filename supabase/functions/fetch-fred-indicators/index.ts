import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// FRED 시리즈 매핑
const FRED_SERIES = [
  // 미국 - 직접 제공되는 지표
  { country: 'US', type: 'velocity', seriesId: 'M2V', frequency: 'quarterly' },
  { country: 'US', type: 'interest_rate', seriesId: 'FEDFUNDS', frequency: 'monthly' },
  { country: 'US', type: 'm2', seriesId: 'M2SL', frequency: 'monthly' },
  { country: 'US', type: 'monetary_base', seriesId: 'BOGMBASE', frequency: 'monthly' },

  // 한국 - 금리와 M2
  { country: 'KR', type: 'interest_rate', seriesId: 'IRSTCI01KRM156N', frequency: 'monthly' },
  { country: 'KR', type: 'm2', seriesId: 'MYAGM2KRM189N', frequency: 'monthly' },

  // 일본 - 금리와 M2
  { country: 'JP', type: 'interest_rate', seriesId: 'IRSTCI01JPM156N', frequency: 'monthly' },
  { country: 'JP', type: 'm2', seriesId: 'MYAGM2JPM189N', frequency: 'monthly' },
];

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations?: FredObservation[];
  error_code?: number;
  error_message?: string;
}

async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  limit: number = 120
): Promise<FredObservation[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

  console.log(`Fetching FRED series: ${seriesId}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data: FredResponse = await response.json();

  if (data.error_code) {
    throw new Error(`FRED API error: ${data.error_message}`);
  }

  return data.observations || [];
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
    console.log('=== Fetch FRED Indicators Started ===');

    // Get credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY');

    if (!fredApiKey) {
      throw new Error('FRED_API_KEY is not set');
    }

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const results: { series: string; inserted: number; error?: string }[] = [];

    // Fetch each series
    for (const series of FRED_SERIES) {
      try {
        console.log(`\nProcessing ${series.country} ${series.type} (${series.seriesId})...`);

        const observations = await fetchFredSeries(series.seriesId, fredApiKey, 60);
        console.log(`Got ${observations.length} observations`);

        let seriesInserted = 0;

        for (const obs of observations) {
          // Skip missing values (FRED uses '.' for missing)
          if (obs.value === '.' || obs.value === '') {
            totalSkipped++;
            continue;
          }

          const value = parseFloat(obs.value);
          if (isNaN(value)) {
            console.warn(`Invalid value for ${series.seriesId} on ${obs.date}: ${obs.value}`);
            totalSkipped++;
            continue;
          }

          // Upsert data
          const { error: upsertError } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: series.country,
                indicator_type: series.type,
                date: obs.date,
                value: value,
                source: 'FRED',
                series_id: series.seriesId,
                frequency: series.frequency,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'country_code,indicator_type,date',
              }
            );

          if (upsertError) {
            console.error(`Upsert error for ${series.seriesId}: ${upsertError.message}`);
            totalErrors++;
          } else {
            seriesInserted++;
            totalInserted++;
          }
        }

        results.push({
          series: `${series.country}_${series.type}`,
          inserted: seriesInserted,
        });
        console.log(`✅ ${series.seriesId}: ${seriesInserted} records upserted`);
      } catch (seriesError) {
        const errorMessage = seriesError instanceof Error ? seriesError.message : 'Unknown error';
        console.error(`❌ Error fetching ${series.seriesId}: ${errorMessage}`);
        results.push({
          series: `${series.country}_${series.type}`,
          inserted: 0,
          error: errorMessage,
        });
        totalErrors++;
      }
    }

    // Calculate US money multiplier (M2 / Monetary Base)
    console.log('\nCalculating US Money Multiplier...');
    const { data: m2Data } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'US')
      .eq('indicator_type', 'm2')
      .order('date', { ascending: false })
      .limit(60);

    const { data: baseData } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'US')
      .eq('indicator_type', 'monetary_base')
      .order('date', { ascending: false })
      .limit(60);

    if (m2Data && baseData) {
      const baseMap = new Map(baseData.map(b => [b.date, b.value]));
      let multiplierInserted = 0;

      for (const m2 of m2Data) {
        const base = baseMap.get(m2.date);
        if (base && base > 0) {
          const multiplier = m2.value / base;

          const { error } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: 'US',
                indicator_type: 'multiplier',
                date: m2.date,
                value: multiplier,
                source: 'FRED',
                series_id: 'CALCULATED',
                frequency: 'monthly',
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'country_code,indicator_type,date',
              }
            );

          if (!error) {
            multiplierInserted++;
            totalInserted++;
          }
        }
      }

      results.push({
        series: 'US_multiplier',
        inserted: multiplierInserted,
      });
      console.log(`✅ US Money Multiplier: ${multiplierInserted} records calculated`);
    }

    // Calculate M2 Growth Rate (YoY %) for US
    console.log('\nCalculating US M2 Growth Rate (YoY)...');
    if (m2Data?.length) {
      const m2DateMap = new Map(m2Data.map(d => [d.date, d.value]));
      let m2GrowthInserted = 0;

      for (const current of m2Data) {
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
                country_code: 'US',
                indicator_type: 'm2_growth',
                date: current.date,
                value: growthRate,
                source: 'FRED',
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

      results.push({ series: 'US_m2_growth', inserted: m2GrowthInserted });
      console.log(`✅ US M2 Growth: ${m2GrowthInserted} records calculated`);
    }

    // Calculate M2 Growth Rate for JP (if data exists)
    console.log('\nCalculating JP M2 Growth Rate (YoY)...');
    const { data: jpM2Data } = await supabase
      .from('monetary_indicators')
      .select('date, value')
      .eq('country_code', 'JP')
      .eq('indicator_type', 'm2')
      .order('date', { ascending: false })
      .limit(60);

    if (jpM2Data?.length) {
      const jpM2DateMap = new Map(jpM2Data.map(d => [d.date, d.value]));
      let jpM2GrowthInserted = 0;

      for (const current of jpM2Data) {
        const currentDate = new Date(current.date);
        const prevYearDate = new Date(currentDate);
        prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);
        const prevYearKey = prevYearDate.toISOString().substring(0, 10);

        const prevYearValue = jpM2DateMap.get(prevYearKey);
        if (prevYearValue && prevYearValue > 0) {
          const growthRate = ((current.value - prevYearValue) / prevYearValue) * 100;

          const { error } = await supabase
            .from('monetary_indicators')
            .upsert(
              {
                country_code: 'JP',
                indicator_type: 'm2_growth',
                date: current.date,
                value: growthRate,
                source: 'FRED',
                series_id: 'CALCULATED',
                frequency: 'monthly',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'country_code,indicator_type,date' }
            );

          if (!error) {
            jpM2GrowthInserted++;
            totalInserted++;
          }
        }
      }

      results.push({ series: 'JP_m2_growth', inserted: jpM2GrowthInserted });
      console.log(`✅ JP M2 Growth: ${jpM2GrowthInserted} records calculated`);
    } else {
      results.push({ series: 'JP_m2_growth', inserted: 0, error: 'No JP M2 data' });
    }

    console.log('\n=== Fetch FRED Indicators Completed ===');
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total errors: ${totalErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalInserted,
          totalSkipped,
          totalErrors,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== Fetch FRED Indicators Error ===');
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
