'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import {
  ORDERED_CURRENCIES,
  type CurrencyCode,
  type ExchangeRateMap,
} from '@/lib/types/exchange-rate';

/**
 * 최신 환율 데이터를 가져오는 React Query 훅
 * - 12개 통화의 최신 환율만 조회
 * - KRW는 환율 1로 고정
 */
export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates', 'latest'],
    queryFn: async (): Promise<ExchangeRateMap> => {
      const supabase = createClient();

      // 지원 통화 목록 (KRW 제외 - KRW는 1로 고정)
      const currencies = ORDERED_CURRENCIES.filter((c) => c !== 'KRW');

      // 각 통화별 최신 환율 조회
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('from_currency, rate, created_at')
        .in('from_currency', currencies)
        .eq('to_currency', 'KRW')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 각 통화별 최신 환율만 추출
      const rateMap: ExchangeRateMap = { KRW: 1 } as ExchangeRateMap;
      const seen = new Set<string>();

      for (const item of data || []) {
        if (!seen.has(item.from_currency)) {
          seen.add(item.from_currency);
          rateMap[item.from_currency as CurrencyCode] = Number(item.rate);
        }
      }

      return rateMap;
    },
    staleTime: 60 * 1000, // 60초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
}

/**
 * 통화 환산 유틸리티 함수
 * @param amount 원본 금액
 * @param fromCurrency 원본 통화
 * @param toCurrency 대상 통화
 * @param rates 환율 맵
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRateMap
): number {
  if (fromCurrency === toCurrency) return amount;

  // 모든 환율은 X -> KRW 기준
  // fromCurrency -> KRW -> toCurrency
  const toKRW = amount * rates[fromCurrency];
  const result = toKRW / rates[toCurrency];

  return result;
}

/**
 * 통화별 소수점 자릿수
 */
export function getCurrencyDecimals(currency: CurrencyCode): number {
  switch (currency) {
    case 'KRW':
    case 'JPY':
      return 0; // 정수만
    default:
      return 2; // 소수점 2자리
  }
}

/**
 * 금액 포맷팅
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const decimals = getCurrencyDecimals(currency);
  return amount.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
