'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Layers, Compass, RefreshCcw } from 'lucide-react';
import { fadeInUp, staggerContainer, cardHover } from '@/lib/animations/variants';

const philosophies = [
  {
    icon: Layers,
    title: '자본은 견고해야 한다',
    description:
      '선함은 지속성을 전제로 합니다. 일시적 도움이 아닌, 구조적으로 지속 가능한 가치 창출을 추구합니다.',
    detail:
      '단기 수익 추구가 아닌 장기적 복리 효과를 통해 견고한 자본 기반을 구축합니다.',
  },
  {
    icon: Compass,
    title: '성장에는 방향이 필요하다',
    description:
      '목적 없는 증식은 소멸입니다. 우리의 성장은 명확한 방향성과 의도를 가집니다.',
    detail:
      '자본의 성장이 사회적 가치와 연결될 때, 그 성장은 의미를 갖습니다.',
  },
  {
    icon: RefreshCcw,
    title: '환원은 구조적이어야 한다',
    description:
      '감정적 기부가 아닌, 시스템에 내재된 환원 메커니즘을 설계합니다.',
    detail:
      '규모가 커질수록 더 많이 되돌리는 구조. 이것이 우리가 설계하는 자본입니다.',
  },
];

export function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="philosophy"
      ref={ref}
      className="relative min-h-screen flex items-center py-24 md:py-32 bg-muted/30"
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Giving Tree는 자선이 아닙니다.
              <br />
              <span className="text-muted-foreground">자본의 구조입니다.</span>
            </h2>
          </motion.div>

          {/* 철학 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {philosophies.map((philosophy, index) => {
              const Icon = philosophy.icon;

              return (
                <motion.div
                  key={philosophy.title}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  custom={index}
                >
                  <motion.div
                    variants={cardHover}
                    className="group relative h-full p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-colors"
                  >
                    {/* 아이콘 */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-xl font-semibold mb-4">{philosophy.title}</h3>

                    {/* 설명 */}
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {philosophy.description}
                    </p>

                    {/* 호버 시 추가 설명 */}
                    <div className="overflow-hidden">
                      <p className="text-sm text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {philosophy.detail}
                      </p>
                    </div>

                    {/* 장식적 요소 */}
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon className="w-full h-full" strokeWidth={0.5} />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
