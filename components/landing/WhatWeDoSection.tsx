'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, BarChart3, Building2, Landmark, ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const domains = [
  {
    icon: Cpu,
    title: '기술 & 디지털 자산',
    subtitle: 'Technology & Digital Assets',
    description: '블록체인, AI, SaaS 등 기술 기반 자산에 대한 전략적 투자와 운영',
  },
  {
    icon: BarChart3,
    title: '퀀트 & 시스템 투자',
    subtitle: 'Quantitative & Systematic Investment',
    description: '데이터 기반 알고리즘과 시스템적 접근을 통한 투자 운용',
  },
  {
    icon: Building2,
    title: '플랫폼 & 인프라',
    subtitle: 'Platform & Infrastructure',
    description: '장기적 가치를 창출하는 플랫폼 비즈니스와 인프라 구축',
  },
  {
    icon: Landmark,
    title: '장기 실물 자산',
    subtitle: 'Long-term Real Assets',
    description: '선별적 접근을 통한 실물 자산 포트폴리오 구성',
  },
];

const operatingCycle = ['보유', '구축', '분사', '재투자'];

export function WhatWeDoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="whatwedo"
      ref={ref}
      className="relative min-h-screen flex items-center py-24 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* 섹션 타이틀 */}
          <motion.div variants={fadeInUp} className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              우리는 이렇게 설계합니다
            </h2>
          </motion.div>

          {/* Capital Domains 그리드 */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {domains.map((domain, index) => {
              const Icon = domain.icon;

              return (
                <motion.div
                  key={domain.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="group relative p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all"
                >
                  {/* 아이콘 */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-lg font-semibold mb-1">{domain.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{domain.subtitle}</p>

                  {/* 설명 */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {domain.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 운영 사이클 */}
          <motion.div variants={fadeInUp} className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-8">운영 원칙</h3>

            {/* 사이클 다이어그램 */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
              {operatingCycle.map((step, index) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ delay: 0.6 + index * 0.15, duration: 0.4 }}
                    className="px-5 py-2.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {step}
                  </motion.div>
                  {index < operatingCycle.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.7 + index * 0.15, duration: 0.3 }}
                    >
                      <ArrowRight className="w-5 h-5 mx-2 text-muted-foreground" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* 부연 설명 */}
            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              중앙화된 전략, 분산화된 실행.
              <br />
              자본은 순환하며 가치를 키웁니다.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
