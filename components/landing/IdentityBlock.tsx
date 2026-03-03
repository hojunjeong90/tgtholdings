'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function IdentityBlock() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 border-t border-border/30">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6 md:mb-10">
            Who We Are
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-[1.15] tracking-tight mb-8 md:mb-12">
            We are a quantitative<br />
            research firm.
          </h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-8 text-muted-foreground">
            <p className="text-sm md:text-base leading-relaxed">
              We design and deploy algorithmic trading systems driven by machine learning
              and statistical inference. Every position is the output of a model, not a judgment.
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              We operate across global asset classes — equities, fixed income, FX, and
              digital assets — with a single mandate: systematic, compounding returns.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
