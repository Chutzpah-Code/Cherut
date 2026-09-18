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

const stepMeta = [
  { n: '01', icon: '◈' },
  { n: '02', icon: '◇' },
  { n: '03', icon: '◐' },
  { n: '04', icon: '◯' },
  { n: '05', icon: '◆' },
  { n: '06', icon: '✦' },
  { n: '07', icon: '□' },
];

export default function GettingStarted() {
  const t = useTranslations('gettingStartedPage');
  const steps = t.raw('steps') as { time: string; title: string; body: string }[];
  const tips = t.raw('tips') as { title: string; body: string }[];

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .gs-wrap  { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
        .gs-steps { display: flex; flex-direction: column; gap: 0; }
        .gs-step  { display: grid; grid-template-columns: 48px 1fr; gap: 0 20px; position: relative; padding-bottom: 40px; }
        .gs-step:last-child { padding-bottom: 0; }
        .gs-left  { display: flex; flex-direction: column; align-items: center; }
        .gs-num   { width: 40px; height: 40px; border-radius: 50%; background: ${ACCENT_DIM}; border: 1px solid rgba(80,110,255,0.4); color: ${ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; letter-spacing: .04em; flex-shrink: 0; }
        .gs-line  { flex: 1; width: 1px; background: ${RULE}; margin: 8px auto 0; }
        .gs-step:last-child .gs-line { display: none; }
        .gs-right { padding-top: 6px; }
        .gs-title { font-family: "Barlow Condensed", sans-serif; text-transform: uppercase; font-size: 22px; font-weight: 700; color: ${TEXT}; margin: 0 0 8px; letter-spacing: 0.01em; }
        .gs-time  { font-size: 11px; color: ${ACCENT}; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .gs-body  { font-size: 15px; color: ${MUTED}; line-height: 1.65; margin: 0; }
        .gs-tips  { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 64px; }
        .gs-tip   { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px; }
        .gs-cta   { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 32px; text-align: center; margin-top: 48px; }
        @media (min-width: 640px)  { .gs-wrap { padding: 64px 32px 100px; } .gs-tips { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .gs-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="gs-wrap">
          <div style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 11, color: ACCENT, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 13px', borderRadius: 999, border: `1px solid rgba(80,110,255,0.4)`, background: ACCENT_DIM, display: 'inline-block', marginBottom: 16 }}>{t('checklistKicker')}</span>
            <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 0.96, color: TEXT, margin: 0 }}>{t('checklistHeading')}</h2>
          </div>

          <div className="gs-steps">
            {steps.map((s, i) => (
              <div key={stepMeta[i].n} className="gs-step">
                <div className="gs-left">
                  <div className="gs-num">{stepMeta[i].n}</div>
                  <div className="gs-line" />
                </div>
                <div className="gs-right">
                  <span className="gs-time">⏱ {s.time}</span>
                  <h3 className="gs-title">{s.title}</h3>
                  <p className="gs-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="gs-tips">
            {tips.map((tip) => (
              <div key={tip.title} className="gs-tip">
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{tip.title}</div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>{tip.body}</p>
              </div>
            ))}
          </div>

          <div className="gs-cta">
            <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 32, fontWeight: 800, color: TEXT, margin: '0 0 12px', lineHeight: 0.96 }}>{t('ctaHeading')}</h3>
            <p style={{ fontSize: 16, color: MUTED, margin: '0 0 24px', lineHeight: 1.5 }}>{t('ctaSub')}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/register" style={{ background: TEXT, color: BG, fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 999, display: 'inline-block' }}>{t('ctaStart')} →</a>
              <a href="/help-center"   style={{ background: 'transparent', color: TEXT, fontSize: 14, fontWeight: 500, padding: '12px 24px', borderRadius: 999, border: `1px solid ${RULE}`, display: 'inline-block' }}>{t('ctaHelp')}</a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
