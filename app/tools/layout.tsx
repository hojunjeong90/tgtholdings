import {
  ToolsSidebar,
  MobileToolsSidebar,
} from '@/components/tools/ToolsSidebar';

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
