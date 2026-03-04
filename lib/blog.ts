import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type BlogCategory = 'Macro' | 'Signals' | 'Infrastructure' | 'Risk' | 'Research';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  summary: string;
  content: string;
}

const BLOGS_DIR = path.join(process.cwd(), 'content/blogs');

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOGS_DIR)) return [];

  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: data.slug ?? file.replace(/\.md$/, ''),
      title: data.title ?? '',
      date: data.date ?? '',
      category: data.category as BlogCategory,
      summary: data.summary ?? '',
      content,
    };
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
