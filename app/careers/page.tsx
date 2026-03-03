import Link from 'next/link';

export const metadata = {
  title: 'Careers',
  description: 'Join TGT Quant. We look for researchers and engineers with deep technical foundations, systems-level intuition, and a commitment to evidence over ego.',
};

const traits = [
  {
    title: 'Deep technical foundation',
    body: 'Statistics, probability, and numerical methods are the grammar of our work. You don\'t need a specific degree — you need to think precisely.',
  },
  {
    title: 'Systems-level intuition',
    body: 'Good researchers here see markets as mechanisms. They ask why a signal should work, not just whether it has.',
  },
  {
    title: 'Tolerance for uncertainty',
    body: 'We operate with incomplete information under time pressure. Comfort with ambiguity and the ability to act decisively despite it is essential.',
  },
  {
    title: 'Low ego, high standards',
    body: 'We debate everything and defer to evidence. If you need to be right more than you need to find the truth, this is not the right environment.',
  },
];

const openRoles = [
  {
    title: 'Quant Researcher',
    type: 'Full-time · Remote-friendly',
    desc: 'Design and test systematic alpha strategies across asset classes. Own the full research lifecycle from hypothesis to live deployment.',
    tags: ['Python', 'Statistics', 'Backtesting', 'Time-series'],
  },
  {
    title: 'ML Signal Engineer',
    type: 'Full-time · Remote-friendly',
    desc: 'Build and iterate on machine learning models for return prediction and market regime classification.',
    tags: ['ML/DL', 'Feature Engineering', 'PyTorch / sklearn', 'Signal Research'],
  },
  {
    title: 'Data Engineer',
    type: 'Full-time · Remote-friendly',
    desc: 'Design and maintain the data infrastructure that feeds our research and production systems. Data quality is a first-class concern.',
    tags: ['Pipeline Design', 'Market Data', 'SQL', 'Data Quality'],
  },
  {
    title: 'Quant DevOps Engineer',
    type: 'Full-time · Remote-friendly',
    desc: 'Own the production infrastructure for strategy deployment, monitoring, and reproducibility. Bridge research and live trading.',
    tags: ['Systems', 'Docker / Cloud', 'Monitoring', 'CI/CD'],
  },
  {
    title: 'Execution Specialist',
    type: 'Full-time · Remote-friendly',
    desc: 'Analyze and improve order routing, fill quality, and execution cost models. Market microstructure knowledge essential.',
    tags: ['Execution', 'Microstructure', 'TCA', 'Latency'],
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Join Us
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            Careers
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            We are a small, deliberate team. We hire rarely and carefully. If you are the kind of person who reads research papers for enjoyment and builds things to understand them — we want to talk.
          </p>
        </div>
      </section>

      {/* What we look for */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">What We Look For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {traits.map((t) => (
              <div key={t.title} className="flex gap-4 md:gap-5">
                <span className="text-primary mt-1 flex-shrink-0">—</span>
                <div>
                  <h3 className="font-semibold mb-1.5 md:mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles — Always Recruiting */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex items-baseline justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold">Open Roles</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-primary/80 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Always Recruiting
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="py-6 md:py-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-base md:text-lg font-semibold">{role.title}</h3>
                    <span className="text-xs font-mono text-muted-foreground/60">{role.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-xl">
                    {role.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/70 bg-muted/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-border/60 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Apply
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted-foreground/50 leading-relaxed">
            Don&apos;t see your role listed? We consider exceptional candidates for any function.
            Send a note to <a href="mailto:careers@tgtholdings.com" className="hover:text-muted-foreground transition-colors underline underline-offset-2">careers@tgtholdings.com</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="max-w-xl">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Reach Out Anyway</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              If you think you belong here, send us a short note. Tell us what you&apos;ve built, what you&apos;re reading, and what problem you would work on if you joined.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get in Touch
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
