'use client';

import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CurrencyCode, CurrencyInfo } from '@/lib/types/exchange-rate';
import {
  formatCurrency,
  getCurrencyDecimals,
} from '@/lib/hooks/useExchangeRates';

interface CurrencyCardProps {
  currency: CurrencyInfo;
  amount: number;
  rate: number; // KRW 기준 환율
  isActive: boolean; // 현재 입력 중인 통화인지
  onAmountChange: (currency: CurrencyCode, amount: number) => void;
  onFocus: (currency: CurrencyCode) => void;
}

export function CurrencyCard({
  currency,
  amount,
  rate,
  isActive,
  onAmountChange,
  onFocus,
}: CurrencyCardProps) {
  const decimals = getCurrencyDecimals(currency.code);

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

  // 표시용 포맷 (활성 상태가 아닐 때만 포맷팅)
  const displayValue = isActive
    ? amount === 0
      ? ''
      : amount.toString()
    : formatCurrency(amount, currency.code);

  return (
    <Card
      className={cn(
        'p-4 transition-all cursor-pointer hover:shadow-md',
        isActive && 'ring-2 ring-primary shadow-md'
      )}
    >
      <div className="flex items-center gap-3">
        {/* 국기 & 통화 정보 */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="text-2xl">{currency.flag}</span>
          <div>
            <div className="font-medium text-sm">{currency.code}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[70px]">
              {currency.name}
            </div>
          </div>
        </div>

        {/* 금액 입력 */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm min-w-[24px]">
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

      {/* 환율 정보 (KRW가 아닐 때만) */}
      {currency.code !== 'KRW' && (
        <div className="text-xs text-muted-foreground text-right mt-2 pt-2 border-t">
          1 {currency.code} = {formatCurrency(rate, 'KRW')} KRW
        </div>
      )}
    </Card>
  );
}
