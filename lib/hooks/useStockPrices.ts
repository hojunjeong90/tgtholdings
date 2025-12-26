'use client';

import { useQuery } from '@tanstack/react-query';

export interface StockPriceData {
  id: string;
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number | null;
  source: string;
}

interface FetchStockPricesResponse {
  success: boolean;
  fetched_new: boolean;
  fetched_count?: number;
  data: StockPriceData[];
  error?: string;
}

/**
 * 주식 주봉 데이터를 가져오는 훅
 * Edge Function을 호출하여 Yahoo Finance에서 데이터를 수집하고 반환
 */
export function useStockPrices(
  ticker: string,
  startDate: string,
  endDate: string
) {
  return useQuery<StockPriceData[] | null, Error>({
    queryKey: ['stock-prices', ticker, startDate, endDate],
    queryFn: async () => {
      if (!ticker) return null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-stock-prices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ticker,
            start_date: startDate,
            end_date: endDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stock prices: ${response.statusText}`);
      }

      const result: FetchStockPricesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      return result.data;
    },
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
  });
}

// 기간 타입 정의
export type PeriodType = '1Y' | '2Y' | '5Y' | 'ALL';

export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: '1Y', label: '1년' },
  { value: '2Y', label: '2년' },
  { value: '5Y', label: '5년' },
  { value: 'ALL', label: '전체' },
];

/**
 * 기간에 따른 시작일 계산
 */
function getStartDateByPeriod(period: PeriodType): string {
  const now = new Date();

  switch (period) {
    case '1Y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    case '2Y':
      return new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    case '5Y':
      return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    case 'ALL':
      return '1990-01-01'; // 충분히 오래된 날짜
    default:
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
  }
}

/**
 * 기간 선택 기반 데이터 훅
 */
export function useStockPricesByPeriod(ticker: string, period: PeriodType) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = getStartDateByPeriod(period);

  return useStockPrices(ticker, startDate, endDate);
}

/**
 * 1년치 데이터 기본값으로 가져오는 훅
 */
export function useStockPricesYearly(ticker: string) {
  return useStockPricesByPeriod(ticker, '1Y');
}
