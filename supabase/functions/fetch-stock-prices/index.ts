import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

async function fetchYahooWeekly(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<StockDataPoint[]> {
  const period1 = Math.floor(new Date(startDate).getTime() / 1000);
  const period2 = Math.floor(new Date(endDate).getTime() / 1000) + 86400;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${period1}&period2=${period2}&interval=1wk`;

  console.log(`Fetching: ${url}`);

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

  if (!result) {
    console.warn(`No data for ${ticker}`);
    return [];
  }

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

  const dataPoints: StockDataPoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = quote.close?.[i];
    if (close == null || isNaN(close)) continue;

    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
    dataPoints.push({
      date,
      open: quote.open?.[i] ?? close,
      high: quote.high?.[i] ?? close,
      low: quote.low?.[i] ?? close,
      close,
      volume: quote.volume?.[i] ?? 0,
      adjustedClose: adjClose[i] ?? close,
    });
  }

  return dataPoints;
}

async function upsertData(
  supabase: ReturnType<typeof createClient>,
  ticker: string,
  dataPoints: StockDataPoint[]
): Promise<number> {
  if (dataPoints.length === 0) return 0;

  const records = dataPoints.map(point => ({
    ticker,
    date: point.date,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
    adjusted_close: point.adjustedClose,
    source: 'YAHOO',
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from('stock_prices_weekly')
    .upsert(records, { onConflict: 'ticker,date' });

  if (upsertError) {
    console.error('Upsert error:', upsertError);
    return 0;
  }

  return records.length;
}

// 페이지네이션으로 모든 데이터 가져오기
async function fetchAllData(
  supabase: ReturnType<typeof createClient>,
  ticker: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const PAGE_SIZE = 1000;
  let allData: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('stock_prices_weekly')
      .select('*')
      .eq('ticker', ticker)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Select error: ${error.message}`);
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      offset += PAGE_SIZE;
      hasMore = data.length === PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allData;
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
    console.log('=== Fetch Stock Prices Started ===');
    const startTime = Date.now();

    // 1. 파라미터 파싱
    const body = await req.json();
    const { ticker, start_date, end_date } = body;

    if (!ticker || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters: ticker, start_date, end_date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ticker: ${ticker}, Start: ${start_date}, End: ${end_date}`);

    // 2. Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. DB에서 기존 데이터 범위 조회
    const { data: oldestRecord } = await supabase
      .from('stock_prices_weekly')
      .select('date')
      .eq('ticker', ticker)
      .order('date', { ascending: true })
      .limit(1)
      .single();

    const { data: latestRecord } = await supabase
      .from('stock_prices_weekly')
      .select('date')
      .eq('ticker', ticker)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const oldestDate = oldestRecord?.date;
    const latestDate = latestRecord?.date;
    console.log(`DB range: ${oldestDate || 'None'} ~ ${latestDate || 'None'}`);

    let totalFetched = 0;

    // 4. 과거 데이터 가져오기
    if (!oldestDate || start_date < oldestDate) {
      const fetchEnd = oldestDate || end_date;
      console.log(`Fetching historical data: ${start_date} to ${fetchEnd}`);

      try {
        const historicalData = await fetchYahooWeekly(ticker, start_date, fetchEnd);
        console.log(`Got ${historicalData.length} historical data points`);

        if (historicalData.length > 0) {
          const upserted = await upsertData(supabase, ticker, historicalData);
          totalFetched += upserted;
          console.log(`Upserted ${upserted} historical records`);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
      }
    }

    // 5. 최신 데이터 가져오기
    if (!latestDate || latestDate < end_date) {
      const fetchStart = latestDate || start_date;
      console.log(`Fetching recent data: ${fetchStart} to ${end_date}`);

      try {
        const recentData = await fetchYahooWeekly(ticker, fetchStart, end_date);
        console.log(`Got ${recentData.length} recent data points`);

        if (recentData.length > 0) {
          const upserted = await upsertData(supabase, ticker, recentData);
          totalFetched += upserted;
          console.log(`Upserted ${upserted} recent records`);
        }
      } catch (err) {
        console.error('Error fetching recent data:', err);
      }
    }

    if (totalFetched === 0 && oldestDate && latestDate) {
      console.log('Data is complete, no fetch needed');
    }

    // 6. 전체 데이터 반환 (페이지네이션 사용)
    const allData = await fetchAllData(supabase, ticker, start_date, end_date);

    const elapsed = Date.now() - startTime;
    console.log(`=== Completed in ${elapsed}ms, returning ${allData.length} records ===`);

    return new Response(
      JSON.stringify({
        success: true,
        fetched_new: totalFetched > 0,
        fetched_count: totalFetched,
        data: allData,
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
