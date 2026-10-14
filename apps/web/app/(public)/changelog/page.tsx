'use client';

import { useTranslations } from 'next-intl';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';
import { Section, Reveal, Tag } from '@/components/shell/primitives';

const { mute, rule, acc } = SHELL_TOKENS;

type TagKey = 'major' | 'feature' | 'integration' | 'improvement' | 'launch';

const entryMeta: { version: string; tagKey: TagKey }[] = [
  { version: 'v1.2', tagKey: 'improvement' },
  { version: 'v1.1', tagKey: 'major' },
  { version: 'v1.0', tagKey: 'major' },
  { version: 'v0.9', tagKey: 'feature' },
  { version: 'v0.8', tagKey: 'feature' },
  { version: 'v0.7', tagKey: 'integration' },
  { version: 'v0.6', tagKey: 'feature' },
  { version: 'v0.5', tagKey: 'feature' },
  { version: 'v0.4', tagKey: 'improvement' },
  { version: 'v0.3', tagKey: 'feature' },
  { version: 'v0.2', tagKey: 'improvement' },
  { version: 'v0.1', tagKey: 'launch' },
];

export default function ChangelogPage() {
  const t = useTranslations('changelogPage');
  const entries = t.raw('entries') as { date: string; title: string; items: string[] }[];

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .rel { display: grid; grid-template-columns: 200px minmax(0,1fr); gap: 48px; padding: 48px 0; border-top: 1px solid ${rule}; }
        .rel-l { position: sticky; top: 96px; align-self: start; display: flex; flex-direction: column; gap: 8px; }
        .rel-l b { font-size: 28px; font-weight: 600; letter-spacing: -.03em; line-height: 1; }
        .rel-l span { color: ${mute}; font-size: 14px; }
        .rel-r { display: flex; flex-direction: column; gap: 20px; }
        .rel-r h2 { font-size: clamp(24px,2.6vw,32px); letter-spacing: -.03em; font-weight: 600; line-height: 1.1; margin: 0; }
        .rel:first-child .rel-l b { color: ${acc}; }
        @media (max-width: 760px) { .rel { grid-template-columns: minmax(0,1fr); gap: 16px; padding: 36px 0; } .rel-l { position: static; flex-direction: row; align-items: baseline; gap: 14px; } }
      `}</style>

      <Section>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {entries.map((entry, i) => (
            <Reveal key={entryMeta[i].version} as="div" className="rel">
              <div className="rel-l"><b>{entryMeta[i].version}</b><span>{entry.date}</span></div>
              <div className="rel-r">
                <div><Tag variant={entryMeta[i].tagKey === 'improvement' ? 'acc' : entryMeta[i].tagKey === 'major' || entryMeta[i].tagKey === 'launch' ? 'ink' : undefined}>{t(`tags.${entryMeta[i].tagKey}`)}</Tag></div>
                <h2>{entry.title}</h2>
                <ul className="checks">{entry.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
