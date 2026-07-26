import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';
import { renderMarkdown } from '@/lib/markdown';

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
    title: `${post.title} — Research | TGT Holdings`,
    description: post.summary,
  };
}

export default async function ResearchPostPage({
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
      <article className="content-shell max-w-5xl py-16 md:py-24">
        <Link
          href="/research"
          className="label-mono inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          &larr; Research
        </Link>

        <div className="mb-10 md:mb-14">
          <div className="label-mono flex items-center gap-3 mb-3 text-muted-foreground">
            <span>{post.category}</span>
            <span className="text-border">|</span>
            <span>{post.date.replace(/-/g, '.')}</span>
          </div>
          <h1 className="font-display text-giant font-semibold tracking-[-0.055em] leading-[0.95]">
            {post.title}
          </h1>
        </div>

        <div className="prose-tgt" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
