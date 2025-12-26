import { Suspense } from 'react';
import { MonetaryIndicatorChart } from '@/components/indicators/MonetaryIndicatorChart';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { INDICATOR_INFO } from '@/lib/types/monetary-indicators';

function ChartSkeleton() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
      <span className="text-muted-foreground">로딩 중...</span>
    </div>
  );
}

export default function MonetaryIndicatorsPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">통화 지표 비교</h1>
        <p className="text-muted-foreground">
          한국, 미국, 일본의 통화유동속도, 통화승수, 금리를 비교합니다.
        </p>
      </div>

      {/* 범례 */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded" />
          <span>미국</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500 rounded" />
          <span>한국</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-emerald-500 rounded" />
          <span>일본</span>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className="grid gap-6">
        {/* 금리 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>{INDICATOR_INFO.interest_rate.name}</CardTitle>
            <CardDescription>
              각국 중앙은행 기준금리 비교 (FRED 데이터)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <MonetaryIndicatorChart indicatorType="interest_rate" />
            </Suspense>
          </CardContent>
        </Card>

        {/* 통화유동속도 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>{INDICATOR_INFO.velocity.name}</CardTitle>
            <CardDescription>
              현재 미국 데이터만 제공됩니다 (FRED M2V 시리즈)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <MonetaryIndicatorChart indicatorType="velocity" />
            </Suspense>
          </CardContent>
        </Card>

        {/* 통화승수 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>{INDICATOR_INFO.multiplier.name}</CardTitle>
            <CardDescription>
              현재 미국 데이터만 제공됩니다 (M2 / 본원통화 계산)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <MonetaryIndicatorChart indicatorType="multiplier" />
            </Suspense>
          </CardContent>
        </Card>

        {/* 통화증가율 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>{INDICATOR_INFO.m2_growth.name}</CardTitle>
            <CardDescription>
              M2 통화량의 전년동기대비 증가율 (중앙은행의 돈 찍어내기 속도)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <MonetaryIndicatorChart indicatorType="m2_growth" />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* 데이터 안내 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>데이터 출처:</strong> FRED (Federal Reserve Economic Data)
            </p>
            <p>
              <strong>업데이트 주기:</strong> 일별 자동 업데이트 (Cron Job)
            </p>
            <p>
              <strong>참고:</strong> 한국/일본의 통화유동속도와 통화승수는
              한국은행 ECOS API 연동 후 추가될 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
