'use client';

import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/shell/Shell';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';

type Status = 'shipped' | 'in-progress' | 'planned';

function StatusBadge({ status, label }: { status: Status; label: string }) {
  const map: Record<Status, { symbol: string; bg: string; color: string }> = {
    shipped:       { symbol: '✓', bg: 'rgba(22,163,74,0.15)', color: '#4ade80' },
    'in-progress': { symbol: '●', bg: ACCENT_DIM,             color: ACCENT },
    planned:       { symbol: '○', bg: SURF2,                  color: MUTED },
  };
  const s = map[status];
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.color }}>{s.symbol} {label}</span>;
}

function ItemCard({ name, desc, status, label }: { name: string; desc: string; status: Status; label: string }) {
  return (
    <div style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, letterSpacing: '-0.01em' }}>{name}</span>
        <StatusBadge status={status} label={label} />
      </div>
      <p style={{ fontSize: 15.5, color: MUTED, lineHeight: 1.58, margin: 0 }}>{desc}</p>
    </div>
  );
}

export default function RoadmapPage() {
  const t = useTranslations('roadmapPage');
  const shipped = t.raw('shipped') as { name: string; desc: string }[];
  const inProgress = t.raw('inProgress') as { name: string; desc: string }[];
  const planned = t.raw('planned') as { name: string; desc: string }[];

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .rm-wrap { max-width: 1180px; margin: 0 auto; padding: 48px 20px 80px; }
        .rm-cols { display: grid; grid-template-columns: 1fr; gap: 32px; }
        .rm-col-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rm-col-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
        .rm-items { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 768px) { .rm-wrap { padding: 64px 32px 100px; } .rm-cols { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1024px) { .rm-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG, minHeight: '60vh' }}>
        <div className="rm-wrap">
          <div className="rm-cols">
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 16, color: '#4ade80' }}>✓</span>
                <span className="rm-col-title" style={{ color: '#4ade80' }}>{t('statusShipped')}</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{t('itemsCount', { count: shipped.length })}</span>
              </div>
              <div className="rm-items">{shipped.map(i => <ItemCard key={i.name} {...i} status="shipped" label={t('statusShipped')} />)}</div>
            </div>
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 16, color: ACCENT }}>●</span>
                <span className="rm-col-title" style={{ color: ACCENT }}>{t('statusInProgress')}</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{t('itemsCount', { count: inProgress.length })}</span>
              </div>
              <div className="rm-items">{inProgress.map(i => <ItemCard key={i.name} {...i} status="in-progress" label={t('statusInProgress')} />)}</div>
            </div>
            <div>
              <div className="rm-col-head">
                <span style={{ fontSize: 16, color: MUTED }}>○</span>
                <span className="rm-col-title" style={{ color: MUTED }}>{t('statusPlanned')}</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{t('itemsCount', { count: planned.length })}</span>
              </div>
              <div className="rm-items">{planned.map(i => <ItemCard key={i.name} {...i} status="planned" label={t('statusPlanned')} />)}</div>
            </div>
          </div>

          <div style={{ marginTop: 64, padding: '28px 24px', background: SURF2, border: `1px solid ${RULE}`, borderRadius: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 16.5, color: MUTED, margin: '0 0 16px' }}>{t('footerNote')}</p>
            <a href="/contact" style={{ display: 'inline-block', fontSize: 14, fontWeight: 700, color: BG, padding: '10px 20px', borderRadius: 999, background: TEXT }}>
              {t('footerCta')} →
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
