'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import type { CryptoEvent } from '@/lib/types/crypto';

/**
 * 암호화폐 일정 데이터를 가져오는 React Query 훅
 * - 토큰 언락, 상장, 에어드랍 등
 */
export function useCryptoEvents(month: Date) {
  // 해당 월의 시작일과 종료일 계산
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  return useQuery({
    queryKey: ['crypto-events', month.getFullYear(), month.getMonth()],
    queryFn: async (): Promise<CryptoEvent[]> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('crypto_events')
        .select('*')
        .gte('event_date', startOfMonth.toISOString().split('T')[0])
        .lte('event_date', endOfMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('importance', { ascending: false }); // high가 먼저

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });
}

/**
 * 다가오는 중요 이벤트를 가져오는 훅
 */
export function useUpcomingEvents(days: number = 7) {
  return useQuery({
    queryKey: ['crypto-events', 'upcoming', days],
    queryFn: async (): Promise<CryptoEvent[]> => {
      const supabase = createClient();

      const today = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabase
        .from('crypto_events')
        .select('*')
        .gte('event_date', today.toISOString().split('T')[0])
        .lte('event_date', endDate.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('importance', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
