'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useExchangeRatesWithTrend,
  formatRate,
  formatPercent,
} from '@/lib/hooks/useExchangeRates';
import {
  useMonetaryIndicators,
  transformToChartData,
} from '@/lib/hooks/useMonetaryIndicators';
import {
  CURRENCY_INFO,
  type CurrencyCode,
} from '@/lib/types/exchange-rate';
import { COUNTRY_INFO, type CountryCode } from '@/lib/types/monetary-indicators';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  DollarSign,
  BarChart3,
  Percent,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          글로벌 통화 지표와 환율 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Exchange Rate Signal Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  환율 시그널
                </CardTitle>
                <CardDescription>
                  1W/2W/4W 평균 대비 현재 환율 비교
                </CardDescription>
              </div>
              <Link href="/tools/exchange-rate">
                <Button variant="outline" size="sm">
                  자세히 보기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ExchangeRatesSkeleton />}>
              <ExchangeRatesSummary />
            </Suspense>
          </CardContent>
        </Card>

        {/* Signal Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              시그널 현황
            </CardTitle>
            <CardDescription>환전 타이밍 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<SignalStatsSkeleton />}>
              <SignalStats />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Interest Rate Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                기준금리 추이
              </CardTitle>
              <CardDescription>
                미국, 한국, 일본 중앙은행 기준금리 비교
              </CardDescription>
            </div>
            <Link href="/indicators/monetary">
              <Button variant="outline" size="sm">
                자세히 보기
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <InterestRateChart />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard
          href="/tools/exchange-rate"
          title="실시간 환율"
          description="12개 통화의 실시간 환율과 환전 시그널"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <QuickLinkCard
          href="/indicators/monetary"
          title="통화 지표"
          description="통화유동속도, 통화승수, 금리 비교"
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <QuickLinkCard
          href="/indicators/key-statistics"
          title="주요 통계"
          description="거시경제 주요 통계 데이터"
          icon={<Percent className="h-6 w-6" />}
        />
      </div>
    </div>
  );
}

function ExchangeRatesSummary() {
  const { data: trends, isLoading } = useExchangeRatesWithTrend();

  if (isLoading || !trends) {
    return <ExchangeRatesSkeleton />;
  }

  const mainCurrencies: CurrencyCode[] = ['USD', 'JPY', 'EUR', 'CNY', 'GBP', 'CHF'];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mainCurrencies.map((code) => {
        const trend = trends[code];
        if (!trend) return null;

        const info = CURRENCY_INFO[code];
        const signalColor =
          trend.signal === '유리'
            ? 'bg-green-100 text-green-700'
            : trend.signal === '불리'
            ? 'bg-red-100 text-red-700'
            : 'bg-slate-100 text-slate-700';

        return (
          <div
            key={code}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{info.flag}</span>
              <div>
                <div className="font-medium">{info.code}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRate(trend.current)}원
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={signalColor}>
                {trend.signal}
              </Badge>
              <div className="text-xs mt-1 text-muted-foreground">
                {formatPercent(trend.pct4w)} (4W)
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SignalStats() {
  const { data: trends, isLoading } = useExchangeRatesWithTrend();

  const stats = useMemo(() => {
    if (!trends) return { favorable: 0, neutral: 0, unfavorable: 0 };

    let favorable = 0,
      neutral = 0,
      unfavorable = 0;

    const currencies: CurrencyCode[] = [
      'USD',
      'JPY',
      'EUR',
      'CNY',
      'GBP',
      'CHF',
      'AUD',
      'CAD',
      'HKD',
      'SGD',
      'THB',
    ];

    for (const code of currencies) {
      const signal = trends[code]?.signal;
      if (signal === '유리') favorable++;
      else if (signal === '불리') unfavorable++;
      else neutral++;
    }

    return { favorable, neutral, unfavorable };
  }, [trends]);

  if (isLoading) {
    return <SignalStatsSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
        <TrendingDown className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-700 dark:text-green-300">
            환전 유리
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            평균보다 환율 낮음
          </div>
        </div>
        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
          {stats.favorable}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
        <Minus className="h-5 w-5 text-slate-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            보통
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            평균 수준
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
          {stats.neutral}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950">
        <TrendingUp className="h-5 w-5 text-red-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-red-700 dark:text-red-300">
            환전 불리
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            평균보다 환율 높음
          </div>
        </div>
        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
          {stats.unfavorable}
        </div>
      </div>
    </div>
  );
}

function InterestRateChart() {
  const { data, isLoading, error } = useMonetaryIndicators('interest_rate');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const transformed = transformToChartData(data);
    // 최근 24개월만 표시
    return transformed.slice(-24);
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (error) return <ChartError />;
  if (!chartData.length) return <NoData />;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
            }}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                  <p className="text-sm font-medium mb-2">{label}</p>
                  {payload.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">
                        {COUNTRY_INFO[entry.dataKey as CountryCode]?.name}:
                      </span>
                      <span className="font-medium">{Number(entry.value).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            formatter={(value) => COUNTRY_INFO[value as CountryCode]?.name || value}
          />
          <Line
            type="monotone"
            dataKey="US"
            name="US"
            stroke={COUNTRY_INFO.US.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="KR"
            name="KR"
            stroke={COUNTRY_INFO.KR.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="JP"
            name="JP"
            stroke={COUNTRY_INFO.JP.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function QuickLinkCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton Components
function ExchangeRatesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-3 border rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded" />
            <div className="space-y-2">
              <div className="w-12 h-4 bg-muted rounded" />
              <div className="w-20 h-3 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SignalStatsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-muted rounded" />
            <div className="flex-1 space-y-2">
              <div className="w-20 h-4 bg-muted rounded" />
              <div className="w-32 h-3 bg-muted rounded" />
            </div>
            <div className="w-8 h-8 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
      <span className="text-muted-foreground">로딩 중...</span>
    </div>
  );
}

function ChartError() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-destructive/10 rounded-lg">
      <span className="text-destructive">데이터를 불러오지 못했습니다</span>
    </div>
  );
}

function NoData() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
      <span className="text-muted-foreground">데이터 없음</span>
    </div>
  );
}
