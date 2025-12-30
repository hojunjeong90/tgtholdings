import type { Metadata } from 'next';
import {
  MarketSidebar,
  MobileMarketSidebar,
} from '@/components/market/MarketSidebar';

export const metadata: Metadata = {
  title: '마켓',
  description: '암호화폐 실시간 가격, 김치프리미엄, 펀딩비 등 시장 데이터를 제공합니다.',
  openGraph: {
    title: '마켓 | TGT Holdings',
    description: '암호화폐 실시간 가격, 김치프리미엄, 펀딩비 등 시장 데이터를 제공합니다.',
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <MarketSidebar className="hidden md:block" />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Sidebar Toggle */}
          <MobileMarketSidebar />

          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
