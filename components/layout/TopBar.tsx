'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from './NavLink';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { useState } from 'react';

const navItems = [
  { href: '/', label: '홈' },
  { href: '/indicators', label: '지표' },
  { href: '/tools', label: '도구' },
  { href: '/feed', label: '피드' },
];

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          {/* Mobile Menu */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">TGT Holdings</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Button */}
          <Button
            variant="outline"
            className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span>검색</span>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:inline-flex">
              /
            </kbd>
          </Button>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
