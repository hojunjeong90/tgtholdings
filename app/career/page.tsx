import type { Metadata } from 'next';
import CareerPage from '@/components/public/CareerPage';

export const metadata: Metadata = {
  title: 'Career',
  description: 'Join TGT Quant. We look for researchers and engineers with deep technical foundations, systems-level intuition, and a commitment to evidence over ego.',
};

export default function Career() {
  return <CareerPage />;
}
