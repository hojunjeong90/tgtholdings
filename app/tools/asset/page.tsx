'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Info, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  StockCandleChart,
  StockCandleChartSkeleton,
} from '@/components/tools/StockCandleChart';
import {
  useStockPricesByPeriod,
  PERIOD_OPTIONS,
  type PeriodType,
} from '@/lib/hooks/useStockPrices';
import { cn } from '@/lib/utils';

// 인기 티커 목록
const POPULAR_TICKERS = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'SPY', name: 'S&P 500 ETF' },
  { ticker: 'QQQ', name: 'NASDAQ ETF' },
];

function AssetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tickerFromUrl = searchParams.get('ticker');

  const [inputTicker, setInputTicker] = useState(tickerFromUrl || '');
  const [searchTicker, setSearchTicker] = useState(tickerFromUrl || '');
  const [period, setPeriod] = useState<PeriodType>('1Y');

  // URL 파라미터 변경 감지
  useEffect(() => {
    if (tickerFromUrl && tickerFromUrl !== searchTicker) {
      setInputTicker(tickerFromUrl);
      setSearchTicker(tickerFromUrl);
    }
  }, [tickerFromUrl]);

  const { data, isLoading, error, refetch } = useStockPricesByPeriod(
    searchTicker,
    period
  );

  // 검색 실행
  const handleSearch = () => {
    const ticker = inputTicker.trim().toUpperCase();
    if (ticker) {
      setSearchTicker(ticker);
      router.push(`/tools/asset?ticker=${ticker}`);
    }
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 인기 티커 클릭
  const handleQuickSearch = (ticker: string) => {
    setInputTicker(ticker);
    setSearchTicker(ticker);
    router.push(`/tools/asset?ticker=${ticker}`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">종목조회</h1>
        <p className="text-sm text-muted-foreground">
          티커 심볼로 주식 주봉 차트를 조회합니다
        </p>
      </div>

      {/* 검색 입력 */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="티커 입력 (예: AAPL, 005930.KS)"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={!inputTicker.trim()}>
          조회
        </Button>
      </div>

      {/* 인기 티커 */}
      {!searchTicker && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              인기 종목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TICKERS.map((item) => (
                <Button
                  key={item.ticker}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(item.ticker)}
                  className="text-xs"
                >
                  {item.ticker}
                  <span className="ml-1 text-muted-foreground">{item.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 로딩 상태 */}
      {searchTicker && isLoading && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{searchTicker} 데이터를 불러오는 중...</span>
            </div>
            <div className="mt-6">
              <StockCandleChartSkeleton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 상태 */}
      {searchTicker && error && (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>데이터를 불러오는 데 실패했습니다</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {error.message}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 결과 표시 */}
      {searchTicker && data && data.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg font-bold">{searchTicker}</CardTitle>

              {/* 기간 선택 버튼 */}
              <div className="flex items-center gap-1">
                {PERIOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={period === option.value ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'h-7 px-3 text-xs',
                      period === option.value
                        ? ''
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setPeriod(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>
                {data.length}주 데이터 · 최근: {data[data.length - 1]?.date}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs px-2"
                onClick={() => refetch()}
              >
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StockCandleChart data={data} />
          </CardContent>
        </Card>
      )}

      {/* 데이터 없음 */}
      {searchTicker && !isLoading && !error && data && data.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">
              {searchTicker}에 대한 데이터가 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              티커 심볼을 확인해주세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* 사용 안내 */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4">
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p className="font-medium">티커 형식 안내:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>미국 주식: AAPL, MSFT, GOOGL</li>
              <li>한국 주식: 005930.KS (삼성전자), 000660.KS (SK하이닉스)</li>
              <li>일본 주식: 7203.T (토요타)</li>
              <li>ETF: SPY, QQQ, VOO</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssetPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">종목조회</h1>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AssetContent />
    </Suspense>
  );
}
