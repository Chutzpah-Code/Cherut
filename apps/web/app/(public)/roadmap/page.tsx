'use client';

import { useTranslations } from 'next-intl';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';
import { Section, Reveal, Band } from '@/components/shell/primitives';

const { mute, rule, off, acc, accSoft } = SHELL_TOKENS;

type Status = 'shipped' | 'progress' | 'planned';

function Dot({ status }: { status: Status }) {
  const style: React.CSSProperties = { width: 10, height: 10, borderRadius: '50%' };
  if (status === 'shipped') return <span style={{ ...style, background: SHELL_TOKENS.ink }} />;
  if (status === 'progress') return <span style={{ ...style, background: acc, boxShadow: `0 0 0 4px ${accSoft}` }} />;
  return <span style={{ ...style, border: '2px solid rgba(11,11,16,.3)' }} />;
}

export default function RoadmapPage() {
  const t = useTranslations('roadmapPage');
  const shipped = t.raw('shipped') as { name: string; desc: string }[];
  const inProgress = t.raw('inProgress') as { name: string; desc: string }[];
  const planned = t.raw('planned') as { name: string; desc: string }[];

  const columns: { status: Status; label: string; items: { name: string; desc: string }[]; highlight?: boolean }[] = [
    { status: 'shipped', label: t('statusShipped'), items: shipped },
    { status: 'progress', label: t('statusInProgress'), items: inProgress, highlight: true },
    { status: 'planned', label: t('statusPlanned'), items: planned },
  ];

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .rm { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; align-items: start; }
        .rm-col { background: ${off}; border: 1px solid ${rule}; border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .rm-col.prog { background: ${accSoft}; border-color: rgba(59,91,246,.2); }
        .rm-h { display: flex; align-items: center; gap: 10px; padding: 8px 8px 12px; }
        .rm-h b { font-size: 16px; font-weight: 600; }
        .rm-h .count { margin-left: auto; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: ${mute}; background: #fff; padding: 4px 10px; border-radius: 999px; }
        .rm-i { background: #fff; border: 1px solid ${rule}; border-radius: 12px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(11,11,16,.04); }
        .rm-i h3 { font-size: 16px; font-weight: 600; letter-spacing: -.01em; margin: 0; }
        .rm-i p { color: ${mute}; font-size: 14px; margin: 4px 0 0; }
        @media (max-width: 960px) { .rm { grid-template-columns: minmax(0,1fr); } }
      `}</style>

      <Section>
        <div className="rm">
          {columns.map((col) => (
            <Reveal key={col.status} as="div" className={`rm-col${col.highlight ? ' prog' : ''}`}>
              <div className="rm-h"><Dot status={col.status} /><b>{col.label}</b><span className="count">{t('itemsCount', { count: col.items.length })}</span></div>
              {col.items.map((item) => (
                <div className="rm-i" key={item.name}><h3>{item.name}</h3><p>{item.desc}</p></div>
              ))}
            </Reveal>
          ))}
        </div>
      </Section>

      <Section padTop0>
        <Reveal>
          <Band title={t('footerNote')} ctaLabel={t('footerCta')} ctaHref="/contact" />
        </Reveal>
      </Section>
    </PageShell>
  );
}
