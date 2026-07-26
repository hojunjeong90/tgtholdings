import type { Metadata } from 'next';
import AboutUsPage from '@/components/public/AboutUsPage';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'TGT Holdings is an AI-native proprietary trading firm and private office. We deploy autonomous systems across global markets — no external capital, no discretionary overrides.',
};

export default function AboutUs() {
  return <AboutUsPage />;
}
