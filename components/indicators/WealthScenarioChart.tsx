'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  STEP_CONFIG,
  formatIndicatorValue,
  formatChange,
  getChangeColor,
  type ScenarioIndicator,
  type ScenarioTrendData,
} from '@/lib/types/wealth-scenario';

interface WealthScenarioChartProps {
  indicator: ScenarioIndicator;
  data?: ScenarioTrendData;
  onClick?: () => void;
  className?: string;
}

export function WealthScenarioChart({
  indicator,
  data,
  onClick,
  className,
}: WealthScenarioChartProps) {
  const stepConfig = STEP_CONFIG[indicator.step];

  // 차트 데이터 변환
  const history = data?.history;
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      // 더미 데이터 (로딩/빈 상태용) - 고정된 패턴
      return Array(30)
        .fill(0)
        .map((_, i) => ({ value: 50 + (i % 5) * 2 }));
    }
    return history.map((point) => ({ value: point.value }));
  }, [history]);

  // Y축 도메인 계산
  const domain = useMemo(() => {
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  // 현재값과 변동률
  const currentValue = data?.current ?? 0;
  const changeValue = data?.change1m ?? 0;
  const isLoading = !data;

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border bg-card transition-all',
        'hover:shadow-md hover:border-primary/20 cursor-pointer',
        isLoading && 'animate-pulse',
        className
      )}
      onClick={onClick}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span
            className="text-xs font-medium"
            style={{ color: stepConfig.color }}
          >
            {indicator.shortName}
          </span>
          <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
            {indicator.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">
            {isLoading ? '---' : formatIndicatorValue(currentValue, indicator)}
          </p>
          <p
            className={cn(
              'text-[10px]',
              isLoading
                ? 'text-muted-foreground'
                : getChangeColor(changeValue, indicator.invertColor)
            )}
          >
            {isLoading ? '---' : formatChange(changeValue)}
          </p>
        </div>
      </div>

      {/* Sparkline 차트 */}
      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={stepConfig.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={stepConfig.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis domain={domain} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={stepConfig.color}
              strokeWidth={1.5}
              fill={`url(#gradient-${indicator.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 데이터 소스 뱃지 */}
      <div className="absolute bottom-1 right-1">
        <span className="text-[8px] text-muted-foreground/50">
          {indicator.source}
        </span>
      </div>
    </div>
  );
}

// 스켈레톤 컴포넌트
export function WealthScenarioChartSkeleton() {
  return (
    <div className="p-3 rounded-lg border bg-card animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-2 w-20 bg-muted rounded mt-1" />
        </div>
        <div className="text-right">
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="h-2 w-10 bg-muted rounded mt-1 ml-auto" />
        </div>
      </div>
      <div className="h-12 bg-muted/50 rounded" />
    </div>
  );
}
