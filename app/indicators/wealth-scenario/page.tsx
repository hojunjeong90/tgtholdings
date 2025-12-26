'use client';

import { useWealthScenario } from '@/lib/hooks/useWealthScenario';
import {
  WealthScenarioKPI,
  YieldCurveWarning,
} from '@/components/indicators/WealthScenarioKPI';
import {
  WealthScenarioSection,
  IndicatorGrid,
} from '@/components/indicators/WealthScenarioSection';
import {
  WealthScenarioChart,
  WealthScenarioChartSkeleton,
} from '@/components/indicators/WealthScenarioChart';
import {
  SCENARIO_INDICATORS,
  STEP_CONFIG,
  STEP_ORDER,
  type ScenarioStep,
} from '@/lib/types/wealth-scenario';

export default function WealthScenarioPage() {
  const { data, isLoading, error } = useWealthScenario();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">부의 시나리오</h1>
        <p className="text-muted-foreground mt-1">
          금리 → 유동성 → 환율 → 자산가격의 인과 흐름을 한눈에
        </p>
      </div>

      {/* KPI 요약 카드 */}
      <WealthScenarioKPI data={data?.kpi} isLoading={isLoading} />

      {/* 금리 역전 경고 배너 */}
      {data?.kpi?.yieldCurve && (
        <YieldCurveWarning
          yieldCurve={data.kpi.yieldCurve}
          inversionDays={data.kpi.inversionDays}
        />
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      )}

      {/* 4단계 흐름 레이아웃 */}
      <div className="space-y-0">
        {STEP_ORDER.map((step) => (
          <StepSection
            key={step}
            step={step}
            indicatorData={data?.indicators}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* 마지막 업데이트 시간 */}
      {data?.lastUpdated && (
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            마지막 업데이트: {new Date(data.lastUpdated).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}

interface StepSectionProps {
  step: ScenarioStep;
  indicatorData?: ReturnType<typeof useWealthScenario>['data'] extends infer T
    ? T extends { indicators: infer I }
      ? I
      : undefined
    : undefined;
  isLoading: boolean;
}

function StepSection({ step, indicatorData, isLoading }: StepSectionProps) {
  const config = STEP_CONFIG[step];
  const indicatorIds = config.indicators;

  // 자산시장 단계는 5열, 나머지는 4열
  const columns = step === 'assets' ? 5 : step === 'currency' ? 3 : 4;

  return (
    <WealthScenarioSection step={step}>
      <IndicatorGrid columns={columns as 3 | 4 | 5}>
        {indicatorIds.map((indicatorId) => {
          const indicator = SCENARIO_INDICATORS[indicatorId];
          const trendData = indicatorData?.[indicatorId];

          if (isLoading) {
            return <WealthScenarioChartSkeleton key={indicatorId} />;
          }

          return (
            <WealthScenarioChart
              key={indicatorId}
              indicator={indicator}
              data={trendData}
              onClick={() => {
                // TODO: 상세 모달 열기
                console.log('Open detail for:', indicatorId);
              }}
            />
          );
        })}
      </IndicatorGrid>
    </WealthScenarioSection>
  );
}
