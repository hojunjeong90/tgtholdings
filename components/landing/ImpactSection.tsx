'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GraduationCap, Coins, Users } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const focusAreas = [
  {
    icon: GraduationCap,
    title: '교육 접근성',
    subtitle: 'Education Access',
    description: '배움의 기회가 환경에 제약받지 않도록',
  },
  {
    icon: Coins,
    title: '금융 리터러시',
    subtitle: 'Financial Literacy',
    description: '건강한 자본 이해와 의사결정 역량 강화',
  },
  {
    icon: Users,
    title: '지역 커뮤니티 인프라',
    subtitle: 'Local Community Infrastructure',
    description: '로컬 커뮤니티의 자립적 성장 지원',
  },
];

const approaches = [
  {
    title: '수익 연동 기여',
    subtitle: 'Profit-linked Contribution',
    description: '규모가 커질수록 환원도 커지는 구조',
  },
  {
    title: '지분 기반 지원',
    subtitle: 'Equity-based Support',
    description: '일회성 기부가 아닌 지속 가능한 파트너십',
  },
];

export function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="impact"
      ref={ref}
      className="relative min-h-[80vh] flex items-center py-24 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* 핵심 메시지 */}
          <motion.div variants={fadeInUp} className="text-center mb-16 md:mb-20">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Social Impact
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-relaxed max-w-3xl mx-auto">
              규모가 커지면,
              <br />
              자본은 정부보다 빠르게
              <br />
              <span className="text-primary">문제를 해결해야 합니다.</span>
            </h2>
          </motion.div>

          {/* Focus Areas */}
          <motion.div variants={fadeInUp} className="mb-16">
            <h3 className="text-center text-lg font-medium text-muted-foreground mb-8">
              Focus Areas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {focusAreas.map((area, index) => {
                const Icon = area.icon;

                return (
                  <motion.div
                    key={area.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className="text-center p-6"
                  >
                    {/* 아이콘 */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                      <Icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>

                    {/* 텍스트 */}
                    <h4 className="font-semibold text-lg mb-1">{area.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{area.subtitle}</p>
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Approach */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-center text-lg font-medium text-muted-foreground mb-8">
              Approach
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              {approaches.map((approach, index) => (
                <motion.div
                  key={approach.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50 max-w-xs"
                >
                  <h4 className="font-semibold text-lg mb-1">{approach.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{approach.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{approach.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 하단 주석 */}
          <motion.p
            variants={fadeInUp}
            className="text-center text-sm text-muted-foreground mt-12 max-w-md mx-auto"
          >
            *현재 준비 단계입니다. 구체적인 임팩트 지표는 운영 규모에 따라 공개될 예정입니다.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
