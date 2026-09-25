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
const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';

const principleIcons = ['◐', '◇', '◯', '◈'];

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const manifesto = t.raw('manifesto') as string[];
  const principles = t.raw('principles') as { title: string; body: string }[];

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .ab-section { max-width: 1180px; margin: 0 auto; padding: 64px 20px; }
        .ab-manifesto { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; }
        .ab-manifesto-item { display: flex; gap: 20px; align-items: baseline; padding: 24px 0; border-bottom: 1px solid ${RULE}; }
        .ab-manifesto-item:first-child { padding-top: 0; }
        .ab-manifesto-item:last-child { border-bottom: none; }
        .ab-manifesto-n { font-family: ${DISPLAY}; font-size: 14px; font-weight: 700; color: ${ACCENT}; letter-spacing: 0.06em; flex-shrink: 0; width: 26px; }
        .ab-manifesto-item p { flex: 1; font-size: clamp(17px, 2.4vw, 21px); line-height: 1.5; color: ${TEXT}; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
        .ab-principles { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 48px; }
        .ab-card { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 14px; transition: transform .2s, border-color .2s; }
        .ab-card:hover { transform: translateY(-2px); border-color: ${ACCENT}; }
        .ab-icon { width: 44px; height: 44px; border-radius: 10px; background: ${ACCENT_DIM}; color: ${ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .ab-card-title { font-size: 18px; font-weight: 700; color: ${TEXT}; letter-spacing: -0.015em; margin: 0; }
        .ab-card-body { font-size: 15px; line-height: 1.6; color: ${MUTED}; margin: 0; }
        @media (min-width: 640px)  { .ab-section { padding: 80px 32px; } .ab-principles { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .ab-section { padding: 100px 32px; } .ab-principles { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 479px) { .ab-manifesto-item { gap: 14px; padding: 18px 0; } }
      `}</style>

      <section style={{ background: SURF, borderBottom: `1px solid ${RULE}` }}>
        <div className="ab-section">
          <div className="ab-manifesto">
            {manifesto.map((line, i) => (
              <div key={i} className="ab-manifesto-item">
                <span className="ab-manifesto-n">{String(i + 1).padStart(2, '0')}</span>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: BG }}>
        <div className="ab-section">
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <span style={{ fontSize: 11, color: ACCENT, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 13px', borderRadius: 999, border: `1px solid rgba(80,110,255,0.4)`, background: ACCENT_DIM, display: 'inline-block', marginBottom: 16 }}>{t('principlesKicker')}</span>
            <h2 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800, lineHeight: 0.96, color: TEXT, margin: 0 }}>{t('principlesHeading')}</h2>
          </div>
          <div className="ab-principles">
            {principles.map((p, i) => (
              <div key={p.title} className="ab-card">
                <div className="ab-icon">{principleIcons[i % principleIcons.length]}</div>
                <h3 className="ab-card-title">{p.title}</h3>
                <p className="ab-card-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: SURF, borderTop: `1px solid ${RULE}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, lineHeight: 0.96, color: TEXT, margin: '0 0 16px' }}>{t('tryHeading')}</h2>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.55, margin: '0 0 32px' }}>{t('trySub')}</p>
          <a href="/auth/register" style={{ display: 'inline-block', background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, letterSpacing: '-0.01em' }}>
            {t('tryCta')} →
          </a>
        </div>
      </section>
    </PageShell>
  );
}
