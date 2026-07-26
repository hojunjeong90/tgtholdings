'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/constants/navigation';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .sh-nav { color:rgba(226,232,240,0.55); transition:color .2s; }
        .sh-nav:hover { color:#e2e8f0; }
        .sh-nav-active { color:#e2e8f0; }
        .sh-mmenu { position:fixed; inset:0; z-index:60; background:#030712; display:flex; flex-direction:column; padding:1.25rem 1.5rem; }
        .sh-mmenu-link { color:rgba(226,232,240,.75); font-size:1.25rem; font-weight:500; padding:0.875rem 0; border-bottom:1px solid rgba(226,232,240,.07); transition:color .2s; }
        .sh-mmenu-link:hover { color:#e2e8f0; }
        .sh-hamburger { display:none; flex-direction:column; justify-content:center; gap:5px; width:36px; height:36px; cursor:pointer; background:none; border:none; padding:0; }
        .sh-mmenu-close { display:flex; }
        .sh-hamburger span { display:block; width:22px; height:1.5px; background:rgba(226,232,240,.8); transition:all .25s; }
        @media (max-width:767px) { .sh-hamburger { display:flex; } }
      `}</style>

      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-8"
        style={{
          height: '68px',
          background: 'rgba(3,7,18,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226,232,240,0.07)',
        }}
      >
        <Link href="/" className="select-none">
          <span className="text-white font-bold text-lg tracking-tight">
            TGT <span style={{ color: '#4ade80' }}>Quant</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-4 lg:gap-6">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`sh-nav text-[13px] font-medium${pathname === href ? ' sh-nav-active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          className="sh-hamburger md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </header>

      {mobileOpen && (
        <div className="sh-mmenu">
          <div className="flex items-center justify-between mb-10">
            <span className="text-white font-bold text-lg tracking-tight">
              TGT <span style={{ color: '#4ade80' }}>Quant</span>
            </span>
            <button
              className="sh-hamburger sh-mmenu-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <span style={{ transform: 'rotate(45deg) translate(4px, 4px)' }} />
              <span style={{ opacity: 0 }} />
              <span style={{ transform: 'rotate(-45deg) translate(4px, -4px)' }} />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col flex-1">
            {navItems.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="sh-mmenu-link"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
