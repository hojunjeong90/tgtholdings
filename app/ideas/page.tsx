export const metadata = { title: 'Ideas' };

const categories = ['Macro', 'Signals', 'Infrastructure', 'Risk', 'Research'];

export default function Ideas() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Research & Writing
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            Ideas
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Research notes. Market observations. Long-form thinking on quantitative finance, macro structure, and the mechanics of systematic investing.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl py-4 flex flex-wrap items-center gap-2 md:gap-3">
          <button className="text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-md bg-primary text-primary-foreground">
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className="text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-md border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <div className="inline-block font-mono text-4xl md:text-6xl mb-6 md:mb-8 text-border select-none">∅</div>
          <p className="text-lg md:text-xl font-medium mb-3">Nothing published yet.</p>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The first notes are being written. When they&apos;re ready, they&apos;ll appear here — unfiltered, and worth the wait.
          </p>
        </div>
      </section>
    </div>
  );
}
