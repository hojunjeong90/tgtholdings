'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Building, TrendingUp, Lightbulb, Heart, ChevronRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const structureNodes = [
  {
    id: 'operating',
    icon: Building,
    title: '운영 회사',
    subtitle: 'Operating Companies',
    description: '실제 비즈니스를 운영하는 자회사들',
    position: 'left',
  },
  {
    id: 'investment',
    icon: TrendingUp,
    title: '투자 구조',
    subtitle: 'Investment Vehicles',
    description: '전략적 투자와 포트폴리오 관리',
    position: 'right',
  },
  {
    id: 'experimental',
    icon: Lightbulb,
    title: '실험 유닛',
    subtitle: 'Experimental Units',
    description: '새로운 기회를 탐색하는 실험적 프로젝트',
    position: 'left',
  },
  {
    id: 'impact',
    icon: Heart,
    title: '사회적 임팩트',
    subtitle: 'Social Impact',
    description: '구조적으로 설계된 가치 환원',
    position: 'right',
  },
];

const keyPoints = [
  '위험은 격리됩니다.',
  '자율성은 존중됩니다.',
  '자본은 소비되지 않고 배분됩니다.',
];

export function StructureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section
      id="structure"
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
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8">
              Holdings인 이유
            </h2>

            {/* 핵심 포인트 */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {keyPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 구조 다이어그램 */}
          <motion.div variants={fadeInUp} className="relative">
            {/* 중앙 노드 - TGT Holdings */}
            <div className="flex justify-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="relative z-10 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg"
              >
                TGT Holdings
              </motion.div>
            </div>

            {/* 연결선 (SVG) */}
            <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-full h-40 pointer-events-none">
              <svg
                className="w-full h-full"
                viewBox="0 0 800 160"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* 왼쪽 연결선들 */}
                <motion.path
                  d="M400 0 L200 80"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-border"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
                <motion.path
                  d="M400 0 L200 160"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-border"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
                {/* 오른쪽 연결선들 */}
                <motion.path
                  d="M400 0 L600 80"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-border"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
                <motion.path
                  d="M400 0 L600 160"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-border"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
              </svg>
            </div>

            {/* 하위 노드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-24 md:gap-y-8">
              {structureNodes.map((node, index) => {
                const Icon = node.icon;
                const isActive = activeNode === node.id;

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                    className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-background border-primary shadow-lg scale-[1.02]'
                        : 'bg-background/50 border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 아이콘 */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>

                      {/* 텍스트 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{node.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{node.subtitle}</p>
                        <p
                          className={`text-sm text-muted-foreground transition-all ${
                            isActive ? 'opacity-100 max-h-20' : 'opacity-70 max-h-10 overflow-hidden'
                          }`}
                        >
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 하단 인용문 */}
          <motion.div variants={fadeInUp} className="text-center mt-16 md:mt-20">
            <blockquote className="text-xl md:text-2xl text-muted-foreground italic">
              &ldquo;우리는 사람을 관리하지 않습니다.
              <br />
              <span className="text-foreground font-medium not-italic">인센티브를 설계합니다.</span>&rdquo;
            </blockquote>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
