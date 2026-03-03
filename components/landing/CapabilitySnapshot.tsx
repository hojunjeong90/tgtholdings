'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const capabilities = [
  'ML & Statistical Modeling',
  'Reinforcement Learning Research',
  'Cross-Market Data Engineering',
  'Risk-Constrained Portfolio Construction',
  'Continuous Model Evaluation & Iteration',
];

export function CapabilitySnapshot() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 border-t border-border/30">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="md:sticky md:top-24"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 md:mb-6">
              Capabilities
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight leading-snug">
              What we<br />build.
            </h2>
          </motion.div>

          <ul className="divide-y divide-border/30">
            {capabilities.map((cap, i) => (
              <motion.li
                key={cap}
                initial={{ opacity: 0, x: 16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="py-4 md:py-5 flex items-center justify-between gap-4"
              >
                <span className="text-sm md:text-base font-medium text-foreground">{cap}</span>
                <span className="text-xs font-mono text-muted-foreground/35 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
