'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stack = [
  {
    label: 'Data',
    items: ['Market microstructure feeds', 'Alternative data pipelines', 'Real-time normalization'],
  },
  {
    label: 'Signal',
    items: ['Factor research', 'ML feature engineering', 'Alpha generation models'],
  },
  {
    label: 'Execution',
    items: ['Portfolio optimizer', 'Order management system', 'Latency-aware routing'],
  },
  {
    label: 'Risk',
    items: ['Real-time P&L attribution', 'Drawdown controls', 'Regime detection'],
  },
];

export function InfrastructureBlock() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="infrastructure" ref={ref} className="py-16 md:py-24 lg:py-32 border-t border-border/30">
      <div className="content-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14"
        >
          <p className="label-mono text-muted-foreground mb-6 md:mb-10">
            Infrastructure
          </p>
          <h2 className="font-display text-huge font-semibold tracking-[-0.05em] leading-[0.98] mb-4 md:mb-5">
            Infrastructure<br />is the strategy.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg leading-relaxed">
            We build the full stack — from raw data ingestion to live order execution.
            No third-party black boxes. No untested dependencies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-border/20 border border-border/20 rounded-lg overflow-hidden">
          {stack.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
              className="bg-background p-4 md:p-6"
            >
              <p className="label-mono text-muted-foreground/50 mb-3 md:mb-4">
                {layer.label}
              </p>
              <ul className="space-y-2">
                {layer.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
