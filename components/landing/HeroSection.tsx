'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, scrollHintBounce } from '@/lib/animations/variants';
import { NetworkBackground } from './NetworkBackground';

export function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* 네트워크 배경 */}
      <NetworkBackground />

      {/* 노이즈 텍스처 오버레이 */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 메인 콘텐츠 */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 container mx-auto px-4 md:px-6 text-center"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.3 },
            },
          }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* 헤드라인 */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            자본이 바르게 서고,
            <br />
            <span className="text-primary">부가 되돌아가는 곳</span>
          </motion.h1>

          {/* 서브카피 */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            TGT Holdings는 장기적으로 성장하면서도
            <br className="hidden md:block" />
            글로벌과 로컬 커뮤니티에 가치를 환원하는
            <br className="hidden md:block" />
            자본 시스템을 설계합니다.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection('philosophy')}
              className="w-full sm:w-auto px-8"
            >
              우리의 철학
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection('structure')}
              className="w-full sm:w-auto px-8"
            >
              구조 보기
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 스크롤 힌트 */}
      <motion.div
        variants={scrollHintBounce}
        animate="animate"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-sm">스크롤하여 더 알아보기</span>
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
}
