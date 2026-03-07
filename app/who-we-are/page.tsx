import Link from 'next/link';

export const metadata = {
  title: 'Who We Are',
  description: 'TGT Holdings is an AI-native proprietary trading firm and private office. We deploy autonomous systems across global markets — no external capital, no discretionary overrides.',
};

const profile = [
  {
    label: 'Capital',
    value: 'Proprietary Only',
    detail: 'No external investors. No outside mandates.',
  },
  {
    label: 'Markets',
    value: 'Equities · Futures · FX · Digital Assets',
    detail: 'Multi-asset systematic exposure.',
  },
  {
    label: 'Coverage',
    value: 'US · EU · APAC · KR',
    detail: 'Global reach, region-specific signal sets.',
  },
  {
    label: 'Decisions',
    value: 'Fully Autonomous',
    detail: 'AI-driven. No discretionary overrides in live trading.',
  },
  {
    label: 'Operation',
    value: '24 / 7 Continuous',
    detail: 'Systems run without market hours.',
  },
  {
    label: 'Research',
    value: 'Always On',
    detail: 'Hypothesis testing and model iteration never stop.',
  },
];

const systems = [
  {
    id: 'AE',
    name: 'Alpha Engine',
    description: 'Discovers and validates statistical edges across markets and timeframes. Runs continuous hypothesis testing against live and historical data.',
    primary: true,
  },
  {
    id: 'RC',
    name: 'Risk Controller',
    description: 'Enforces drawdown limits, exposure caps, and correlation constraints in real time. Operates independently of the alpha layer.',
    primary: true,
  },
  {
    id: 'XA',
    name: 'Execution Agent',
    description: 'Optimizes order routing and fill quality. Minimizes market impact and measures transaction costs against benchmark.',
    primary: true,
  },
  {
    id: 'RP',
    name: 'Research Pipeline',
    description: 'Ingests alternative and structured data, runs feature engineering, and feeds model training cycles. Outputs feed back into the Alpha Engine.',
    primary: false,
  },
  {
    id: 'MS',
    name: 'Monitoring Stack',
    description: '24/7 anomaly detection across system health, signal drift, and execution quality. Triggers circuit breakers automatically when thresholds are breached.',
    primary: false,
  },
];

const values = [
  {
    title: 'Intellectual Honesty',
    body: 'We update our views when the data demands it. Attachment to a position after evidence shifts is not conviction — it is bias.',
  },
  {
    title: 'Structural Thinking',
    body: 'We look for mechanisms, not patterns. A signal without a causal story is noise with good marketing.',
  },
  {
    title: 'Long-horizon Discipline',
    body: 'We measure our edge over years, not quarters. Short-term performance pressure is the most reliable way to destroy long-term returns.',
  },
  {
    title: 'Closed Culture',
    body: 'We share little externally and iterate intensely internally. The quality of our systems is the foundation of every outcome we produce.',
  },
];

export default function WhoWeAre() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Firm
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            Who We Are
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            TGT Holdings is an AI-native proprietary trading firm structured as a private office.
            We deploy autonomous systems across global markets — no external capital,
            no discretionary overrides, no opinions.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <blockquote className="space-y-5 md:space-y-6 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-muted-foreground">
            <p>
              We believe markets are{' '}
              <span className="text-foreground font-medium">partially predictable</span> — not because they are irrational, but because information diffuses unevenly and incentives create structural mispricings.
            </p>
            <p>
              Our edge is not a secret formula. It is{' '}
              <span className="text-foreground font-medium">process discipline</span> — the compounding of small, repeatable advantages over long periods without drifting from the method when it underperforms.
            </p>
            <p>
              Capital is a tool. We measure our work not only by returns but by whether the system we built today is{' '}
              <span className="text-foreground font-medium">more robust</span> than the one we had yesterday —
              and whether it is still running correctly at 3 a.m.
            </p>
          </blockquote>
        </div>
      </section>

      {/* Firm Profile */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex items-baseline justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold">Firm Profile</h2>
            <span className="text-xs font-mono text-muted-foreground/50 tracking-widest uppercase">
              Private Office · Prop Capital
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {profile.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-muted/10 p-5 md:p-6 flex flex-col gap-2"
              >
                <p className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="text-sm md:text-base font-semibold text-foreground leading-snug">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex items-baseline justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold">System Architecture</h2>
            <span className="text-xs font-mono text-muted-foreground/50 tracking-widest uppercase">
              {systems.length} components · always running
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {systems.map((sys) => (
              <div
                key={sys.id}
                className={`relative rounded-xl border p-5 md:p-6 flex flex-col gap-3 transition-colors ${
                  sys.primary
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/8'
                    : 'border-border/50 bg-muted/10 hover:bg-muted/20'
                }`}
              >
                {sys.primary && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0 ${
                    sys.primary
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {sys.id}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {sys.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  {sys.description}
                </p>
              </div>
            ))}

            {/* Expanding slot */}
            <div className="rounded-xl border border-dashed border-border/40 p-5 md:p-6 flex flex-col gap-3 items-center justify-center text-center opacity-40">
              <div className="w-9 h-9 rounded-lg border border-dashed border-border/60 flex items-center justify-center text-lg text-muted-foreground/30">
                +
              </div>
              <p className="text-xs font-mono text-muted-foreground/50 leading-snug">
                Next module<br />in development
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs font-mono text-muted-foreground/40">
            ● Core decision layer
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {values.map((v) => (
              <div key={v.title} className="p-6 md:p-8 rounded-xl border border-border/60 bg-muted/20">
                <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">{v.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Build the infrastructure with us.</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
                We look for engineers and researchers who build things that run without supervision.
              </p>
            </div>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
            >
              View Careers
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
