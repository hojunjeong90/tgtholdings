'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyCard } from '@/components/tools/CurrencyCard';
import {
  useExchangeRatesWithTrend,
  convertCurrencyWithTrend,
} from '@/lib/hooks/useExchangeRates';
import {
  CURRENCY_INFO,
  ORDERED_CURRENCIES,
  type CurrencyCode,
} from '@/lib/types/exchange-rate';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ExchangeRatePage() {
  const {
    data: trends,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useExchangeRatesWithTrend();

  // 활성 통화 및 금액 상태
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('KRW');
  const [baseAmount, setBaseAmount] = useState<number>(1000000);

  // 각 통화별 환산 금액 계산
  const amounts = useMemo(() => {
    if (!trends) return {} as Record<CurrencyCode, number>;

    const result: Record<CurrencyCode, number> = {} as Record<
      CurrencyCode,
      number
    >;

    for (const currency of ORDERED_CURRENCIES) {
      result[currency] = convertCurrencyWithTrend(
        baseAmount,
        activeCurrency,
        currency,
        trends
      );
    }

    return result;
  }, [trends, activeCurrency, baseAmount]);

  // 금액 변경 핸들러
  const handleAmountChange = useCallback(
    (currency: CurrencyCode, amount: number) => {
      setActiveCurrency(currency);
      setBaseAmount(amount);
    },
    []
  );

  // 포커스 핸들러
  const handleFocus = useCallback((currency: CurrencyCode) => {
    setActiveCurrency(currency);
  }, []);

  // 마지막 업데이트 시간 포맷
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')
    : null;

  // 시그널 요약
  const signalSummary = useMemo(() => {
    if (!trends) return { favorable: 0, unfavorable: 0, neutral: 0 };
    let favorable = 0,
      unfavorable = 0,
      neutral = 0;
    for (const code of ORDERED_CURRENCIES) {
      if (code === 'KRW') continue;
      const signal = trends[code]?.signal;
      if (signal === '유리') favorable++;
      else if (signal === '불리') unfavorable++;
      else neutral++;
    }
    return { favorable, unfavorable, neutral };
  }, [trends]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">실시간 환율</h1>
          <p className="text-muted-foreground">환율 데이터를 불러오는 중...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ORDERED_CURRENCIES.map((code) => (
            <Card key={code} className="p-4 animate-pulse">
              <div className="h-32 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !trends) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">실시간 환율</h1>
          <p className="text-destructive">
            환율 데이터를 불러오는 데 실패했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">실시간 환율</h1>
          <p className="text-sm text-muted-foreground">
            12개 통화 · 1W/2W/4W 평균 비교 · 환전 시그널
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* 시그널 요약 바 */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-green-500" />
          <span className="text-xs">
            <span className="font-bold text-green-600">{signalSummary.favorable}</span>
            <span className="text-muted-foreground ml-1">유리</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-slate-500" />
          <span className="text-xs">
            <span className="font-bold text-slate-600">{signalSummary.neutral}</span>
            <span className="text-muted-foreground ml-1">보통</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-red-500" />
          <span className="text-xs">
            <span className="font-bold text-red-600">{signalSummary.unfavorable}</span>
            <span className="text-muted-foreground ml-1">불리</span>
          </span>
        </div>
        <div className="flex-1" />
        {lastUpdated && (
          <span className="text-[10px] text-muted-foreground">
            {lastUpdated}
          </span>
        )}
      </div>

      {/* 통화 카드 그리드 */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ORDERED_CURRENCIES.map((code) => (
          <CurrencyCard
            key={code}
            currency={CURRENCY_INFO[code]}
            amount={amounts[code] || 0}
            trend={trends[code]}
            isActive={activeCurrency === code}
            onAmountChange={handleAmountChange}
            onFocus={handleFocus}
          />
        ))}
      </div>

      {/* 범례 */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>유리: 평균 대비 환율↓</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>불리: 평균 대비 환율↑</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>보통: 평균 수준</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">1W/2W/4W:</span>
              <span>1주/2주/4주 평균 대비 변동률</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
