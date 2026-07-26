import type { Metadata } from 'next';
import ContactUsPage from '@/components/public/ContactUsPage';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with TGT Quant for partnerships, press inquiries, career opportunities, and research collaborations.',
};

export default function ContactUs() {
  return <ContactUsPage />;
}
