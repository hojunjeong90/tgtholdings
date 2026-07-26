import Link from 'next/link';
import { navItems } from '@/lib/constants/navigation';

export function MinimalistFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/30">
      <div className="content-shell">
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-6 text-xs text-muted-foreground/65">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} className="py-1 transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-4 border-t border-border/20 pt-6 sm:flex-row sm:justify-between text-xs text-muted-foreground/50">
          <p className="text-center sm:text-left">&copy; {currentYear} TGT Quant. All rights reserved.</p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/legal/terms" className="py-1 hover:text-muted-foreground transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="py-1 hover:text-muted-foreground transition-colors">
              Privacy
            </Link>
            <a href="mailto:contact@tgtholdings.com" className="py-1 hover:text-muted-foreground transition-colors">
              contact@tgtholdings.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
