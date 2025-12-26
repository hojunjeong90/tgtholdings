'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { StockPriceData } from '@/lib/hooks/useStockPrices';

interface StockCandleChartProps {
  data: StockPriceData[];
  className?: string;
}

interface CandleData {
  date: string;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
  // 캔들 렌더링용 (스택 바 방식)
  spacer: number;            // Y축 최소값에서 저가까지 (투명)
  lowerWick: number;         // 저가에서 몸통 하단까지
  body: number;              // 몸통 높이
  upperWick: number;         // 몸통 상단에서 고가까지
}

export function StockCandleChart({ data, className }: StockCandleChartProps) {
  // Y축 도메인 및 기간 통계 계산
  const periodStats = useMemo(() => {
    if (data.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 100,
        maxVolume: 1000,
        periodLow: 0,
        periodLowDate: '',
        periodHigh: 0,
        periodHighDate: '',
      };
    }

    const volumes = data.map((d) => d.volume);

    // 기간 저점/고점 찾기 (종가 기준)
    let periodLow = Infinity;
    let periodLowDate = '';
    let periodHigh = -Infinity;
    let periodHighDate = '';

    data.forEach((d) => {
      if (d.low < periodLow) {
        periodLow = d.low;
        periodLowDate = d.date;
      }
      if (d.high > periodHigh) {
        periodHigh = d.high;
        periodHighDate = d.date;
      }
    });

    const padding = (periodHigh - periodLow) * 0.08;

    return {
      minPrice: periodLow - padding,
      maxPrice: periodHigh + padding,
      maxVolume: Math.max(...volumes),
      periodLow,
      periodLowDate,
      periodHigh,
      periodHighDate,
    };
  }, [data]);

  const { minPrice, maxPrice, maxVolume, periodLow, periodLowDate, periodHigh, periodHighDate } = periodStats;

  // 데이터 변환 - 스택 바 방식으로 캔들 표현
  const chartData = useMemo<CandleData[]>(() => {
    return data.map((item) => {
      const isUp = item.close >= item.open;
      const bodyBottom = Math.min(item.open, item.close);
      const bodyTop = Math.max(item.open, item.close);

      return {
        date: new Date(item.date).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        isUp,
        // 스택: [spacer] + [lowerWick] + [body] + [upperWick]
        spacer: item.low - minPrice,           // 최소값에서 저가까지 (투명)
        lowerWick: bodyBottom - item.low,       // 저가에서 몸통 하단까지
        body: Math.max(bodyTop - bodyBottom, 0.5), // 몸통 높이 (최소값 보장)
        upperWick: item.high - bodyTop,         // 몸통 상단에서 고가까지
      };
    });
  }, [data, minPrice]);

  // 최근 종가 및 기간 대비 퍼센트 계산
  const latestPrice = chartData[chartData.length - 1]?.close ?? 0;

  // 저점 대비 현재가 %
  const fromLowPercent = periodLow > 0
    ? ((latestPrice - periodLow) / periodLow * 100).toFixed(1)
    : '0.0';

  // 고점 대비 현재가 %
  const fromHighPercent = periodHigh > 0
    ? ((latestPrice - periodHigh) / periodHigh * 100).toFixed(1)
    : '0.0';

  // 저점 대비 고점 % (기간 변동폭)
  const highLowRange = periodLow > 0
    ? ((periodHigh - periodLow) / periodLow * 100).toFixed(1)
    : '0.0';

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 가격 정보 헤더 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold">
            {latestPrice.toLocaleString('ko-KR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">
              저점 대비 +{fromLowPercent}%
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-red-500">
              고점 대비 {fromHighPercent}%
            </span>
          </div>
        </div>

        {/* 기간 저점/고점 정보 */}
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded font-medium">저점</span>
            <span className="font-medium">{periodLow.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">({formatDate(periodLowDate)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-medium">고점</span>
            <span className="font-medium">{periodHigh.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">({formatDate(periodHighDate)})</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{chartData.length}주 데이터</span>
          <span>·</span>
          <span>기간 변동폭 {highLowRange}%</span>
        </div>
      </div>

      {/* 캔들차트 - 스택 바 방식 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 50, left: 10, bottom: 0 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, maxPrice - minPrice]}
              orientation="right"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                (value + minPrice).toLocaleString('ko-KR', { maximumFractionDigits: 0 })
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as CandleData;
                return (
                  <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium mb-2">{d.fullDate}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">시가</span>
                      <span className="text-right">{d.open.toLocaleString()}</span>
                      <span className="text-muted-foreground">고가</span>
                      <span className="text-right text-green-500">
                        {d.high.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">저가</span>
                      <span className="text-right text-red-500">
                        {d.low.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">종가</span>
                      <span className="text-right font-medium">
                        {d.close.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">거래량</span>
                      <span className="text-right">
                        {d.volume.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* 스택 1: 스페이서 (Y축 최소값 → 저가, 투명) */}
            <Bar
              dataKey="spacer"
              stackId="candle"
              fill="transparent"
              isAnimationActive={false}
            />

            {/* 스택 2: 하단 심지 (저가 → 몸통 하단) */}
            <Bar
              dataKey="lowerWick"
              stackId="candle"
              isAnimationActive={false}
              barSize={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`wick-low-${index}`}
                  fill={entry.isUp ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>

            {/* 스택 3: 몸통 (시가 ↔ 종가) */}
            <Bar
              dataKey="body"
              stackId="candle"
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`body-${index}`}
                  fill={entry.isUp ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>

            {/* 스택 4: 상단 심지 (몸통 상단 → 고가) */}
            <Bar
              dataKey="upperWick"
              stackId="candle"
              isAnimationActive={false}
              barSize={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`wick-high-${index}`}
                  fill={entry.isUp ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>

            {/* 기간 저점 라인 */}
            <ReferenceLine
              y={periodLow - minPrice}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1}
              strokeOpacity={0.5}
            />

            {/* 기간 고점 라인 */}
            <ReferenceLine
              y={periodHigh - minPrice}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={1}
              strokeOpacity={0.5}
            />

            {/* 현재가 라인 */}
            <ReferenceLine
              y={latestPrice - minPrice}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 거래량 차트 */}
      <div className="h-20 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
          >
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, maxVolume * 1.1]}
              orientation="right"
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            <Tooltip content={() => null} />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`vol-${index}`}
                  fill={entry.isUp ? '#22c55e' : '#ef4444'}
                  opacity={0.5}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 스켈레톤 컴포넌트
export function StockCandleChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded mt-2" />
      </div>
      <div className="h-80 bg-muted/50 rounded" />
      <div className="h-20 bg-muted/30 rounded mt-2" />
    </div>
  );
}
