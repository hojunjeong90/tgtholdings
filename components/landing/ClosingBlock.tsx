'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export function ClosingBlock() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 md:py-32 lg:py-40 border-t border-border/30">
      <div className="content-shell">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h2 className="font-display text-huge font-semibold tracking-[-0.06em] leading-[0.92] mb-10 md:mb-14">
            Quietly systematic.<br />
            Relentlessly empirical.<br />
            <span className="text-muted-foreground">Long-horizon focused.</span>
          </h2>

          <p className="label-mono text-muted-foreground/50 mb-10 md:mb-14">
            We trade proprietary capital only.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/what-we-do"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-85 transition-opacity"
            >
              Research Philosophy
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
