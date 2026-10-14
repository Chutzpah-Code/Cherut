'use client';

import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/shell/Shell';
import { Section, Reveal, Cards, Card, Band } from '@/components/shell/primitives';
import { SHELL_TOKENS } from '@/components/shell/Shell';

const { ink, ruleD, accLight } = SHELL_TOKENS;

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const manifesto = t.raw('manifesto') as string[];
  const principles = t.raw('principles') as { title: string; body: string }[];

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .bel { background: ${ink}; color: #fff; padding: 24px 0 96px; }
        .bel-i { display: grid; grid-template-columns: 120px minmax(0,1fr); gap: 32px; padding: 36px 0; border-bottom: 1px solid ${ruleD}; align-items: baseline; }
        .bel-i span { font-family: var(--font-geist-mono), monospace; font-size: 13px; color: ${accLight}; }
        .bel-i p { font-size: clamp(24px,3.2vw,40px); line-height: 1.15; letter-spacing: -.03em; font-weight: 500; text-wrap: balance; color: rgba(255,255,255,.55); transition: color .4s; margin: 0; }
        .bel-i.in p { color: #fff; }
        @media (max-width: 760px) { .bel-i { grid-template-columns: minmax(0,1fr); gap: 10px; padding: 28px 0; } }
      `}</style>

      <section className="bel">
        <div className="wrap">
          {manifesto.map((line, i) => (
            <Reveal key={line} className="bel-i">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <p>{line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Section>
        <Reveal><h2 className="h2" style={{ marginBottom: 40 }}>{t('principlesHeading')}</h2></Reveal>
        <Reveal>
          <Cards cols={2}>
            {principles.map((p, i) => (
              <Card key={p.title} k={String(i + 1).padStart(2, '0')} title={p.title}>{p.body}</Card>
            ))}
          </Cards>
        </Reveal>
      </Section>

      <Section padTop0>
        <Reveal>
          <Band title={t('tryHeading')} body={t('trySub')} ctaLabel={t('tryCta')} ctaHref="/auth/register" />
        </Reveal>
      </Section>
    </PageShell>
  );
}
