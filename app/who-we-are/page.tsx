import { permanentRedirect } from 'next/navigation';

export default function LegacyAboutUs() {
  permanentRedirect('/about-us');
}
