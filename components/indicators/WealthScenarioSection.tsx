'use client';

import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScenarioStep } from '@/lib/types/wealth-scenario';
import { STEP_CONFIG, STEP_ORDER } from '@/lib/types/wealth-scenario';

interface WealthScenarioSectionProps {
  step: ScenarioStep;
  children: React.ReactNode;
  className?: string;
}

export function WealthScenarioSection({
  step,
  children,
  className,
}: WealthScenarioSectionProps) {
  const config = STEP_CONFIG[step];
  const stepIndex = STEP_ORDER.indexOf(step);
  const isLastStep = stepIndex === STEP_ORDER.length - 1;

  return (
    <div className={cn('relative', className)}>
      {/* Section Header */}
      <div
        className={cn(
          'rounded-t-lg px-4 py-3 border-l-4',
          config.bgColor
        )}
        style={{ borderLeftColor: config.color }}
      >
        <h2
          className="text-sm font-bold tracking-wide"
          style={{ color: config.color }}
        >
          {config.title}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {config.description}
        </p>
      </div>

      {/* Section Content */}
      <div className={cn('p-4 border border-t-0 rounded-b-lg', config.bgColor)}>
        {children}
      </div>

      {/* Flow Arrow (except for last step) */}
      {!isLastStep && (
        <div className="flex justify-center py-3">
          <div className="flex flex-col items-center">
            <div
              className="w-0.5 h-4"
              style={{ backgroundColor: config.color }}
            />
            <ArrowDown
              className="h-5 w-5"
              style={{ color: config.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 그리드 래퍼 컴포넌트
interface IndicatorGridProps {
  children: React.ReactNode;
  columns?: 3 | 4 | 5;
}

export function IndicatorGrid({ children, columns = 4 }: IndicatorGridProps) {
  const gridCols = {
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns])}>
      {children}
    </div>
  );
}
