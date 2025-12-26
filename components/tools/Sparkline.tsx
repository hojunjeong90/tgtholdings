'use client';

import { useMemo } from 'react';
import type { TrendDirection } from '@/lib/types/exchange-rate';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: TrendDirection;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  trend = 'neutral',
  className = '',
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }, [data, width, height]);

  // 그라데이션 영역용 path
  const areaPath = useMemo(() => {
    if (data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    const lastX = padding + chartWidth;
    const firstX = padding;
    const bottomY = height - padding;

    return `M${firstX},${bottomY} L${points.join(' L')} L${lastX},${bottomY} Z`;
  }, [data, width, height]);

  // 트렌드에 따른 색상
  const strokeColor =
    trend === 'up'
      ? '#ef4444' // 빨강 (환율 상승 = 불리)
      : trend === 'down'
        ? '#22c55e' // 초록 (환율 하락 = 유리)
        : '#94a3b8'; // 회색 (보합)

  const fillColor =
    trend === 'up'
      ? 'rgba(239, 68, 68, 0.1)'
      : trend === 'down'
        ? 'rgba(34, 197, 94, 0.1)'
        : 'rgba(148, 163, 184, 0.1)';

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* 영역 채우기 */}
      <path d={areaPath} fill={fillColor} />
      {/* 라인 */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 현재 포인트 */}
      {data.length > 0 && (
        <circle
          cx={width - 2}
          cy={
            2 +
            (height - 4) -
            ((data[data.length - 1] - Math.min(...data)) /
              (Math.max(...data) - Math.min(...data) || 1)) *
              (height - 4)
          }
          r={2.5}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
