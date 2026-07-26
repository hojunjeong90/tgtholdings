import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tgtquant.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  return [
    { url: SITE_URL, lastModified: currentDate, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/research`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about-us`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/what-we-do`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/career`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact-us`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.6 },
  ];
}
