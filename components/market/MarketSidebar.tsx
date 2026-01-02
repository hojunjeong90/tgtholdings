'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bitcoin, TrendingUp, Calendar, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    href: '/market/crypto',
    label: '암호화폐',
    icon: Bitcoin,
    description: '실시간 가격 & 김치프리미엄',
  },
  {
    href: '/market/funding',
    label: '펀딩비',
    icon: TrendingUp,
    description: '선물 롱/숏 지표',
  },
  {
    href: '/market/calendar',
    label: '일정',
    icon: Calendar,
    description: '토큰 언락, 상장 등',
  },
];

interface MarketSidebarProps {
  className?: string;
}

export function MarketSidebar({ className }: MarketSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-60 shrink-0', className)}>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <div>
                <div>{item.label}</div>
                {!isActive && (
                  <div className="text-xs text-muted-foreground/70">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// 모바일 사이드바 토글 컴포넌트
export function MobileMarketSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4"
      >
        {isOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
        메뉴
      </Button>

      {isOpen && (
        <nav className="mb-4 space-y-1 rounded-lg border bg-card p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
