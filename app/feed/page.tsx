import { Card, CardContent } from '@/components/ui/card';
import { Rss } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-12 pb-12">
          <Rss className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">피드</h1>
          <p className="text-muted-foreground mb-6">
            뉴스 피드 기능이 곧 출시됩니다.
          </p>
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
            Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
