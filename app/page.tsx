import { HeroSection } from '@/components/landing/HeroSection';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { WhatWeDoSection } from '@/components/landing/WhatWeDoSection';
import { StructureSection } from '@/components/landing/StructureSection';
import { ImpactSection } from '@/components/landing/ImpactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="relative">
      <HeroSection />
      <PhilosophySection />
      <WhatWeDoSection />
      <StructureSection />
      <ImpactSection />
      <LandingFooter />
    </div>
  );
}
