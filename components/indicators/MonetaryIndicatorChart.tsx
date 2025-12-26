'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useMonetaryIndicators,
  transformToChartData,
} from '@/lib/hooks/useMonetaryIndicators';
import {
  COUNTRY_COLORS,
  COUNTRY_NAMES,
  formatDate,
  formatValue,
  getYAxisDomain,
} from '@/lib/utils/chart-helpers';
import type { IndicatorType, CountryCode } from '@/lib/types/monetary-indicators';
import { INDICATOR_INFO } from '@/lib/types/monetary-indicators';

interface MonetaryIndicatorChartProps {
  indicatorType: IndicatorType;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
  indicatorType: IndicatorType;
}

function CustomTooltip({ active, payload, label, indicatorType }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {COUNTRY_NAMES[entry.dataKey as CountryCode]}:
          </span>
          <span className="font-medium">
            {formatValue(entry.value, indicatorType)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="animate-pulse text-muted-foreground">
        데이터 로딩 중...
      </div>
    </div>
  );
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-destructive/10 rounded-lg">
      <div className="text-destructive text-center">
        <p className="font-medium">데이터 로드 실패</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="text-muted-foreground text-center">
        <p className="font-medium">데이터 없음</p>
        <p className="text-sm">Edge Function을 실행하여 데이터를 수집하세요</p>
      </div>
    </div>
  );
}

export function MonetaryIndicatorChart({
  indicatorType,
  height = 400,
}: MonetaryIndicatorChartProps) {
  const { data, isLoading, error } = useMonetaryIndicators(indicatorType);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return transformToChartData(data);
  }, [data]);

  // 사용 가능한 국가 확인
  const availableCountries = useMemo(() => {
    if (!data) return [];
    const countries = new Set(data.map((d) => d.country_code));
    return Array.from(countries) as CountryCode[];
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (error) return <ChartError message={error.message} />;
  if (!chartData.length) return <NoData />;

  const indicatorInfo = INDICATOR_INFO[indicatorType];
  const [yMin, yMax] = getYAxisDomain(indicatorType);

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-4">
        {indicatorInfo.description}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatValue(value, indicatorType)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[yMin, yMax]}
            width={60}
          />
          <Tooltip content={<CustomTooltip indicatorType={indicatorType} />} />
          <Legend
            formatter={(value) => COUNTRY_NAMES[value as CountryCode] || value}
          />

          {availableCountries.includes('US') && (
            <Line
              type="monotone"
              dataKey="US"
              name="US"
              stroke={COUNTRY_COLORS.US}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
          {availableCountries.includes('KR') && (
            <Line
              type="monotone"
              dataKey="KR"
              name="KR"
              stroke={COUNTRY_COLORS.KR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
          {availableCountries.includes('JP') && (
            <Line
              type="monotone"
              dataKey="JP"
              name="JP"
              stroke={COUNTRY_COLORS.JP}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
