'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import {
  ORDERED_CURRENCIES,
  type CurrencyCode,
  type ExchangeRateMap,
  type ExchangeRateTrendMap,
  type RateTrend,
  type TrendDirection,
  type TrendStrength,
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
 * 환율 + 트렌드 데이터를 가져오는 React Query 훅
 * - 21일치 히스토리 조회 (1주/2주 평균 정확히 계산)
 * - 1주/2주 평균 계산
 */
export function useExchangeRatesWithTrend() {
  return useQuery({
    queryKey: ['exchange-rates', 'with-trend'],
    queryFn: async (): Promise<ExchangeRateTrendMap> => {
      const supabase = createClient();
      const currencies = ORDERED_CURRENCIES.filter((c) => c !== 'KRW');

      // 35일 전 날짜 계산 (4주 + 여유분)
      const fiveWeeksAgo = new Date();
      fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

      // 35일치 데이터 조회 (Supabase 기본 제한 1000개 우회)
      // 여러 청크로 나눠서 가져오기
      const allData: { from_currency: string; rate: string; created_at: string }[] = [];
      let offset = 0;
      const batchSize = 1000;

      while (true) {
        const { data: batch, error } = await supabase
          .from('exchange_rates')
          .select('from_currency, rate, created_at')
          .in('from_currency', currencies)
          .eq('to_currency', 'KRW')
          .gte('created_at', fiveWeeksAgo.toISOString())
          .order('created_at', { ascending: true })
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!batch || batch.length === 0) break;

        allData.push(...batch);
        if (batch.length < batchSize) break; // 마지막 배치
        offset += batchSize;
      }

      const data = allData;

      // 통화별로 그룹화
      const grouped: Record<string, { rate: number; date: string }[]> = {};
      for (const item of data || []) {
        if (!grouped[item.from_currency]) {
          grouped[item.from_currency] = [];
        }
        grouped[item.from_currency].push({
          rate: Number(item.rate),
          date: item.created_at,
        });
      }

      // 각 통화별 트렌드 계산
      const trendMap: ExchangeRateTrendMap = {} as ExchangeRateTrendMap;

      // KRW는 특별 처리
      trendMap.KRW = {
        current: 1,
        avg1w: 1,
        avg2w: 1,
        avg4w: 1,
        diff1w: 0,
        diff2w: 0,
        diff4w: 0,
        pct1w: 0,
        pct2w: 0,
        pct4w: 0,
        trend1w: 'neutral',
        trend2w: 'neutral',
        trend4w: 'neutral',
        strength: 'weak',
        history: Array(28).fill(1),
        signal: '보통',
      };

      for (const currency of currencies) {
        const history = grouped[currency] || [];
        if (history.length === 0) continue;

        // 일별 종가로 집계 (하루에 24개 정도의 데이터 포인트 중 마지막 값 사용)
        const dailyCloseRates = aggregateDailyCloseRates(history);

        // 최신 환율
        const current = history[history.length - 1]?.rate || 0;

        // 일별 종가 데이터를 날짜순 정렬 (오래된 것 -> 최신)
        const sortedDaily = [...dailyCloseRates].sort((a, b) =>
          a.date.localeCompare(b.date)
        );

        // 최근 7일, 14일, 28일 데이터 (단순히 마지막 N개 사용)
        const oneWeekData = sortedDaily.slice(-7);
        const twoWeekData = sortedDaily.slice(-14);
        const fourWeekData = sortedDaily.slice(-28);

        // 평균 계산
        const avg1w = calculateAverage(oneWeekData.map((d) => d.rate));
        const avg2w = calculateAverage(twoWeekData.map((d) => d.rate));
        const avg4w = calculateAverage(fourWeekData.map((d) => d.rate));

        // 차이 및 변동률 계산
        const diff1w = current - avg1w;
        const diff2w = current - avg2w;
        const diff4w = current - avg4w;
        const pct1w = avg1w !== 0 ? (diff1w / avg1w) * 100 : 0;
        const pct2w = avg2w !== 0 ? (diff2w / avg2w) * 100 : 0;
        const pct4w = avg4w !== 0 ? (diff4w / avg4w) * 100 : 0;

        // 트렌드 방향
        const trend1w = getTrendDirection(pct1w);
        const trend2w = getTrendDirection(pct2w);
        const trend4w = getTrendDirection(pct4w);

        // 트렌드 강도 (4주 기준으로 변경)
        const strength = getTrendStrength(Math.abs(pct4w));

        // 시그널 결정 (현재가가 평균보다 낮으면 환전 유리)
        const signal = getSignal(pct1w, pct2w, pct4w);

        // 스파크라인용 28일 데이터
        const sparklineData = sortedDaily.slice(-28).map((d) => d.rate);
        while (sparklineData.length < 28) {
          sparklineData.unshift(sparklineData[0] || current);
        }

        trendMap[currency as CurrencyCode] = {
          current,
          avg1w,
          avg2w,
          avg4w,
          diff1w,
          diff2w,
          diff4w,
          pct1w,
          pct2w,
          pct4w,
          trend1w,
          trend2w,
          trend4w,
          strength,
          history: sparklineData,
          signal,
        };
      }

      return trendMap;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * 일별 종가(Close) 환율 집계
 * - 하루에 24개 정도의 데이터 포인트가 있음 (1시간마다)
 * - 각 날짜의 마지막 데이터를 종가로 사용
 */
function aggregateDailyCloseRates(
  history: { rate: number; date: string }[]
): { date: string; rate: number }[] {
  // 날짜별로 마지막 레코드(종가) 저장
  const dailyClose: Record<string, { rate: number; timestamp: string }> = {};

  for (const item of history) {
    // 날짜 문자열 안전하게 변환 (Date 객체 또는 문자열 모두 처리)
    const dateStr = typeof item.date === 'string'
      ? item.date
      : new Date(item.date).toISOString();

    // 날짜 추출: "2025-12-26..." 형식에서 앞 10자리 (YYYY-MM-DD)
    const dateKey = dateStr.slice(0, 10);

    // 해당 날짜의 기존 데이터보다 더 최신이면 교체 (종가 = 마지막 데이터)
    if (!dailyClose[dateKey] || dateStr > dailyClose[dateKey].timestamp) {
      dailyClose[dateKey] = {
        rate: item.rate,
        timestamp: dateStr,
      };
    }
  }

  // 날짜순 정렬 후 종가만 반환
  const sortedDates = Object.keys(dailyClose).sort();
  return sortedDates.map((date) => ({
    date,
    rate: dailyClose[date].rate,
  }));
}

/**
 * 평균 계산
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * 트렌드 방향 결정
 */
function getTrendDirection(pctChange: number): TrendDirection {
  if (pctChange > 0.1) return 'up';
  if (pctChange < -0.1) return 'down';
  return 'neutral';
}

/**
 * 트렌드 강도 결정
 */
function getTrendStrength(absPct: number): TrendStrength {
  if (absPct >= 2) return 'strong';
  if (absPct >= 0.5) return 'moderate';
  return 'weak';
}

/**
 * 환전 시그널 결정
 * - 현재가 < 평균 → 유리 (환전하기 좋음)
 * - 현재가 > 평균 → 불리 (환전 대기)
 */
function getSignal(pct1w: number, pct2w: number, pct4w: number): '유리' | '불리' | '보통' {
  const avgPct = (pct1w + pct2w + pct4w) / 3;
  if (avgPct < -0.5) return '유리';
  if (avgPct > 0.5) return '불리';
  return '보통';
}

/**
 * 통화 환산 유틸리티 함수
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRateMap
): number {
  if (fromCurrency === toCurrency) return amount;
  const toKRW = amount * rates[fromCurrency];
  const result = toKRW / rates[toCurrency];
  return result;
}

/**
 * 트렌드 기반 환산
 */
export function convertCurrencyWithTrend(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  trends: ExchangeRateTrendMap
): number {
  if (fromCurrency === toCurrency) return amount;
  const toKRW = amount * trends[fromCurrency].current;
  const result = toKRW / trends[toCurrency].current;
  return result;
}

/**
 * 통화별 소수점 자릿수
 */
export function getCurrencyDecimals(currency: CurrencyCode): number {
  switch (currency) {
    case 'KRW':
    case 'JPY':
      return 0;
    default:
      return 2;
  }
}

/**
 * 금액 포맷팅
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  const decimals = getCurrencyDecimals(currency);
  return amount.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 환율 포맷팅 (소수점 2자리)
 */
export function formatRate(rate: number): string {
  return rate.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}
