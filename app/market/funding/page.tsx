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
import { TrendingUp, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFundingRates, getFundingSignalStyle } from '@/lib/hooks/useFundingRates';
import { getCoinName, formatFundingRate } from '@/lib/types/crypto';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FundingRatePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          펀딩비
        </h1>
        <p className="text-muted-foreground mt-1">
          선물 시장의 롱/숏 포지션 비율을 확인하세요
        </p>
      </div>

      {/* 설명 카드 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">펀딩비란?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            펀딩비(Funding Rate)는 선물 가격과 현물 가격을 일치시키기 위해 롱/숏 포지션 간에 주기적으로 교환되는 비용입니다.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                양수 (+)
              </Badge>
              <span className="text-muted-foreground">롱이 숏에게 지불 → 롱 과열</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                음수 (-)
              </Badge>
              <span className="text-muted-foreground">숏이 롱에게 지불 → 숏 과열</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 펀딩비 테이블 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>실시간 펀딩비</CardTitle>
              <CardDescription>
                Binance, Bybit 거래소 기준
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FundingTableSkeleton />}>
            <FundingRateSection />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function FundingRateSection() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useFundingRates();

  if (isLoading) return <FundingTableSkeleton />;
  if (error) return <ErrorMessage message="펀딩비 데이터를 불러오지 못했습니다" />;
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th className="text-left py-3 px-2">코인</th>
              <th className="text-right py-3 px-2">
                <div className="flex items-center justify-end gap-1">
                  Binance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>8시간마다 정산</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="text-right py-3 px-2">
                <div className="flex items-center justify-end gap-1">
                  Bybit
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>8시간마다 정산</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="text-right py-3 px-2">평균</th>
              <th className="text-center py-3 px-2">시그널</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const signalStyle = getFundingSignalStyle(item.signal);
              const binanceColor = getColorByRate(item.binanceRate);
              const bybitColor = getColorByRate(item.bybitRate);
              const avgColor = getColorByRate(item.avgRate);

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
                  <td className={`text-right py-3 px-2 font-mono ${binanceColor}`}>
                    {item.binanceRate !== null
                      ? formatFundingRate(item.binanceRate)
                      : '-'}
                  </td>
                  <td className={`text-right py-3 px-2 font-mono ${bybitColor}`}>
                    {item.bybitRate !== null
                      ? formatFundingRate(item.bybitRate)
                      : '-'}
                  </td>
                  <td className={`text-right py-3 px-2 font-mono font-medium ${avgColor}`}>
                    {formatFundingRate(item.avgRate)}
                  </td>
                  <td className="text-center py-3 px-2">
                    <Badge
                      variant="outline"
                      className={`${signalStyle.bgColor} ${signalStyle.color}`}
                    >
                      {signalStyle.label}
                    </Badge>
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

function getColorByRate(rate: number | null): string {
  if (rate === null) return 'text-muted-foreground';
  if (rate > 0.0005) return 'text-red-600';
  if (rate > 0) return 'text-orange-600';
  if (rate < -0.0005) return 'text-blue-600';
  if (rate < 0) return 'text-cyan-600';
  return 'text-muted-foreground';
}

// Skeleton Components
function FundingTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="w-20 h-4 bg-muted rounded" />
            <div className="w-16 h-3 bg-muted rounded" />
          </div>
          <div className="w-20 h-4 bg-muted rounded" />
          <div className="w-20 h-4 bg-muted rounded" />
          <div className="w-16 h-6 bg-muted rounded" />
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
