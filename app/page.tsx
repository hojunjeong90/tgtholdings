import { FinancialMatrixLanding } from '@/components/landing/FinancialMatrixLanding';
import { IdentityBlock } from '@/components/landing/IdentityBlock';
import { PhilosophyBlock } from '@/components/landing/PhilosophyBlock';
import { CapabilitySnapshot } from '@/components/landing/CapabilitySnapshot';
import { InfrastructureBlock } from '@/components/landing/InfrastructureBlock';
import { ClosingBlock } from '@/components/landing/ClosingBlock';
import { MinimalistFooter } from '@/components/landing/MinimalistFooter';

export default function LandingPage() {
  return (
    <div>
      <FinancialMatrixLanding />
      <IdentityBlock />
      <PhilosophyBlock />
      <CapabilitySnapshot />
      <InfrastructureBlock />
      <ClosingBlock />
      <MinimalistFooter />
    </div>
  );
}
