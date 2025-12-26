'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useKeyStatisticsHistory } from '@/lib/hooks/useKeyStatistics';
import type { KeyStatistic } from '@/lib/types/key-statistics';

interface StatisticHistoryModalProps {
  keystatName: string | null;
  open: boolean;
  onClose: () => void;
}

interface ChartDataPoint {
  cycle: string;
  formattedCycle: string;
  value: number | null;
}

function formatCycle(cycle: string): string {
  if (!cycle) return '-';
  // 202003 -> 2020.03
  if (cycle.length === 6) {
    return `${cycle.slice(0, 4)}.${cycle.slice(4, 6)}`;
  }
  // 2020Q1 -> 2020 Q1
  if (cycle.includes('Q')) {
    return cycle.replace('Q', ' Q');
  }
  // 2020 -> 2020
  return cycle;
}

function parseValue(dataValue: string | null): number | null {
  if (!dataValue) return null;
  // Remove commas and parse
  const cleaned = dataValue.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function transformToChartData(data: KeyStatistic[]): ChartDataPoint[] {
  return data.map((item) => ({
    cycle: item.cycle,
    formattedCycle: formatCycle(item.cycle),
    value: parseValue(item.data_value),
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, unit }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">{data.payload.formattedCycle}</p>
      <p className="text-sm">
        <span className="text-muted-foreground">값: </span>
        <span className="font-medium">
          {data.value?.toLocaleString() ?? '-'}
          {unit && ` ${unit}`}
        </span>
      </p>
    </div>
  );
}

function calculateChange(data: KeyStatistic[]): {
  change: number | null;
  changePercent: number | null;
} {
  if (data.length < 2) return { change: null, changePercent: null };

  const latest = parseValue(data[data.length - 1].data_value);
  const previous = parseValue(data[data.length - 2].data_value);

  if (latest === null || previous === null) {
    return { change: null, changePercent: null };
  }

  const change = latest - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : null;

  return { change, changePercent };
}

export function StatisticHistoryModal({
  keystatName,
  open,
  onClose,
}: StatisticHistoryModalProps) {
  const { data, isLoading, error } = useKeyStatisticsHistory(keystatName);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return transformToChartData(data);
  }, [data]);

  const latestData = data && data.length > 0 ? data[data.length - 1] : null;
  const { change, changePercent } = useMemo(() => {
    if (!data) return { change: null, changePercent: null };
    return calculateChange(data);
  }, [data]);

  const hasEnoughData = data && data.length >= 2;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{keystatName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="animate-pulse text-muted-foreground">
                데이터 로딩 중...
              </div>
            </div>
          )}

          {error && (
            <div className="h-[300px] flex items-center justify-center bg-destructive/10 rounded-lg">
              <div className="text-destructive text-center">
                <p className="font-medium">데이터 로드 실패</p>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && !hasEnoughData && (
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-muted-foreground text-center">
                <p className="font-medium">아직 충분한 히스토리가 없습니다</p>
                <p className="text-sm mt-1">
                  {data?.length === 1
                    ? '현재 1개의 데이터포인트만 있습니다.'
                    : '시간이 지나면 자동으로 히스토리가 축적됩니다.'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && hasEnoughData && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedCycle"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                  width={70}
                />
                <Tooltip content={<CustomTooltip unit={latestData?.unit_name || ''} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={chartData.length <= 12}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Summary Footer */}
          {latestData && (
            <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
              <div>
                <span className="text-muted-foreground">최신값: </span>
                <span className="font-medium font-mono">
                  {latestData.data_value || '-'}
                  {latestData.unit_name && ` ${latestData.unit_name}`}
                </span>
              </div>
              {change !== null && (
                <div>
                  <span className="text-muted-foreground">변동: </span>
                  <span
                    className={`font-medium font-mono ${
                      change > 0
                        ? 'text-emerald-600'
                        : change < 0
                          ? 'text-red-600'
                          : ''
                    }`}
                  >
                    {change > 0 ? '+' : ''}
                    {change.toFixed(2)}
                    {changePercent !== null && (
                      <span className="text-muted-foreground ml-1">
                        ({changePercent > 0 ? '+' : ''}
                        {changePercent.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">시점: </span>
                <span className="font-medium">
                  {formatCycle(latestData.cycle)}
                </span>
              </div>
              {data && (
                <div>
                  <span className="text-muted-foreground">데이터포인트: </span>
                  <span className="font-medium">{data.length}개</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
