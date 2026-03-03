import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tgtquant.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  return [
    { url: SITE_URL, lastModified: currentDate, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/how-we-work`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/who-we-are`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/ideas`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/careers`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
  ];
}
