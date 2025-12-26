'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type {
  IndicatorType,
  MonetaryIndicator,
  ChartDataPoint,
  CountryCode,
} from '@/lib/types/monetary-indicators';

interface UseMonetaryIndicatorsOptions {
  startDate?: string;
  endDate?: string;
  countries?: CountryCode[];
}

/**
 * 통화 지표 데이터를 가져오는 React Query 훅
 */
export function useMonetaryIndicators(
  indicatorType: IndicatorType,
  options?: UseMonetaryIndicatorsOptions
) {
  return useQuery({
    queryKey: ['monetary-indicators', indicatorType, options],
    queryFn: async () => {
      const supabase = createClient();

      let query = supabase
        .from('monetary_indicators')
        .select('*')
        .eq('indicator_type', indicatorType)
        .order('date', { ascending: true });

      if (options?.countries && options.countries.length > 0) {
        query = query.in('country_code', options.countries);
      }
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MonetaryIndicator[];
    },
    staleTime: 60 * 1000, // 60초
  });
}

/**
 * 차트용 데이터로 변환
 */
export function transformToChartData(
  data: MonetaryIndicator[]
): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  for (const item of data) {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, { date: item.date });
    }

    const point = dateMap.get(item.date)!;
    point[item.country_code as CountryCode] = item.value;
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * 모든 지표 타입의 데이터를 가져오는 훅
 */
export function useAllIndicators(options?: UseMonetaryIndicatorsOptions) {
  const velocity = useMonetaryIndicators('velocity', options);
  const multiplier = useMonetaryIndicators('multiplier', options);
  const interestRate = useMonetaryIndicators('interest_rate', options);

  return {
    velocity,
    multiplier,
    interestRate,
    isLoading:
      velocity.isLoading || multiplier.isLoading || interestRate.isLoading,
    isError: velocity.isError || multiplier.isError || interestRate.isError,
  };
}
