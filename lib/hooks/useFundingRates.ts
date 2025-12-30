'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type { FundingRateInfo, FundingSignal } from '@/lib/types/crypto';
import { getFundingSignal, PRIORITY_COINS } from '@/lib/types/crypto';

/**
 * 펀딩비 데이터를 가져오는 React Query 훅
 * - Binance, Bybit 펀딩비
 * - 롱/숏 시그널 계산
 */
export function useFundingRates() {
  return useQuery({
    queryKey: ['funding-rates', 'latest'],
    queryFn: async (): Promise<FundingRateInfo[]> => {
      const supabase = createClient();

      // 최근 2시간 이내 데이터만 조회 (펀딩비는 8시간마다 갱신)
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const { data, error } = await supabase
        .from('funding_rates')
        .select('symbol, exchange, funding_rate, funding_time, open_interest, created_at')
        .gte('created_at', twoHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 심볼+거래소별 최신 데이터만 추출
      const latestBySymbolExchange = new Map<string, typeof data[0]>();
      for (const item of data || []) {
        const key = `${item.symbol}-${item.exchange}`;
        if (!latestBySymbolExchange.has(key)) {
          latestBySymbolExchange.set(key, item);
        }
      }

      // 심볼별로 그룹화
      const symbolData = new Map<string, {
        binance: typeof data[0] | null;
        bybit: typeof data[0] | null;
      }>();

      for (const item of latestBySymbolExchange.values()) {
        const symbol = item.symbol;
        if (!symbolData.has(symbol)) {
          symbolData.set(symbol, { binance: null, bybit: null });
        }
        const entry = symbolData.get(symbol)!;
        if (item.exchange === 'binance') {
          entry.binance = item;
        } else if (item.exchange === 'bybit') {
          entry.bybit = item;
        }
      }

      // 펀딩비 정보 생성
      const fundingInfos: FundingRateInfo[] = [];

      // 우선순위 정렬
      const allSymbols = [...symbolData.keys()];
      const sortedSymbols = allSymbols.sort((a, b) => {
        const aIdx = PRIORITY_COINS.indexOf(a);
        const bIdx = PRIORITY_COINS.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });

      for (const symbol of sortedSymbols) {
        const entry = symbolData.get(symbol)!;
        const binanceRate = entry.binance?.funding_rate
          ? Number(entry.binance.funding_rate)
          : null;
        const bybitRate = entry.bybit?.funding_rate
          ? Number(entry.bybit.funding_rate)
          : null;

        // 평균 펀딩비 계산
        let avgRate = 0;
        let count = 0;
        if (binanceRate !== null) {
          avgRate += binanceRate;
          count++;
        }
        if (bybitRate !== null) {
          avgRate += bybitRate;
          count++;
        }
        avgRate = count > 0 ? avgRate / count : 0;

        // 시그널 계산
        const signal = getFundingSignal(avgRate);

        // 다음 펀딩 시간 (가장 가까운 것)
        const nextFundingTime = entry.binance?.funding_time || entry.bybit?.funding_time || null;

        // 오픈 인터레스트 (있는 경우)
        const openInterest = entry.binance?.open_interest
          ? Number(entry.binance.open_interest)
          : entry.bybit?.open_interest
            ? Number(entry.bybit.open_interest)
            : null;

        fundingInfos.push({
          symbol,
          binanceRate,
          bybitRate,
          avgRate,
          nextFundingTime,
          signal,
          openInterest,
        });
      }

      return fundingInfos;
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });
}

/**
 * 펀딩비 시그널에 따른 스타일 반환
 */
export function getFundingSignalStyle(signal: FundingSignal): {
  color: string;
  bgColor: string;
  label: string;
} {
  switch (signal) {
    case 'long_heavy':
      return {
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900',
        label: '롱 과열',
      };
    case 'long':
      return {
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
        label: '롱 우세',
      };
    case 'neutral':
      return {
        color: 'text-slate-700 dark:text-slate-300',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        label: '중립',
      };
    case 'short':
      return {
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
        label: '숏 우세',
      };
    case 'short_heavy':
      return {
        color: 'text-purple-700 dark:text-purple-300',
        bgColor: 'bg-purple-100 dark:bg-purple-900',
        label: '숏 과열',
      };
  }
}
