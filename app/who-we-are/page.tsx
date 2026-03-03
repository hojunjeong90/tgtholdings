import Link from 'next/link';

export const metadata = { title: 'Who We Are' };

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
    body: 'We share little externally and debate intensely internally. The quality of internal discourse is the foundation of every decision we make.',
  },
];

// core: true = highlighted as founding/core member
const team = [
  {
    name: 'Peter Jeong',
    initials: 'PJ',
    role: 'Quant Researcher',
    focus: 'Alpha discovery & strategy design.',
    core: true,
  },
  {
    name: 'Mira Chen',
    initials: 'MC',
    role: 'ML Signal Engineer',
    focus: 'Predictive modeling & feature research.',
    core: true,
  },
  {
    name: 'Marcus Webb',
    initials: 'MW',
    role: 'Risk Manager',
    focus: 'Drawdown controls & model validation.',
    core: true,
  },
  {
    name: 'Kai Nakamura',
    initials: 'KN',
    role: 'Execution Specialist',
    focus: 'Fill quality & transaction cost analysis.',
    core: false,
  },
  {
    name: 'Sol Park',
    initials: 'SP',
    role: 'Data Engineer',
    focus: 'Pipeline integrity & market data.',
    core: false,
  },
  {
    name: 'Lena Volkov',
    initials: 'LV',
    role: 'Quant DevOps',
    focus: 'Production systems & reproducibility.',
    core: false,
  },
  {
    name: 'Yuna Kim',
    initials: 'YK',
    role: 'Portfolio Manager',
    focus: 'Capital allocation & position sizing.',
    core: false,
  },
  {
    name: 'Adrian Cross',
    initials: 'AC',
    role: 'Middle Office',
    focus: 'Settlement, margin & ops reporting.',
    core: false,
  },
  {
    name: 'Priya Sharma',
    initials: 'PS',
    role: 'Compliance',
    focus: 'Regulatory monitoring & audit.',
    core: false,
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
            TGT Quant is a quantitative investment firm structured as a private office.
            We allocate proprietary capital — no external investors, no outside mandates —
            through systematic strategies across global asset classes.
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

      {/* Team */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex items-baseline justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold">The Team</h2>
            <span className="text-xs font-mono text-muted-foreground/50 tracking-widest uppercase">
              {team.length} agents · always on
            </span>
          </div>

          {/* 2×5 grid: 2 col mobile → 3 col tablet → 5 col desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                className={`relative rounded-xl border p-4 md:p-5 flex flex-col gap-3 transition-colors ${
                  member.core
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/8'
                    : 'border-border/50 bg-muted/10 hover:bg-muted/20'
                }`}
              >
                {member.core && (
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {/* Monogram */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0 ${
                    member.core
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {member.initials}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">
                    {member.name}
                  </p>
                  <p className={`text-xs mt-0.5 font-mono truncate ${
                    member.core ? 'text-primary/80' : 'text-muted-foreground/70'
                  }`}>
                    {member.role}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
                  {member.focus}
                </p>
              </div>
            ))}

            {/* 10th slot — open seat */}
            <div className="rounded-xl border border-dashed border-border/40 p-4 md:p-5 flex flex-col gap-3 items-center justify-center text-center opacity-50">
              <div className="w-9 h-9 rounded-lg border border-dashed border-border/60 flex items-center justify-center text-lg text-muted-foreground/30">
                +
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground/50 leading-snug">
                  Your seat.<br />Always open.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs font-mono text-muted-foreground/40">
            ● Core member
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

      {/* Join CTA */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Think you belong here?</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
                We&apos;re always looking for people who think rigorously and build things carefully.
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
