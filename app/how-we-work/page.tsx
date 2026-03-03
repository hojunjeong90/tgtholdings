export const metadata = { title: 'How We Work' };

const steps = [
  {
    index: '01',
    title: 'Data Acquisition',
    body: 'We source structured and alternative data across global markets — price series, macro releases, on-chain activity, and proprietary datasets — and normalise them into a unified research environment.',
  },
  {
    index: '02',
    title: 'Signal Research',
    body: 'Researchers develop quantitative hypotheses grounded in economic theory and statistical rigour. Every signal undergoes out-of-sample testing and stress analysis before it reaches the portfolio layer.',
  },
  {
    index: '03',
    title: 'Portfolio Construction',
    body: 'Signals are combined through a disciplined allocation framework that balances expected return against tail-risk. Position sizing is systematic; discretion operates only at the strategy level.',
  },
  {
    index: '04',
    title: 'Execution',
    body: 'Orders are routed through low-latency infrastructure with transaction-cost models embedded in the loop. Market impact is treated as a first-class constraint, not an afterthought.',
  },
  {
    index: '05',
    title: 'Risk & Monitoring',
    body: 'A live risk engine tracks factor exposures, drawdown limits, and liquidity constraints in real time. Automated circuit-breakers enforce pre-agreed risk thresholds without human intervention.',
  },
  {
    index: '06',
    title: 'Research Loop',
    body: 'Every closed trade feeds back into the research system. We measure signal decay, attribution, and regime sensitivity continuously — the process improves because the feedback is permanent.',
  },
];

const principles = [
  { label: 'Rules over discretion', desc: 'Decisions follow models. Models follow evidence.' },
  { label: 'Separation of concerns', desc: 'Research, execution, and risk run independently.' },
  { label: 'Reproducibility', desc: 'Every result must be reconstructable from raw data.' },
];

export default function HowWeWork() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Process
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            How We Work
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Systematic. Rigorous. Reproducible.
            <br />
            We build investment processes the same way we build software — with version control, testing, and no magic.
            Every stage runs continuously; there are no office hours, no shift changes, no cognitive fatigue between sessions.
          </p>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-8 md:gap-y-12">
            {steps.map((s) => (
              <div key={s.index} className="flex gap-4 md:gap-6">
                <span className="font-mono text-sm text-primary pt-1 flex-shrink-0 w-7 md:w-8">{s.index}</span>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">Guiding Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {principles.map((p) => (
              <div key={p.label} className="p-5 md:p-6 rounded-xl border border-border/60 bg-muted/20">
                <h4 className="font-semibold mb-2">{p.label}</h4>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
