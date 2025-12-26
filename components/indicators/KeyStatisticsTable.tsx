'use client';

import { useState } from 'react';
import { useKeyStatistics, useStatClassNames } from '@/lib/hooks/useKeyStatistics';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { StatisticHistoryModal } from './StatisticHistoryModal';

function formatCycle(cycle: string): string {
  if (!cycle) return '-';

  // 202003 -> 2020.03
  if (cycle.length === 6) {
    return `${cycle.slice(0, 4)}.${cycle.slice(4, 6)}`;
  }
  // 2020Q1 -> 2020 Q1
  if (cycle.includes('Q')) {
    return cycle.replace('Q', ' Q');
  }
  return cycle;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
      ))}
    </div>
  );
}

export function KeyStatisticsTable() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStatistic, setSelectedStatistic] = useState<string | null>(null);
  const { data: classNames, isLoading: classLoading } = useStatClassNames();
  const { data: statistics, isLoading, error } = useKeyStatistics(
    selectedClass ? { className: selectedClass } : undefined
  );

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">데이터 로드 실패: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex items-center gap-4">
        <label htmlFor="class-filter" className="text-sm font-medium">
          그룹 필터:
        </label>
        <select
          id="class-filter"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          disabled={classLoading}
        >
          <option value="">전체</option>
          {classNames?.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
        {statistics && (
          <span className="text-sm text-muted-foreground">
            {statistics.length}개 지표
          </span>
        )}
      </div>

      {/* 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      그룹
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      통계명
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      값
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium">
                      시점
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium">
                      단위
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics?.map((stat) => (
                    <tr
                      key={stat.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {stat.class_name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <button
                          onClick={() => setSelectedStatistic(stat.keystat_name)}
                          className="text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                        >
                          {stat.keystat_name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {stat.data_value || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                        {formatCycle(stat.cycle)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                        {stat.unit_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Modal */}
      <StatisticHistoryModal
        keystatName={selectedStatistic}
        open={!!selectedStatistic}
        onClose={() => setSelectedStatistic(null)}
      />
    </div>
  );
}
