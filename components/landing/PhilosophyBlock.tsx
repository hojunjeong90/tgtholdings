'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const principles = [
  {
    label: '01',
    title: 'Models over intuition.',
    body: 'Every decision is reproducible, testable, and documented. If it cannot be backtested, it does not enter the system.',
  },
  {
    label: '02',
    title: 'Risk is primary.',
    body: 'Returns are a byproduct of constraint. We size for survival first, then for performance.',
  },
  {
    label: '03',
    title: 'Data, not consensus.',
    body: 'Markets are complex adaptive systems. We model behavior, not narratives.',
  },
];

export function PhilosophyBlock() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 border-t border-border/30">
      <div className="content-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14"
        >
          <p className="label-mono text-muted-foreground mb-6 md:mb-10">
            Philosophy
          </p>
          <h2 className="font-display text-huge font-semibold tracking-[-0.05em] leading-[0.98]">
            Research over opinion.
          </h2>
        </motion.div>

        <div className="divide-y divide-border/30">
          {principles.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="py-6 md:py-8 grid grid-cols-[2rem_1fr] md:grid-cols-[2.5rem_1fr_2fr] gap-x-4 md:gap-x-6 gap-y-2 items-start"
            >
              <span className="text-xs font-mono text-muted-foreground/40 pt-0.5">{p.label}</span>
              <h3 className="font-display text-lg md:text-xl font-semibold tracking-[-0.025em] text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed col-start-2 md:col-start-auto mt-1 md:mt-0">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
