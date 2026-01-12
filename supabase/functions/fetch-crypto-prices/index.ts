import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 주요 코인 목록
const COINS = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK', 'ATOM', 'UNI', 'LTC', 'BCH', 'ETC'];

// 업비트 마켓 코드 매핑
const UPBIT_MARKET_MAP: Record<string, string> = {
  BTC: 'KRW-BTC',
  ETH: 'KRW-ETH',
  XRP: 'KRW-XRP',
  SOL: 'KRW-SOL',
  DOGE: 'KRW-DOGE',
  ADA: 'KRW-ADA',
  AVAX: 'KRW-AVAX',
  DOT: 'KRW-DOT',
  MATIC: 'KRW-MATIC',
  LINK: 'KRW-LINK',
  ATOM: 'KRW-ATOM',
  UNI: 'KRW-UNI',
  LTC: 'KRW-LTC',
  BCH: 'KRW-BCH',
  ETC: 'KRW-ETC',
};

// CoinGecko ID 매핑
const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  SOL: 'solana',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  ATOM: 'cosmos',
  UNI: 'uniswap',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  ETC: 'ethereum-classic',
};

interface UpbitTicker {
  market: string;
  trade_price: number;
  acc_trade_volume_24h: number;
  signed_change_rate: number;
}

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
}

async function fetchUpbitPrices(): Promise<Map<string, UpbitTicker>> {
  const markets = COINS.map(c => UPBIT_MARKET_MAP[c]).filter(Boolean).join(',');
  const url = `https://api.upbit.com/v1/ticker?markets=${markets}`;

  console.log(`Fetching Upbit prices: ${url}`);

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Upbit API error: ${response.status}`);
  }

  const data: UpbitTicker[] = await response.json();
  const priceMap = new Map<string, UpbitTicker>();

  for (const ticker of data) {
    const symbol = ticker.market.replace('KRW-', '');
    priceMap.set(symbol, ticker);
  }

  return priceMap;
}

async function fetchCoinGeckoPrices(): Promise<Map<string, CoinGeckoPrice>> {
  const ids = COINS.map(c => COINGECKO_ID_MAP[c]).filter(Boolean).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

  console.log(`Fetching CoinGecko prices: ${url}`);

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: Record<string, CoinGeckoPrice> = await response.json();
  const priceMap = new Map<string, CoinGeckoPrice>();

  // CoinGecko ID를 심볼로 역매핑
  for (const [symbol, cgId] of Object.entries(COINGECKO_ID_MAP)) {
    if (data[cgId]) {
      priceMap.set(symbol, data[cgId]);
    }
  }

  return priceMap;
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
    console.log('=== Fetch Crypto Prices Started ===');
    const startTime = Date.now();

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 병렬로 가격 데이터 가져오기
    const [upbitPrices, coingeckoPrices] = await Promise.all([
      fetchUpbitPrices().catch(err => {
        console.error('Upbit fetch error:', err);
        return new Map<string, UpbitTicker>();
      }),
      fetchCoinGeckoPrices().catch(err => {
        console.error('CoinGecko fetch error:', err);
        return new Map<string, CoinGeckoPrice>();
      }),
    ]);

    console.log(`Got ${upbitPrices.size} Upbit prices, ${coingeckoPrices.size} CoinGecko prices`);

    // 데이터 저장
    const now = new Date().toISOString();
    const records: any[] = [];

    // 업비트 데이터
    for (const [symbol, ticker] of upbitPrices) {
      records.push({
        symbol,
        exchange: 'upbit',
        price_krw: ticker.trade_price,
        volume_24h: ticker.acc_trade_volume_24h,
        change_24h: ticker.signed_change_rate * 100, // 퍼센트로 변환
        created_at: now,
      });
    }

    // CoinGecko 데이터
    for (const [symbol, price] of coingeckoPrices) {
      records.push({
        symbol,
        exchange: 'coingecko',
        price_usd: price.usd,
        change_24h: price.usd_24h_change,
        market_cap: price.usd_market_cap,
        created_at: now,
      });
    }

    // DB에 삽입
    if (records.length > 0) {
      const { error } = await supabase
        .from('crypto_prices')
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
        upbit_count: upbitPrices.size,
        coingecko_count: coingeckoPrices.size,
        elapsed_ms: elapsed,
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
