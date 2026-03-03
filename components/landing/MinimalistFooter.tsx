import Link from 'next/link';

export function MinimalistFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/30">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between text-xs text-muted-foreground/50">
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
