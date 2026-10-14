'use client';

import { useTranslations } from 'next-intl';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';
import { Section, Reveal, ChecksList } from '@/components/shell/primitives';

const { rule, acc, off, ink2 } = SHELL_TOKENS;

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicyPage');
  const sections = t.raw('sections') as { title: string; items: string[] }[];

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .pv { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 64px; }
        .pv nav { position: sticky; top: 112px; align-self: start; display: flex; flex-direction: column; gap: 4px; }
        .pv nav a { padding: 8px 12px; border-radius: 8px; font-size: 14px; color: ${ink2}; }
        .pv nav a:hover { background: ${off}; color: #0B0B10; }
        .pv-note { border: 1px solid ${rule}; background: ${off}; border-radius: 16px; padding: 24px 28px; color: ${ink2}; font-size: 15px; margin-bottom: 56px; }
        .pv-s { padding-bottom: 56px; scroll-margin-top: 96px; }
        .pv-s h2 { font-size: 28px; letter-spacing: -.03em; font-weight: 600; margin-bottom: 18px; display: flex; align-items: baseline; gap: 14px; }
        .pv-s h2 span { font-family: var(--font-geist-mono), monospace; font-size: 12px; color: ${acc}; font-weight: 400; }
        @media (max-width: 960px) { .pv { grid-template-columns: minmax(0,1fr); } .pv nav { display: none; } }
      `}</style>

      <Section>
        <div className="pv">
          <nav>
            {sections.map((s, i) => <a key={s.title} href={`#p${i}`}>{s.title}</a>)}
          </nav>
          <div>
            <Reveal><p className="pv-note">{t('notice')}</p></Reveal>
            {sections.map((s, i) => (
              <Reveal key={s.title} as="div" className="pv-s" id={`p${i}`}>
                <h2><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                <ChecksList items={s.items} neg={i === 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
