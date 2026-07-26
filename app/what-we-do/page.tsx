import type { Metadata } from 'next';
import WhatWeDoPage from '@/components/public/WhatWeDoPage';

export const metadata: Metadata = {
  title: 'What We Do',
  description: 'How TGT Quant builds and deploys quantitative investment strategies from data acquisition and signal research to live execution and continuous risk monitoring.',
};

export default function WhatWeDo() {
  return <WhatWeDoPage />;
}
