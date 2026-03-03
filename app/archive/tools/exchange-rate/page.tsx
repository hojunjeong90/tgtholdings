'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyCard } from '@/components/tools/CurrencyCard';
import {
  useExchangeRates,
  convertCurrency,
} from '@/lib/hooks/useExchangeRates';
import {
  CURRENCY_INFO,
  ORDERED_CURRENCIES,
  type CurrencyCode,
} from '@/lib/types/exchange-rate';
import { RefreshCw } from 'lucide-react';

export default function ExchangeRatePage() {
  const {
    data: rates,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useExchangeRates();

  // 활성 통화 및 금액 상태
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('KRW');
  const [baseAmount, setBaseAmount] = useState<number>(1000000); // 기본 100만원

  // 각 통화별 환산 금액 계산
  const amounts = useMemo(() => {
    if (!rates) return {} as Record<CurrencyCode, number>;

    const result: Record<CurrencyCode, number> = {} as Record<
      CurrencyCode,
      number
    >;

    for (const currency of ORDERED_CURRENCIES) {
      result[currency] = convertCurrency(
        baseAmount,
        activeCurrency,
        currency,
        rates
      );
    }

    return result;
  }, [rates, activeCurrency, baseAmount]);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">실시간 환율</h1>
          <p className="text-muted-foreground">
            환율 데이터를 불러오는 중...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ORDERED_CURRENCIES.map((code) => (
            <Card key={code} className="p-4 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !rates) {
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">실시간 환율</h1>
          <p className="text-muted-foreground">
            금액을 입력하면 12개 통화로 자동 환산됩니다.
          </p>
        </div>

        {/* 새로고침 버튼 */}
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* 마지막 업데이트 */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          마지막 업데이트: {lastUpdated}
        </p>
      )}

      {/* 통화 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ORDERED_CURRENCIES.map((code) => (
          <CurrencyCard
            key={code}
            currency={CURRENCY_INFO[code]}
            amount={amounts[code] || 0}
            rate={rates[code] || 1}
            isActive={activeCurrency === code}
            onAmountChange={handleAmountChange}
            onFocus={handleFocus}
          />
        ))}
      </div>

      {/* 안내 카드 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>업데이트 주기:</strong> 1분마다 자동 갱신
            </p>
            <p>
              <strong>사용법:</strong> 원하는 통화 카드를 클릭하고 금액을
              입력하세요. 나머지 통화가 자동으로 환산됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
