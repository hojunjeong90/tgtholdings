'use client';

import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCryptoPrices } from '@/lib/hooks/useCryptoPrices';
import { useKimchiPremium } from '@/lib/hooks/useKimchiPremium';
import {
  PRIORITY_COINS,
  getCoinName,
  formatPriceKrw,
  formatChange,
  getPremiumStatus,
} from '@/lib/types/crypto';

export default function CryptoMarketPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bitcoin className="h-6 w-6" />
          암호화폐 마켓
        </h1>
        <p className="text-muted-foreground mt-1">
          실시간 가격과 김치프리미엄을 확인하세요
        </p>
      </div>

      {/* 김치프리미엄 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>김치프리미엄</CardTitle>
              <CardDescription>
                업비트 vs 해외 거래소 가격 차이
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<KimchiPremiumSkeleton />}>
            <KimchiPremiumSection />
          </Suspense>
        </CardContent>
      </Card>

      {/* 실시간 가격 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>실시간 가격</CardTitle>
              <CardDescription>
                주요 암호화폐 시세
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PriceTableSkeleton />}>
            <CryptoPriceSection />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function KimchiPremiumSection() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useKimchiPremium();

  if (isLoading) return <KimchiPremiumSkeleton />;
  if (error) return <ErrorMessage message="김치프리미엄 데이터를 불러오지 못했습니다" />;
  if (!data || data.length === 0) return <NoDataMessage />;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {lastUpdated && `마지막 업데이트: ${lastUpdated}`}
        </span>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          새로고침
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 6).map((item) => {
          const status = getPremiumStatus(item.premiumPercent);
          const statusColor =
            status === 'high'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : status === 'discount'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

          const Icon =
            item.premiumPercent > 0
              ? TrendingUp
              : item.premiumPercent < 0
              ? TrendingDown
              : Minus;

          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-sm">{item.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="font-medium">{item.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCoinName(item.symbol)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={statusColor}>
                  <Icon className="h-3 w-3 mr-1" />
                  {item.premiumPercent >= 0 ? '+' : ''}{item.premiumPercent.toFixed(2)}%
                </Badge>
                <div className="text-xs mt-1 text-muted-foreground">
                  {formatPriceKrw(item.upbitPriceKrw)}원
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CryptoPriceSection() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useCryptoPrices();

  if (isLoading) return <PriceTableSkeleton />;
  if (error) return <ErrorMessage message="가격 데이터를 불러오지 못했습니다" />;
  if (!data || data.length === 0) return <NoDataMessage />;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')
    : null;

  // 우선순위 코인을 먼저 표시
  const sortedData = [...data].sort((a, b) => {
    const aIdx = PRIORITY_COINS.indexOf(a.symbol);
    const bIdx = PRIORITY_COINS.indexOf(b.symbol);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {lastUpdated && `마지막 업데이트: ${lastUpdated}`}
        </span>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          새로고침
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th className="text-left py-3 px-2">코인</th>
              <th className="text-right py-3 px-2">가격 (KRW)</th>
              <th className="text-right py-3 px-2">가격 (USD)</th>
              <th className="text-right py-3 px-2">24h 변동</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => {
              const changeColor =
                (item.change24h ?? 0) > 0
                  ? 'text-green-600'
                  : (item.change24h ?? 0) < 0
                  ? 'text-red-600'
                  : 'text-muted-foreground';

              return (
                <tr
                  key={item.symbol}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCoinName(item.symbol)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    {item.upbitPriceKrw
                      ? `${formatPriceKrw(item.upbitPriceKrw)}원`
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                    {item.coingeckoPriceUsd
                      ? `$${item.coingeckoPriceUsd.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className={`text-right py-3 px-2 font-mono ${changeColor}`}>
                    {item.change24h != null ? formatChange(item.change24h) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton Components
function KimchiPremiumSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="w-12 h-4 bg-muted rounded" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PriceTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="w-20 h-4 bg-muted rounded" />
            <div className="w-16 h-3 bg-muted rounded" />
          </div>
          <div className="w-24 h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-destructive">
      {message}
    </div>
  );
}

function NoDataMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <p>데이터가 없습니다</p>
      <p className="text-sm">Edge Function이 실행되면 데이터가 표시됩니다</p>
    </div>
  );
}
