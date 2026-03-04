import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';
import { renderMarkdown } from '@/lib/markdown';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Ideas | TGT Holdings`,
    description: post.summary,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-6 md:px-12 max-w-3xl py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          &larr; Ideas
        </Link>

        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>{post.category}</span>
            <span className="text-border">|</span>
            <span>{post.date.replace(/-/g, '.')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Body */}
        <div
          className="prose-tgt"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
