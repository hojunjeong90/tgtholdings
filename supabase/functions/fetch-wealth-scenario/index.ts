import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// FRED 시리즈 매핑 (최소한의 핵심 지표만)
const FRED_INDICATORS = [
  { id: 'us_10y', seriesId: 'DGS10', name: '미국 10Y 국채금리' },
  { id: 'spread_2y10y', seriesId: 'T10Y2Y', name: '2Y-10Y 스프레드' },
  { id: 'fed_assets', seriesId: 'WALCL', name: '연준 자산총액' },
  { id: 'us_m2', seriesId: 'M2SL', name: '미국 M2' },
];

// Yahoo Finance 심볼 매핑
const YAHOO_INDICATORS = [
  { id: 'sp500', symbol: '^GSPC', name: 'S&P 500' },
  { id: 'nasdaq', symbol: '^IXIC', name: 'NASDAQ' },
  { id: 'kospi', symbol: '^KS11', name: 'KOSPI' },
  { id: 'gold', symbol: 'GC=F', name: 'Gold' },
  { id: 'btc', symbol: 'BTC-USD', name: 'Bitcoin' },
  { id: 'dxy', symbol: 'DX-Y.NYB', name: 'Dollar Index' },
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
  limit: number = 90
): Promise<FredObservation[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status}`);
  }

  const data: FredResponse = await response.json();
  if (data.error_code) {
    throw new Error(`FRED API error: ${data.error_message}`);
  }

  return data.observations || [];
}

async function fetchYahooHistorical(symbol: string): Promise<{ price: number; date: string }[]> {
  try {
    // 3개월 데이터만 가져오기 (90일)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) return [];

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    const dataPoints: { price: number; date: string }[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i];
      if (price != null && !isNaN(price)) {
        const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        dataPoints.push({ price, date });
      }
    }

    return dataPoints;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return [];
  }
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
    console.log('=== Fetch Wealth Scenario Started ===');
    const startTime = Date.now();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY');

    if (!fredApiKey) {
      throw new Error('FRED_API_KEY is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalInserted = 0;
    let totalErrors = 0;
    const results: { indicator: string; inserted: number; error?: string }[] = [];

    // 1. FRED 지표 병렬로 가져오기
    console.log('Fetching FRED indicators in parallel...');
    const fredPromises = FRED_INDICATORS.map(async (indicator) => {
      try {
        const observations = await fetchFredSeries(indicator.seriesId, fredApiKey, 90);
        return { indicator, observations, error: null };
      } catch (error) {
        return { indicator, observations: [], error: error instanceof Error ? error.message : 'Unknown' };
      }
    });

    const fredResults = await Promise.all(fredPromises);

    // FRED 데이터 저장
    for (const { indicator, observations, error } of fredResults) {
      if (error) {
        results.push({ indicator: indicator.id, inserted: 0, error });
        totalErrors++;
        continue;
      }

      let inserted = 0;
      const records = observations
        .filter(obs => obs.value !== '.' && obs.value !== '')
        .map(obs => ({
          indicator_id: indicator.id,
          date: obs.date,
          value: parseFloat(obs.value),
          source: 'FRED',
          series_id: indicator.seriesId,
          updated_at: new Date().toISOString(),
        }))
        .filter(r => !isNaN(r.value));

      if (records.length > 0) {
        const { error: upsertError } = await supabase
          .from('wealth_scenario_indicators')
          .upsert(records, { onConflict: 'indicator_id,date' });

        if (!upsertError) {
          inserted = records.length;
          totalInserted += inserted;
        }
      }

      results.push({ indicator: indicator.id, inserted });
      console.log(`FRED ${indicator.id}: ${inserted} records`);
    }

    // 2. Yahoo Finance 지표 병렬로 가져오기
    console.log('Fetching Yahoo indicators in parallel...');
    const yahooPromises = YAHOO_INDICATORS.map(async (indicator) => {
      try {
        const dataPoints = await fetchYahooHistorical(indicator.symbol);
        return { indicator, dataPoints, error: null };
      } catch (error) {
        return { indicator, dataPoints: [], error: error instanceof Error ? error.message : 'Unknown' };
      }
    });

    const yahooResults = await Promise.all(yahooPromises);

    // Yahoo 데이터 저장
    for (const { indicator, dataPoints, error } of yahooResults) {
      if (error) {
        results.push({ indicator: indicator.id, inserted: 0, error });
        totalErrors++;
        continue;
      }

      let inserted = 0;
      const records = dataPoints.map(point => ({
        indicator_id: indicator.id,
        date: point.date,
        value: point.price,
        source: 'YAHOO',
        series_id: indicator.symbol,
        updated_at: new Date().toISOString(),
      }));

      if (records.length > 0) {
        const { error: upsertError } = await supabase
          .from('wealth_scenario_indicators')
          .upsert(records, { onConflict: 'indicator_id,date' });

        if (!upsertError) {
          inserted = records.length;
          totalInserted += inserted;
        }
      }

      results.push({ indicator: indicator.id, inserted });
      console.log(`Yahoo ${indicator.id}: ${inserted} records`);
    }

    const elapsed = Date.now() - startTime;
    console.log(`=== Completed in ${elapsed}ms ===`);
    console.log(`Total: ${totalInserted} inserted, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        elapsed_ms: elapsed,
        summary: { totalInserted, totalErrors },
        results,
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
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
