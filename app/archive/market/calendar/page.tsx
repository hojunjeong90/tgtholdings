'use client';

import { useState, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCryptoEvents } from '@/lib/hooks/useCryptoEvents';
import type { CryptoEventType, EventImportance } from '@/lib/types/crypto';

export default function CryptoCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const prevMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          암호화폐 일정
        </h1>
        <p className="text-muted-foreground mt-1">
          토큰 언락, 상장, 에어드랍 등 주요 일정
        </p>
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {selectedMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 이벤트 유형 범례 */}
      <div className="flex flex-wrap gap-2">
        <EventTypeBadge type="token_unlock" />
        <EventTypeBadge type="listing" />
        <EventTypeBadge type="airdrop" />
        <EventTypeBadge type="mainnet" />
        <EventTypeBadge type="halving" />
        <EventTypeBadge type="fork" />
      </div>

      {/* 이벤트 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>다가오는 일정</CardTitle>
              <CardDescription>
                {selectedMonth.toLocaleDateString('ko-KR', { month: 'long' })} 일정 목록
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EventListSkeleton />}>
            <CryptoEventSection month={selectedMonth} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function CryptoEventSection({ month }: { month: Date }) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useCryptoEvents(month);

  if (isLoading) return <EventListSkeleton />;
  if (error) return <ErrorMessage message="일정 데이터를 불러오지 못했습니다" />;
  if (!data || data.length === 0) return <NoEventsMessage />;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')
    : null;

  // 날짜별로 그룹화
  const eventsByDate = data.reduce((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof data>);

  const sortedDates = Object.keys(eventsByDate).sort();

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

      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">
              {new Date(date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </h3>
            <div className="space-y-2">
              {eventsByDate[date].map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <EventTypeBadge type={event.event_type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {event.symbol && (
                        <span className="font-medium text-sm">
                          {event.symbol}
                        </span>
                      )}
                      <ImportanceBadge importance={event.importance} />
                    </div>
                    <p className="font-medium mt-1">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {event.event_time && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.event_time}
                      </p>
                    )}
                  </div>
                  {event.source_url && (
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      출처
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventTypeBadge({ type }: { type: CryptoEventType }) {
  const config: Record<CryptoEventType, { label: string; color: string }> = {
    token_unlock: { label: '토큰 언락', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    listing: { label: '상장', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    airdrop: { label: '에어드랍', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    mainnet: { label: '메인넷', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    halving: { label: '반감기', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    fork: { label: '하드포크', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    other: { label: '기타', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  };

  const { label, color } = config[type] || config.other;

  return (
    <Badge variant="outline" className={`text-xs shrink-0 ${color}`}>
      {label}
    </Badge>
  );
}

function ImportanceBadge({ importance }: { importance: EventImportance }) {
  if (importance === 'high') {
    return (
      <Badge variant="destructive" className="text-xs">
        중요
      </Badge>
    );
  }
  return null;
}

// Skeleton Components
function EventListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="w-32 h-4 bg-muted rounded" />
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-start gap-3 p-3 border rounded-lg animate-pulse">
              <div className="w-16 h-5 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-48 h-4 bg-muted rounded" />
              </div>
            </div>
          ))}
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

function NoEventsMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <Calendar className="h-8 w-8 mb-2 opacity-50" />
      <p>이번 달 예정된 일정이 없습니다</p>
    </div>
  );
}
