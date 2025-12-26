'use client';

import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CurrencyCode, CurrencyInfo, RateTrend } from '@/lib/types/exchange-rate';
import {
  formatCurrency,
  formatRate,
  formatPercent,
} from '@/lib/hooks/useExchangeRates';
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CurrencyCardProps {
  currency: CurrencyInfo;
  amount: number;
  trend: RateTrend;
  isActive: boolean;
  onAmountChange: (currency: CurrencyCode, amount: number) => void;
  onFocus: (currency: CurrencyCode) => void;
}

export function CurrencyCard({
  currency,
  amount,
  trend,
  isActive,
  onAmountChange,
  onFocus,
}: CurrencyCardProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '');
      const numValue = parseFloat(value) || 0;
      onAmountChange(currency.code, numValue);
    },
    [currency.code, onAmountChange]
  );

  const handleFocus = useCallback(() => {
    onFocus(currency.code);
  }, [currency.code, onFocus]);

  // 표시용 포맷
  const displayValue = isActive
    ? amount === 0
      ? ''
      : amount.toString()
    : formatCurrency(amount, currency.code);

  // 시그널 색상
  const signalColor =
    trend.signal === '유리'
      ? 'bg-green-500/10 text-green-600 border-green-500/30'
      : trend.signal === '불리'
        ? 'bg-red-500/10 text-red-600 border-red-500/30'
        : 'bg-slate-500/10 text-slate-600 border-slate-500/30';

  // KRW는 간소화된 카드
  if (currency.code === 'KRW') {
    return (
      <Card
        className={cn(
          'p-4 transition-all cursor-pointer hover:shadow-md',
          isActive && 'ring-2 ring-primary shadow-md'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-[80px]">
            <span className="text-2xl">{currency.flag}</span>
            <div>
              <div className="font-bold text-sm">{currency.code}</div>
              <div className="text-[10px] text-muted-foreground">기준</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm min-w-[20px]">
                {currency.symbol}
              </span>
              <Input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                className="text-right text-lg font-mono border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-3 transition-all cursor-pointer hover:shadow-md',
        isActive && 'ring-2 ring-primary shadow-md'
      )}
    >
      {/* 상단: 통화 정보 + 시그널 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currency.flag}</span>
          <div>
            <div className="font-bold text-sm">{currency.code}</div>
            <div className="text-[10px] text-muted-foreground truncate max-w-[60px]">
              {currency.name}
            </div>
          </div>
        </div>
        {/* 시그널 뱃지 */}
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded border',
            signalColor
          )}
        >
          {trend.signal}
        </span>
      </div>

      {/* 금액 입력 */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-muted-foreground text-sm min-w-[20px]">
          {currency.symbol}
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className="text-right text-lg font-mono border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8"
          placeholder="0"
        />
      </div>

      {/* 현재 환율 */}
      <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
        <span>1 {currency.code}</span>
        <span className="font-mono">{formatRate(trend.current)} KRW</span>
      </div>

      {/* 스파크라인 + 트렌드 */}
      <div className="flex items-center gap-2 mb-2 pt-2 border-t">
        <Sparkline
          data={trend.history}
          width={70}
          height={24}
          trend={trend.trend4w}
        />
        <div className="flex-1 text-right">
          <TrendIndicator
            label="1W"
            pct={trend.pct1w}
            direction={trend.trend1w}
          />
          <TrendIndicator
            label="2W"
            pct={trend.pct2w}
            direction={trend.trend2w}
          />
          <TrendIndicator
            label="4W"
            pct={trend.pct4w}
            direction={trend.trend4w}
          />
        </div>
      </div>

      {/* 평균 비교 */}
      <div className="grid grid-cols-3 gap-1 pt-2 border-t text-[10px]">
        <div className="text-muted-foreground">
          <span className="opacity-70">1W</span>
          <div className="font-mono text-foreground">{formatRate(trend.avg1w)}</div>
        </div>
        <div className="text-muted-foreground">
          <span className="opacity-70">2W</span>
          <div className="font-mono text-foreground">{formatRate(trend.avg2w)}</div>
        </div>
        <div className="text-muted-foreground">
          <span className="opacity-70">4W</span>
          <div className="font-mono text-foreground">{formatRate(trend.avg4w)}</div>
        </div>
      </div>
    </Card>
  );
}

// 트렌드 인디케이터 컴포넌트
function TrendIndicator({
  label,
  pct,
  direction,
}: {
  label: string;
  pct: number;
  direction: 'up' | 'down' | 'neutral';
}) {
  const colorClass =
    direction === 'up'
      ? 'text-red-500'
      : direction === 'down'
        ? 'text-green-500'
        : 'text-slate-500';

  const Icon =
    direction === 'up'
      ? TrendingUp
      : direction === 'down'
        ? TrendingDown
        : Minus;

  return (
    <div className={cn('flex items-center justify-end gap-1 text-[10px]', colorClass)}>
      <span className="text-muted-foreground opacity-70">{label}</span>
      <Icon className="h-3 w-3" />
      <span className="font-mono font-medium w-[45px] text-right">
        {formatPercent(pct)}
      </span>
    </div>
  );
}
