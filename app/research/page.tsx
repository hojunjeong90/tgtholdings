import { getAllPosts } from '@/lib/blog';
import PostList from '@/components/blog/PostList';

export const metadata = {
  title: 'Research',
  description:
    'Research notes, market observations, and long-form thinking on quantitative finance, macro structure, and the mechanics of systematic investing from TGT Quant.',
};

export default function Research() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="content-shell">
          <p className="label-mono text-primary mb-4 md:mb-5">
            Research &amp; Writing
          </p>
          <h1 className="font-display text-giant font-semibold tracking-[-0.055em] leading-[0.95] mb-5 md:mb-6">
            Research
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Research notes. Market observations. Long-form thinking on quantitative finance, macro
            structure, and the mechanics of systematic investing.
          </p>
        </div>
      </section>

      <PostList posts={posts} />
    </div>
  );
}
