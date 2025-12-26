'use client';

import {
  DollarSign,
  Droplets,
  Gauge,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScenarioKPIData } from '@/lib/types/wealth-scenario';

interface WealthScenarioKPIProps {
  data?: ScenarioKPIData;
  isLoading?: boolean;
}

export function WealthScenarioKPI({ data, isLoading }: WealthScenarioKPIProps) {
  if (isLoading || !data) {
    return <KPISkeleton />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* 금리 국면 */}
      <KPICard
        title="금리 국면"
        value={data.policyStance}
        icon={Gauge}
        color={
          data.policyStance === '긴축'
            ? 'text-red-500'
            : data.policyStance === '완화'
            ? 'text-green-500'
            : 'text-slate-500'
        }
        bgColor={
          data.policyStance === '긴축'
            ? 'bg-red-50 dark:bg-red-950/30'
            : data.policyStance === '완화'
            ? 'bg-green-50 dark:bg-green-950/30'
            : 'bg-slate-50 dark:bg-slate-950/30'
        }
      />

      {/* 유동성 추세 */}
      <KPICard
        title="유동성"
        value={data.liquidityTrend}
        icon={Droplets}
        color={
          data.liquidityTrend === '확장'
            ? 'text-green-500'
            : data.liquidityTrend === '축소'
            ? 'text-red-500'
            : 'text-slate-500'
        }
        bgColor={
          data.liquidityTrend === '확장'
            ? 'bg-green-50 dark:bg-green-950/30'
            : data.liquidityTrend === '축소'
            ? 'bg-red-50 dark:bg-red-950/30'
            : 'bg-slate-50 dark:bg-slate-950/30'
        }
      />

      {/* 달러 강도 */}
      <KPICard
        title="달러"
        value={data.dollarStrength}
        icon={DollarSign}
        color={
          data.dollarStrength === '강세'
            ? 'text-amber-500'
            : data.dollarStrength === '약세'
            ? 'text-blue-500'
            : 'text-slate-500'
        }
        bgColor={
          data.dollarStrength === '강세'
            ? 'bg-amber-50 dark:bg-amber-950/30'
            : data.dollarStrength === '약세'
            ? 'bg-blue-50 dark:bg-blue-950/30'
            : 'bg-slate-50 dark:bg-slate-950/30'
        }
      />

      {/* 위험선호도 */}
      <KPICard
        title="위험선호"
        value={data.riskAppetite}
        icon={Activity}
        color={
          data.riskAppetite === 'Risk-On'
            ? 'text-green-500'
            : data.riskAppetite === 'Risk-Off'
            ? 'text-red-500'
            : 'text-slate-500'
        }
        bgColor={
          data.riskAppetite === 'Risk-On'
            ? 'bg-green-50 dark:bg-green-950/30'
            : data.riskAppetite === 'Risk-Off'
            ? 'bg-red-50 dark:bg-red-950/30'
            : 'bg-slate-50 dark:bg-slate-950/30'
        }
      />
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function KPICard({ title, value, icon: Icon, color, bgColor }: KPICardProps) {
  return (
    <div className={cn('rounded-lg p-3 border', bgColor)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>
      <p className={cn('text-lg font-bold mt-1', color)}>{value}</p>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg p-3 border bg-muted/50 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
          <div className="h-6 w-16 bg-muted rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

// 경고 배너 (예: 금리 역전 지속)
interface WarningBannerProps {
  yieldCurve: '정상' | '역전' | '평탄';
  inversionDays?: number;
}

export function YieldCurveWarning({ yieldCurve, inversionDays }: WarningBannerProps) {
  if (yieldCurve !== '역전') return null;

  return (
    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <p className="text-xs text-amber-700 dark:text-amber-300">
        <span className="font-medium">2Y-10Y 금리 역전 지속</span>
        {inversionDays && (
          <span className="ml-1">({inversionDays}일째)</span>
        )}
        <span className="ml-1 text-amber-600 dark:text-amber-400">
          — 역사적으로 경기침체 선행지표
        </span>
      </p>
    </div>
  );
}
