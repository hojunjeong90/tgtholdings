/**
 * 네비게이션 상수
 * TopBar와 MobileMenu에서 공유
 */

export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: '홈' },
  { href: '/indicators', label: '지표' },
  { href: '/tools', label: '도구' },
  { href: '/market', label: '마켓' },
  { href: '/news', label: '뉴스' },
  { href: '/feed', label: '피드' },
];
