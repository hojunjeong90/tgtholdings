'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Home,
  BarChart3,
  Wrench,
  Rss,
  Search,
} from 'lucide-react';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { href: '/', label: '홈', icon: Home, description: '홈페이지로 이동' },
  { href: '/indicators', label: '지표', icon: BarChart3, description: '통화 지표 비교' },
  { href: '/tools', label: '도구', icon: Wrench, description: '실시간 환율 등 유용한 도구' },
  { href: '/feed', label: '피드', icon: Rss, description: '최신 소식' },
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();

  // Keyboard shortcut: '/' to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' ||
                      target.tagName === 'TEXTAREA' ||
                      target.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="검색"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] p-4">
        <div className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="검색어를 입력하세요..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Results */}
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </Command.Empty>

            {/* Pages Group */}
            <Command.Group heading="페이지" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Command.Item
                    key={page.href}
                    value={page.label}
                    onSelect={() => runCommand(() => router.push(page.href))}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{page.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {page.description}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ESC
              </kbd>
              <span className="ml-1">닫기</span>
            </span>
            <span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              <span className="ml-1">선택</span>
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}
