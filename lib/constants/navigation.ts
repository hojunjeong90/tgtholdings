export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'Research' },
  { href: '/about-us', label: 'About Us' },
  { href: '/what-we-do', label: 'What We Do' },
  { href: '/career', label: 'Career' },
  { href: '/contact-us', label: 'Contact Us' },
];
