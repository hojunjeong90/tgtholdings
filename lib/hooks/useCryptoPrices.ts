'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type { CryptoPriceInfo } from '@/lib/types/crypto';
import { getCoinName } from '@/lib/types/crypto';

/**
 * 암호화폐 실시간 가격을 가져오는 React Query 훅
 * - 업비트 KRW 가격
 * - CoinGecko USD 가격
 * - 24시간 변동률
 */
export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices', 'latest'],
    queryFn: async (): Promise<CryptoPriceInfo[]> => {
      const supabase = createClient();

      // 최근 10분 이내 데이터만 조회
      const tenMinutesAgo = new Date();
      tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

      // 업비트 가격 조회
      const { data: upbitData, error: upbitError } = await supabase
        .from('crypto_prices')
        .select('symbol, price_krw, volume_24h, change_24h, created_at')
        .eq('exchange', 'upbit')
        .gte('created_at', tenMinutesAgo.toISOString())
        .order('created_at', { ascending: false });

      if (upbitError) throw upbitError;

      // CoinGecko 가격 조회
      const { data: coingeckoData, error: coingeckoError } = await supabase
        .from('crypto_prices')
        .select('symbol, price_usd, market_cap, change_24h, created_at')
        .eq('exchange', 'coingecko')
        .gte('created_at', tenMinutesAgo.toISOString())
        .order('created_at', { ascending: false });

      if (coingeckoError) throw coingeckoError;

      // 심볼별로 최신 데이터만 추출
      const upbitMap = new Map<string, typeof upbitData[0]>();
      for (const item of upbitData || []) {
        if (!upbitMap.has(item.symbol)) {
          upbitMap.set(item.symbol, item);
        }
      }

      const coingeckoMap = new Map<string, typeof coingeckoData[0]>();
      for (const item of coingeckoData || []) {
        if (!coingeckoMap.has(item.symbol)) {
          coingeckoMap.set(item.symbol, item);
        }
      }

      // 통합 데이터 생성
      const symbols = new Set([
        ...upbitMap.keys(),
        ...coingeckoMap.keys(),
      ]);

      const priceInfos: CryptoPriceInfo[] = [];
      for (const symbol of symbols) {
        const upbit = upbitMap.get(symbol);
        const coingecko = coingeckoMap.get(symbol);

        priceInfos.push({
          symbol,
          name: getCoinName(symbol),
          upbitPriceKrw: upbit?.price_krw ? Number(upbit.price_krw) : null,
          coingeckoPriceUsd: coingecko?.price_usd ? Number(coingecko.price_usd) : null,
          coingeckoPriceKrw: null, // 김치프리미엄 훅에서 계산
          change24h: coingecko?.change_24h ? Number(coingecko.change_24h) :
                     upbit?.change_24h ? Number(upbit.change_24h) : null,
          volume24h: upbit?.volume_24h ? Number(upbit.volume_24h) : null,
          marketCap: coingecko?.market_cap ? Number(coingecko.market_cap) : null,
          updatedAt: upbit?.created_at || coingecko?.created_at || new Date().toISOString(),
        });
      }

      return priceInfos;
    },
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
}

/**
 * 특정 코인의 가격 히스토리를 가져오는 훅
 */
export function useCryptoPriceHistory(symbol: string, days: number = 7) {
  return useQuery({
    queryKey: ['crypto-price-history', symbol, days],
    queryFn: async () => {
      const supabase = createClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('crypto_prices')
        .select('price_krw, price_usd, change_24h, created_at')
        .eq('symbol', symbol)
        .eq('exchange', 'upbit')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(item => ({
        priceKrw: item.price_krw ? Number(item.price_krw) : null,
        priceUsd: item.price_usd ? Number(item.price_usd) : null,
        change24h: item.change_24h ? Number(item.change_24h) : null,
        timestamp: item.created_at,
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!symbol,
  });
}
