import { getAllPosts } from '@/lib/blog';
import PostList from '@/components/blog/PostList';

export const metadata = {
  title: 'Ideas',
  description:
    'Research notes, market observations, and long-form thinking on quantitative finance, macro structure, and the mechanics of systematic investing from TGT Quant.',
};

export default function Ideas() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Research & Writing
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            Ideas
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Research notes. Market observations. Long-form thinking on quantitative finance, macro
            structure, and the mechanics of systematic investing.
          </p>
        </div>
      </section>

      <PostList posts={posts} />
    </div>
  );
}
