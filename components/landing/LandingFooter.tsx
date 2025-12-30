'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

export function LandingFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={ref}
      className="relative py-16 md:py-24 bg-muted/50 border-t border-border/50"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* 마무리 메시지 */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <p className="text-2xl md:text-3xl font-light text-muted-foreground mb-4">
              지속하기 위해 세워졌습니다.
              <br />
              <span className="text-foreground font-medium">되돌리기 위해 설계되었습니다.</span>
            </p>
            <p className="text-sm text-muted-foreground italic mt-6">
              Built to last. Designed to give.
            </p>
          </motion.div>

          {/* 구분선 */}
          <motion.div
            variants={fadeInUp}
            className="w-16 h-px bg-border mx-auto mb-12"
          />

          {/* 링크 및 연락처 */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground"
          >
            {/* 법적 링크 */}
            <div className="flex items-center gap-6">
              <Link
                href="/legal/terms"
                className="hover:text-foreground transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/legal/privacy"
                className="hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/legal/ethics"
                className="hover:text-foreground transition-colors"
              >
                윤리 강령
              </Link>
            </div>

            {/* 연락처 */}
            <div>
              <a
                href="mailto:contact@tgtholdings.com"
                className="hover:text-foreground transition-colors"
              >
                contact@tgtholdings.com
              </a>
            </div>
          </motion.div>

          {/* 저작권 */}
          <motion.div
            variants={fadeInUp}
            className="text-center mt-12 text-xs text-muted-foreground"
          >
            <p>&copy; {currentYear} TGT Holdings. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
