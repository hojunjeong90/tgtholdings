import { Suspense } from 'react';
import { KeyStatisticsTable } from '@/components/indicators/KeyStatisticsTable';
import { Card, CardContent } from '@/components/ui/card';

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function KeyStatisticsPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">100대 통계지표</h1>
        <p className="text-muted-foreground">
          한국은행이 발표하는 100대 주요 경제 통계지표입니다.
        </p>
      </div>

      {/* 테이블 */}
      <Suspense fallback={<TableSkeleton />}>
        <KeyStatisticsTable />
      </Suspense>

      {/* 데이터 안내 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>데이터 출처:</strong> 한국은행 ECOS (경제통계시스템)
            </p>
            <p>
              <strong>업데이트 주기:</strong> 매주 월요일 자동 업데이트
            </p>
            <p>
              <strong>참고:</strong> 각 지표는 최신 발표 시점의 데이터를 표시하며,
              과거 데이터도 보관됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
