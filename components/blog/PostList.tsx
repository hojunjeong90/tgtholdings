'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BlogPost, BlogCategory } from '@/lib/blog';

const CATEGORIES: BlogCategory[] = ['Macro', 'Signals', 'Infrastructure', 'Risk', 'Research'];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

export default function PostList({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState<BlogCategory | null>(null);

  const filtered = active ? posts.filter((p) => p.category === active) : posts;

  return (
    <>
      {/* Filter bar */}
      <div className="border-b border-border/50">
        <div className="content-shell py-4 flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setActive(null)}
            className={`text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-md transition-colors ${
              active === null
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(active === c ? null : c)}
              className={`text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-md transition-colors ${
                active === c
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Post list or empty state */}
      {filtered.length === 0 ? (
        <section className="py-24 md:py-32 lg:py-40">
          <div className="content-shell text-center">
            <div className="inline-block font-mono text-4xl md:text-6xl mb-6 md:mb-8 text-border select-none">
              &empty;
            </div>
            <p className="text-lg md:text-xl font-medium mb-3">Nothing published yet.</p>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              The first notes are being written. When they&apos;re ready, they&apos;ll appear here
              — unfiltered, and worth the wait.
            </p>
          </div>
        </section>
      ) : (
        <section className="py-8 md:py-12">
          <div className="content-shell divide-y divide-border/50">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/research/${post.slug}`}
                className="block py-6 md:py-8 group"
              >
                <div className="flex items-center gap-3 mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <span>{post.category}</span>
                  <span className="text-border">|</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-[-0.04em] leading-[1.02] mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
                  {post.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
