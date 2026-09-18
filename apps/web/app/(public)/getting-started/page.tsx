'use client';

import { PageShell } from '@/components/shell/Shell';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';

const steps = [
  { n: '01', icon: '◈', title: 'Complete your profile',    time: '5 min',  body: 'Upload a photo, set your timezone, choose notification settings and define your working hours for better task planning.' },
  { n: '02', icon: '◇', title: 'Define your core values',  time: '10 min', body: 'Navigate to Values and choose 3–5 principles that guide your decisions. Write a short description for each and rank them. These become your compass.' },
  { n: '03', icon: '◐', title: 'Set up your life areas',   time: '8 min',  body: 'Create 4–6 life domains (Health, Career, Finance, Relationships…). Write a vision statement for each and set priority levels.' },
  { n: '04', icon: '◯', title: 'Create your first OKRs',   time: '15 min', body: 'Start with 1–2 objectives per life area. Write inspiring, qualitative objectives, then add 2–4 measurable key results with specific deadlines.' },
  { n: '05', icon: '◆', title: 'Build success habits',     time: '10 min', body: 'Create 3–5 keystone habits that support multiple objectives. Start small, set specific triggers, and link habits to your life areas and OKRs.' },
  { n: '06', icon: '✦', title: 'Plan your first week',     time: '12 min', body: 'Break key results into specific tasks. Schedule focused work blocks for the most important tasks. Plan habit execution times throughout the week.' },
  { n: '07', icon: '□', title: 'Set up tracking & reviews', time: '8 min', body: 'Configure your dashboard, schedule daily check-ins (5 min) and weekly reviews (30 min). Enable analytics to understand performance patterns.' },
];

const tips = [
  { title: 'Start small, think big', body: "Consistent small wins beat ambitious failures. Build momentum early — the system compounds when you actually use it." },
  { title: 'Weekly reviews are non-negotiable', body: "Schedule 30 minutes every Sunday. Celebrate wins, analyze obstacles, adjust plans. This single habit is what separates drifters from executors." },
  { title: 'Connect everything to values', body: "When goals align with your core values, motivation becomes automatic. Always ask: why does this matter to me?" },
];

export default function GettingStarted() {
  return (
    <PageShell kicker="Getting Started" title="Set up your system in 30 minutes" lead="A step-by-step guide to get ALL IN ALL THE TIME from day one.">
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
            <span style={{ fontSize: 11, color: ACCENT, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 13px', borderRadius: 999, border: `1px solid rgba(80,110,255,0.4)`, background: ACCENT_DIM, display: 'inline-block', marginBottom: 16 }}>Onboarding checklist</span>
            <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 0.96, color: TEXT, margin: 0 }}>Seven steps. Thirty minutes. One system.</h2>
          </div>

          <div className="gs-steps">
            {steps.map((s) => (
              <div key={s.n} className="gs-step">
                <div className="gs-left">
                  <div className="gs-num">{s.n}</div>
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
            {tips.map((t) => (
              <div key={t.title} className="gs-tip">
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{t.title}</div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>{t.body}</p>
              </div>
            ))}
          </div>

          <div className="gs-cta">
            <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 32, fontWeight: 800, color: TEXT, margin: '0 0 12px', lineHeight: 0.96 }}>Ready to begin?</h3>
            <p style={{ fontSize: 16, color: MUTED, margin: '0 0 24px', lineHeight: 1.5 }}>The system is only as powerful as your commitment to using it.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/register" style={{ background: TEXT, color: BG, fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 999, display: 'inline-block' }}>Start building →</a>
              <a href="/help-center"   style={{ background: 'transparent', color: TEXT, fontSize: 14, fontWeight: 500, padding: '12px 24px', borderRadius: 999, border: `1px solid ${RULE}`, display: 'inline-block' }}>Help center</a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
