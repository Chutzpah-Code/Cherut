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

type TagKey = 'major' | 'feature' | 'integration' | 'improvement' | 'launch';

const entryMeta: { version: string; tagKey: TagKey }[] = [
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

const tagColors: Record<TagKey, { bg: string; color: string }> = {
  major:       { bg: TEXT,         color: BG },
  feature:     { bg: ACCENT_DIM,   color: ACCENT },
  integration: { bg: 'rgba(80,110,255,0.18)', color: ACCENT },
  improvement: { bg: SURF2,        color: MUTED },
  launch:      { bg: 'rgba(22,163,74,0.15)', color: '#4ade80' },
};

export default function ChangelogPage() {
  const t = useTranslations('changelogPage');
  const entries = t.raw('entries') as { date: string; title: string; items: string[] }[];

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .cl-wrap { max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; }
        .cl-entry { display: grid; grid-template-columns: 1fr; }
        .cl-left { display: none; }
        .cl-right { padding: 0 0 48px; position: relative; }
        .cl-right::before { content: ''; position: absolute; left: -1px; top: 6px; bottom: 0; width: 2px; background: ${RULE}; }
        .cl-dot { width: 10px; height: 10px; border-radius: 50%; background: ${ACCENT}; border: 2px solid ${BG}; position: absolute; left: -5px; top: 6px; box-shadow: 0 0 0 3px ${ACCENT_DIM}; }
        .cl-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; padding-left: 20px; }
        .cl-version { font-size: 12px; font-weight: 700; color: rgba(237,238,246,0.35); letter-spacing: .04em; }
        .cl-date { font-size: 12px; color: ${MUTED}; }
        .cl-tag { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
        .cl-title { font-size: 20px; font-weight: 700; color: ${TEXT}; letter-spacing: -0.015em; margin-bottom: 12px; padding-left: 20px; }
        .cl-items { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .cl-item { display: flex; gap: 10px; font-size: 14px; color: rgba(237,238,246,0.72); line-height: 1.55; }
        .cl-bullet { color: ${ACCENT}; flex-shrink: 0; margin-top: 2px; }
        @media (min-width: 640px) {
          .cl-wrap { padding: 64px 32px 100px; }
          .cl-entry { grid-template-columns: 80px 1fr; gap: 0 20px; }
          .cl-left { display: block; padding-top: 4px; text-align: right; }
          .cl-left-version { font-size: 12px; font-weight: 700; color: rgba(237,238,246,0.28); letter-spacing: .04em; display: block; }
          .cl-left-date { font-size: 12px; color: ${MUTED}; display: block; margin-top: 2px; }
          .cl-right { padding-left: 24px; }
          .cl-meta .cl-version, .cl-meta .cl-date { display: none; }
          .cl-title, .cl-items { padding-left: 0; }
          .cl-right::before { left: 0; }
          .cl-dot { left: -4px; }
        }
        @media (min-width: 1024px) { .cl-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="cl-wrap">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {entries.map((entry, i) => {
              const meta = entryMeta[i];
              const tagStyle = tagColors[meta.tagKey];
              const tagLabel = t(`tags.${meta.tagKey}`);
              return (
                <div key={meta.version} className="cl-entry">
                  <div className="cl-left">
                    <span className="cl-left-version">{meta.version}</span>
                    <span className="cl-left-date">{entry.date}</span>
                  </div>
                  <div className="cl-right">
                    <div className="cl-dot" />
                    <div className="cl-meta">
                      <span className="cl-version">{meta.version}</span>
                      <span className="cl-date">{entry.date}</span>
                      <span className="cl-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>{tagLabel}</span>
                    </div>
                    <div className="cl-title">{entry.title}</div>
                    <div className="cl-items">
                      {entry.items.map((item) => (
                        <div key={item} className="cl-item">
                          <span className="cl-bullet">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
