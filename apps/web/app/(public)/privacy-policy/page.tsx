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

const sectionIcons = ['◐', '◇', '◯', '◈', '✦'];

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicyPage');
  const sections = t.raw('sections') as { title: string; items: string[] }[];

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .pp-wrap { max-width: 800px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; gap: 16px; }
        .pp-card { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px; }
        .pp-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .pp-icon { width: 36px; height: 36px; border-radius: 8px; background: ${ACCENT_DIM}; color: ${ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .pp-card-title { font-size: 17px; font-weight: 700; color: ${TEXT}; margin: 0; letter-spacing: -0.01em; }
        .pp-list { display: flex; flex-direction: column; gap: 10px; padding: 0; margin: 0; list-style: none; }
        .pp-item { display: flex; gap: 10px; font-size: 16.5px; color: rgba(237,238,246,0.72); line-height: 1.58; }
        .pp-bullet { color: ${ACCENT}; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .pp-notice { background: ${ACCENT_DIM}; border: 1px solid rgba(80,110,255,0.25); border-radius: 12px; padding: 18px 20px; font-size: 15px; color: rgba(237,238,246,0.65); line-height: 1.58; text-align: center; }
        @media (min-width: 640px)  { .pp-wrap { padding: 64px 32px 100px; } .pp-card { padding: 28px 32px; } }
        @media (min-width: 1024px) { .pp-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="pp-wrap">
          <div className="pp-notice">
            {t('notice')}
          </div>
          {sections.map((s, i) => (
            <div key={s.title} className="pp-card">
              <div className="pp-card-head">
                <div className="pp-icon">{sectionIcons[i % sectionIcons.length]}</div>
                <h2 className="pp-card-title">{s.title}</h2>
              </div>
              <ul className="pp-list">
                {s.items.map((item) => (
                  <li key={item} className="pp-item">
                    <span className="pp-bullet">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
