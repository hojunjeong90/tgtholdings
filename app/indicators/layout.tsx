import type { Metadata } from 'next';
import {
  IndicatorsSidebar,
  MobileIndicatorsSidebar,
} from '@/components/indicators/IndicatorsSidebar';

export const metadata: Metadata = {
  title: '경제 지표',
  description: '글로벌 통화 지표, 금리, 유동성 등 주요 경제 지표를 실시간으로 분석합니다.',
  openGraph: {
    title: '경제 지표 | TGT Holdings',
    description: '글로벌 통화 지표, 금리, 유동성 등 주요 경제 지표를 실시간으로 분석합니다.',
  },
};

export default function IndicatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <IndicatorsSidebar className="hidden md:block" />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Sidebar Toggle */}
          <MobileIndicatorsSidebar />

          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
