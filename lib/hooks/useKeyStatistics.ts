'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type { KeyStatistic } from '@/lib/types/key-statistics';

interface UseKeyStatisticsOptions {
  className?: string;
}

/**
 * 100대 통계지표 데이터를 가져오는 React Query 훅
 * 각 통계명별 최신 데이터만 반환
 */
export function useKeyStatistics(options?: UseKeyStatisticsOptions) {
  return useQuery({
    queryKey: ['key-statistics', options],
    queryFn: async () => {
      const supabase = createClient();

      // 각 통계명별 최신 데이터만 가져오기 (cycle 기준 내림차순)
      let query = supabase
        .from('key_statistics')
        .select('*')
        .order('keystat_name', { ascending: true })
        .order('cycle', { ascending: false });

      if (options?.className) {
        query = query.eq('class_name', options.className);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 각 통계명별 최신 데이터만 필터링
      const latestByName = new Map<string, KeyStatistic>();
      for (const item of (data as KeyStatistic[]) || []) {
        if (!latestByName.has(item.keystat_name)) {
          latestByName.set(item.keystat_name, item);
        }
      }

      return Array.from(latestByName.values());
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 통계그룹 목록 가져오기
 */
export function useStatClassNames() {
  return useQuery({
    queryKey: ['key-statistics-classes'],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('key_statistics')
        .select('class_name')
        .order('class_name');

      if (error) throw error;

      // 중복 제거
      const uniqueClasses = [...new Set((data || []).map((d) => d.class_name))];
      return uniqueClasses;
    },
    staleTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * 특정 통계지표의 히스토리 데이터를 가져오는 훅
 * 시간순 정렬 (오래된 것부터)
 */
export function useKeyStatisticsHistory(keystatName: string | null) {
  return useQuery({
    queryKey: ['key-statistics-history', keystatName],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('key_statistics')
        .select('*')
        .eq('keystat_name', keystatName!)
        .order('cycle', { ascending: true }); // 오래된 것부터

      if (error) throw error;
      return data as KeyStatistic[];
    },
    enabled: !!keystatName,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
