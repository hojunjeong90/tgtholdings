import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COINS = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK', 'ATOM', 'UNI', 'LTC', 'BCH', 'ETC'];

interface BinanceFundingRate {
  symbol: string;
  lastFundingRate: string;
  nextFundingTime: number;
  markPrice: string;
}

async function fetchBinanceFundingRates(): Promise<Map<string, BinanceFundingRate>> {
  const url = 'https://fapi.binance.com/fapi/v1/premiumIndex';

  console.log(`Fetching Binance funding rates: ${url}`);

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Binance API error: ${response.status} - ${text}`);
    throw new Error(`Binance API error: ${response.status}`);
  }

  const data = await response.json();
  const rateMap = new Map<string, BinanceFundingRate>();

  for (const item of data) {
    const symbol = item.symbol?.replace('USDT', '');
    if (symbol && COINS.includes(symbol)) {
      rateMap.set(symbol, {
        symbol: item.symbol,
        lastFundingRate: item.lastFundingRate,
        nextFundingTime: item.nextFundingTime,
        markPrice: item.markPrice,
      });
    }
  }

  return rateMap;
}

async function fetchBybitFundingRates(): Promise<Map<string, { fundingRate: string; nextFundingTime: string }>> {
  const rateMap = new Map<string, { fundingRate: string; nextFundingTime: string }>();

  // Bybit requires individual requests per symbol
  for (const coin of COINS.slice(0, 5)) { // Limit to avoid rate limiting
    try {
      const symbol = `${coin}USDT`;
      const url = `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) continue;

      const data = await response.json();
      const ticker = data?.result?.list?.[0];

      if (ticker?.fundingRate) {
        rateMap.set(coin, {
          fundingRate: ticker.fundingRate,
          nextFundingTime: ticker.nextFundingTime || '',
        });
      }
    } catch (err) {
      console.error(`Bybit error for ${coin}:`, err);
    }
  }

  return rateMap;
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
    console.log('=== Fetch Funding Rates Started ===');
    const startTime = Date.now();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch data
    let binanceRates = new Map<string, BinanceFundingRate>();
    let bybitRates = new Map<string, { fundingRate: string; nextFundingTime: string }>();

    try {
      binanceRates = await fetchBinanceFundingRates();
      console.log(`Got ${binanceRates.size} Binance rates`);
    } catch (err) {
      console.error('Binance fetch failed:', err);
    }

    try {
      bybitRates = await fetchBybitFundingRates();
      console.log(`Got ${bybitRates.size} Bybit rates`);
    } catch (err) {
      console.error('Bybit fetch failed:', err);
    }

    const now = new Date().toISOString();
    const records: any[] = [];

    // Binance data
    for (const [symbol, rate] of binanceRates) {
      records.push({
        symbol,
        exchange: 'binance',
        funding_rate: parseFloat(rate.lastFundingRate),
        funding_time: rate.nextFundingTime ? new Date(rate.nextFundingTime).toISOString() : null,
        mark_price: rate.markPrice ? parseFloat(rate.markPrice) : null,
        created_at: now,
      });
    }

    // Bybit data
    for (const [symbol, rate] of bybitRates) {
      records.push({
        symbol,
        exchange: 'bybit',
        funding_rate: parseFloat(rate.fundingRate),
        funding_time: rate.nextFundingTime ? new Date(parseInt(rate.nextFundingTime)).toISOString() : null,
        created_at: now,
      });
    }

    // Insert to DB
    if (records.length > 0) {
      const { error } = await supabase
        .from('funding_rates')
        .insert(records);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`=== Completed in ${elapsed}ms, inserted ${records.length} records ===`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: records.length,
        binance_count: binanceRates.size,
        bybit_count: bybitRates.size,
        elapsed_ms: elapsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
