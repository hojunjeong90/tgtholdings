export const metadata = { title: 'Contact' };

const channels = [
  {
    label: 'General',
    email: 'contact@tgtholdings.com',
    desc: 'Partnerships, press, and general inquiries.',
  },
  {
    label: 'Careers',
    email: 'careers@tgtholdings.com',
    desc: 'Unsolicited applications and role inquiries.',
  },
  {
    label: 'Research',
    email: 'research@tgtholdings.com',
    desc: 'Data providers, academic collaborations, and research questions.',
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-4 md:mb-5 font-mono">
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 md:mb-6">
            Get in Touch
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            We respond to messages that are specific, direct, and relevant.
            No pitches. No solicitations.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {channels.map((c) => (
              <div key={c.label} className="p-6 md:p-8 rounded-xl border border-border/60 bg-muted/20">
                <p className="text-xs uppercase tracking-widest text-primary font-mono mb-3 md:mb-4">{c.label}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="block font-mono text-xs md:text-sm text-foreground hover:text-primary transition-colors mb-2 md:mb-3 break-all"
                >
                  {c.email}
                </a>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">A Note on Response Times</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We read every message. We respond to the ones where a conversation would be genuinely useful to both sides.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you do not hear back within two weeks, it means the fit was not there — not that the message was missed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
