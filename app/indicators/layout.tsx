import {
  IndicatorsSidebar,
  MobileIndicatorsSidebar,
} from '@/components/indicators/IndicatorsSidebar';

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
