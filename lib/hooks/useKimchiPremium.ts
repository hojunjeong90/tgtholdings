'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type { KimchiPremium } from '@/lib/types/crypto';
import { getCoinName, PRIORITY_COINS } from '@/lib/types/crypto';

/**
 * 김치프리미엄을 계산하는 React Query 훅
 * - 업비트 KRW 가격과 해외 거래소 USD 가격 비교
 * - 실시간 USD/KRW 환율 적용
 *
 * 공식: ((업비트_KRW - 해외_USD × USD/KRW) / (해외_USD × USD/KRW)) × 100
 */
export function useKimchiPremium() {
  return useQuery({
    queryKey: ['kimchi-premium', 'latest'],
    queryFn: async (): Promise<KimchiPremium[]> => {
      const supabase = createClient();

      // 최근 10분 이내 데이터만 조회
      const tenMinutesAgo = new Date();
      tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

      // 병렬로 데이터 조회
      const [upbitResult, coingeckoResult, exchangeRateResult] = await Promise.all([
        // 업비트 KRW 가격
        supabase
          .from('crypto_prices')
          .select('symbol, price_krw, created_at')
          .eq('exchange', 'upbit')
          .gte('created_at', tenMinutesAgo.toISOString())
          .order('created_at', { ascending: false }),

        // CoinGecko USD 가격
        supabase
          .from('crypto_prices')
          .select('symbol, price_usd, created_at')
          .eq('exchange', 'coingecko')
          .gte('created_at', tenMinutesAgo.toISOString())
          .order('created_at', { ascending: false }),

        // USD/KRW 환율 (기존 exchange_rates 테이블)
        supabase
          .from('exchange_rates')
          .select('rate')
          .eq('from_currency', 'USD')
          .eq('to_currency', 'KRW')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      if (upbitResult.error) throw upbitResult.error;
      if (coingeckoResult.error) throw coingeckoResult.error;
      if (exchangeRateResult.error) throw exchangeRateResult.error;

      const exchangeRate = Number(exchangeRateResult.data?.rate) || 1400; // 기본값

      // 심볼별로 최신 데이터만 추출
      const upbitMap = new Map<string, number>();
      for (const item of upbitResult.data || []) {
        if (!upbitMap.has(item.symbol) && item.price_krw) {
          upbitMap.set(item.symbol, Number(item.price_krw));
        }
      }

      const coingeckoMap = new Map<string, { priceUsd: number; timestamp: string }>();
      for (const item of coingeckoResult.data || []) {
        if (!coingeckoMap.has(item.symbol) && item.price_usd) {
          coingeckoMap.set(item.symbol, {
            priceUsd: Number(item.price_usd),
            timestamp: item.created_at,
          });
        }
      }

      // 김치프리미엄 계산
      const premiums: KimchiPremium[] = [];

      // 우선 표시 코인을 먼저 처리
      const allSymbols = [...upbitMap.keys()];
      const sortedSymbols = allSymbols.sort((a, b) => {
        const aIdx = PRIORITY_COINS.indexOf(a);
        const bIdx = PRIORITY_COINS.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });

      for (const symbol of sortedSymbols) {
        const upbitPrice = upbitMap.get(symbol);
        const coingeckoData = coingeckoMap.get(symbol);

        if (!upbitPrice || !coingeckoData) continue;

        const { priceUsd, timestamp } = coingeckoData;
        const priceKrwFromUsd = priceUsd * exchangeRate;
        const premiumKrw = upbitPrice - priceKrwFromUsd;
        const premiumPercent = (premiumKrw / priceKrwFromUsd) * 100;

        premiums.push({
          symbol,
          name: getCoinName(symbol),
          upbitPriceKrw: upbitPrice,
          binancePriceUsd: priceUsd, // CoinGecko 가격을 대신 사용
          binancePriceKrw: priceKrwFromUsd,
          exchangeRate,
          premiumPercent,
          premiumKrw,
          updatedAt: timestamp,
        });
      }

      return premiums;
    },
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
}

/**
 * 김치프리미엄 히스토리를 가져오는 훅
 */
export function useKimchiPremiumHistory(symbol: string, days: number = 7) {
  return useQuery({
    queryKey: ['kimchi-premium-history', symbol, days],
    queryFn: async () => {
      // 히스토리 테이블에서 조회 (향후 구현)
      // 현재는 빈 배열 반환
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!symbol,
  });
}
