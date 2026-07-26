import { permanentRedirect } from 'next/navigation';

export default function LegacyContactUs() {
  permanentRedirect('/contact-us');
}
