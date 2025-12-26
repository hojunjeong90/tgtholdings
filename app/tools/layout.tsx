import type { Metadata } from 'next';
import {
  ToolsSidebar,
  MobileToolsSidebar,
} from '@/components/tools/ToolsSidebar';

export const metadata: Metadata = {
  title: '투자 도구',
  description: '실시간 환율 계산기, 주식 차트 분석 등 투자에 필요한 도구들을 제공합니다.',
  openGraph: {
    title: '투자 도구 | TGT Holdings',
    description: '실시간 환율 계산기, 주식 차트 분석 등 투자에 필요한 도구들을 제공합니다.',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <ToolsSidebar className="hidden md:block" />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Sidebar Toggle */}
          <MobileToolsSidebar />

          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
