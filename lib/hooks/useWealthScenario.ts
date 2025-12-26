'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import {
  SCENARIO_INDICATORS,
  type IndicatorId,
  type ScenarioTrendData,
  type ScenarioKPIData,
  type ScenarioStep,
} from '@/lib/types/wealth-scenario';

/**
 * 부의 시나리오 대시보드 데이터를 가져오는 훅
 *
 * Phase 1: 기존 테이블 활용 (금리, 환율)
 * Phase 2: 신규 테이블 추가 (wealth_scenario_indicators)
 */
export function useWealthScenario() {
  return useQuery({
    queryKey: ['wealth-scenario'],
    queryFn: async () => {
      const supabase = createClient();

      // 1. 기존 테이블에서 금리 데이터 가져오기
      const { data: rateData, error: rateError } = await supabase
        .from('monetary_indicators')
        .select('*')
        .eq('indicator_type', 'interest_rate')
        .order('date', { ascending: true });

      if (rateError) console.error('Rate data error:', rateError);

      // 2. 기존 테이블에서 환율 데이터 가져오기
      const { data: exchangeData, error: exchangeError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', 'USD')
        .eq('to_currency', 'KRW')
        .order('created_at', { ascending: true });

      if (exchangeError) console.error('Exchange data error:', exchangeError);

      // 3. 신규 테이블에서 추가 지표 가져오기 (Phase 2)
      const { data: scenarioData, error: scenarioError } = await supabase
        .from('wealth_scenario_indicators')
        .select('*')
        .order('date', { ascending: true });

      // 테이블이 없으면 무시
      if (scenarioError && !scenarioError.message.includes('does not exist')) {
        console.error('Scenario data error:', scenarioError);
      }

      // 데이터 변환
      const trendDataMap: Partial<Record<IndicatorId, ScenarioTrendData>> = {};

      // 금리 데이터 변환
      if (rateData) {
        // 미국 금리 (US)
        const usRates = rateData.filter((d) => d.country_code === 'US');
        if (usRates.length > 0) {
          trendDataMap.fed_rate = transformToTrendData('fed_rate', usRates);
        }

        // 한국 금리 (KR)
        const krRates = rateData.filter((d) => d.country_code === 'KR');
        if (krRates.length > 0) {
          trendDataMap.bok_rate = transformToTrendData('bok_rate', krRates);
        }
      }

      // 환율 데이터 변환
      if (exchangeData && exchangeData.length > 0) {
        trendDataMap.usd_krw = transformExchangeToTrendData(exchangeData);
      }

      // 신규 테이블 데이터 변환
      if (scenarioData && scenarioData.length > 0) {
        const grouped = groupByIndicator(scenarioData);
        for (const [indicatorId, data] of Object.entries(grouped)) {
          trendDataMap[indicatorId as IndicatorId] = transformToTrendData(
            indicatorId as IndicatorId,
            data
          );
        }
      }

      // KPI 데이터 계산
      const kpiData = calculateKPIData(trendDataMap);

      return {
        indicators: trendDataMap,
        kpi: kpiData,
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 60 * 1000, // 60초
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });
}

/**
 * 단계별 지표 데이터 가져오기
 */
export function useStepIndicators(step: ScenarioStep) {
  const { data, isLoading, error } = useWealthScenario();

  const stepIndicators = SCENARIO_INDICATORS;
  const indicatorIds = Object.values(stepIndicators)
    .filter((ind) => ind.step === step)
    .map((ind) => ind.id);

  return {
    indicators: indicatorIds.map((id) => ({
      config: SCENARIO_INDICATORS[id],
      data: data?.indicators[id],
    })),
    isLoading,
    error,
  };
}

// ============ 유틸리티 함수 ============

interface RawDataPoint {
  date?: string;
  created_at?: string;
  value?: number;
  rate?: number;
  data_value?: string;
}

function transformToTrendData(
  indicatorId: IndicatorId,
  data: RawDataPoint[]
): ScenarioTrendData {
  const history = data.map((d) => ({
    date: d.date || d.created_at || '',
    value: d.value ?? parseFloat(d.rate?.toString() || '0'),
  }));

  const current = history[history.length - 1]?.value ?? 0;
  const previous = history[history.length - 2]?.value ?? current;

  // 변동률 계산
  const getChangePercent = (idx: number) => {
    if (history.length <= idx) return 0;
    const oldValue = history[history.length - 1 - idx]?.value;
    if (!oldValue) return 0;
    return ((current - oldValue) / Math.abs(oldValue)) * 100;
  };

  return {
    indicator: indicatorId,
    current,
    previous,
    change1d: getChangePercent(1),
    change1w: getChangePercent(7),
    change1m: getChangePercent(30),
    change3m: getChangePercent(90),
    changeYtd: 0, // TODO: YTD 계산
    history,
    lastUpdated: history[history.length - 1]?.date || '',
  };
}

function transformExchangeToTrendData(data: RawDataPoint[]): ScenarioTrendData {
  const history = data.map((d) => ({
    date: d.created_at || '',
    value: parseFloat(d.rate?.toString() || '0'),
  }));

  const current = history[history.length - 1]?.value ?? 0;
  const previous = history[history.length - 2]?.value ?? current;

  const getChangePercent = (idx: number) => {
    if (history.length <= idx) return 0;
    const oldValue = history[history.length - 1 - idx]?.value;
    if (!oldValue) return 0;
    return ((current - oldValue) / Math.abs(oldValue)) * 100;
  };

  return {
    indicator: 'usd_krw',
    current,
    previous,
    change1d: getChangePercent(1),
    change1w: getChangePercent(7),
    change1m: getChangePercent(30),
    change3m: getChangePercent(90),
    changeYtd: 0,
    history,
    lastUpdated: history[history.length - 1]?.date || '',
  };
}

function groupByIndicator(data: { indicator_id: string; date: string; value: number }[]) {
  const grouped: Record<string, RawDataPoint[]> = {};
  for (const item of data) {
    if (!grouped[item.indicator_id]) {
      grouped[item.indicator_id] = [];
    }
    grouped[item.indicator_id].push({
      date: item.date,
      value: item.value,
    });
  }
  return grouped;
}

function calculateKPIData(
  indicators: Partial<Record<IndicatorId, ScenarioTrendData>>
): ScenarioKPIData {
  // 금리 국면 판단
  const fedRateChange = indicators.fed_rate?.change3m ?? 0;
  const policyStance: ScenarioKPIData['policyStance'] =
    fedRateChange > 0.25 ? '긴축' : fedRateChange < -0.25 ? '완화' : '중립';

  // 유동성 추세 (임시: 금리 역방향으로 추정)
  const liquidityTrend: ScenarioKPIData['liquidityTrend'] =
    fedRateChange > 0.25 ? '축소' : fedRateChange < -0.25 ? '확장' : '유지';

  // 달러 강도 (USD/KRW 변화로 추정)
  const usdKrwChange = indicators.usd_krw?.change1m ?? 0;
  const dollarStrength: ScenarioKPIData['dollarStrength'] =
    usdKrwChange > 1 ? '강세' : usdKrwChange < -1 ? '약세' : '중립';

  // 위험선호도 (임시: 달러 역방향)
  const riskAppetite: ScenarioKPIData['riskAppetite'] =
    dollarStrength === '약세' ? 'Risk-On' : dollarStrength === '강세' ? 'Risk-Off' : '중립';

  // 금리 곡선 (2Y-10Y 스프레드)
  const spread = indicators.spread_2y10y?.current;
  const yieldCurve: ScenarioKPIData['yieldCurve'] =
    spread !== undefined
      ? spread < 0
        ? '역전'
        : spread < 0.2
        ? '평탄'
        : '정상'
      : '정상';

  return {
    policyStance,
    liquidityTrend,
    dollarStrength,
    riskAppetite,
    yieldCurve,
    inversionDays: yieldCurve === '역전' ? 500 : undefined, // TODO: 실제 계산
  };
}
