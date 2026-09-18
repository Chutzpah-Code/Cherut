'use client';

import { useState } from 'react';
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

const whyJoinIcons = ['◐', '◇', '◯'];

export default function CareersPage() {
  const t = useTranslations('careersPage');
  const whyJoin = t.raw('whyJoin') as { title: string; body: string }[];
  const values = t.raw('values') as string[];
  const skillAreas = t.raw('form.skillAreas') as string[];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skill, setSkill] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .ca-wrap { max-width: 1180px; margin: 0 auto; padding: 48px 20px 80px; }
        .ca-section { margin-bottom: 64px; }
        .ca-section-title { font-family: "Barlow Condensed", sans-serif; text-transform: uppercase; font-size: 28px; font-weight: 700; letter-spacing: 0.01em; color: ${TEXT}; margin: 0 0 24px; }
        .ca-why-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .ca-card { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px; display: flex; gap: 16px; }
        .ca-icon { width: 40px; height: 40px; border-radius: 10px; background: ${ACCENT_DIM}; color: ${ACCENT}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .ca-values-list { display: flex; flex-direction: column; gap: 12px; }
        .ca-value { display: flex; align-items: flex-start; gap: 12px; font-size: 16px; color: rgba(237,238,246,0.82); }
        .ca-form { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 20px; }
        .ca-field { display: flex; flex-direction: column; gap: 6px; }
        .ca-label { font-size: 13px; font-weight: 600; color: rgba(237,238,246,0.6); }
        .ca-input { width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit; background: ${SURF}; border: 1px solid ${RULE}; border-radius: 8px; color: ${TEXT}; outline: none; transition: border-color .15s; }
        .ca-input:focus { border-color: ${ACCENT}; }
        .ca-input::placeholder { color: rgba(237,238,246,0.28); }
        .ca-textarea { min-height: 120px; resize: vertical; }
        .ca-select { appearance: none; cursor: pointer; }
        .ca-select option { background: ${SURF2}; }
        .ca-submit { padding: 14px 24px; background: ${TEXT}; color: ${BG}; font-size: 15px; font-weight: 700; font-family: inherit; border: none; border-radius: 999px; cursor: pointer; transition: opacity .15s; }
        .ca-submit:hover { opacity: .87; }
        .ca-success { text-align: center; padding: 40px 24px; }
        @media (min-width: 640px) { .ca-wrap { padding: 64px 32px 100px; } .ca-why-grid { grid-template-columns: repeat(3, 1fr); } .ca-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } }
        @media (min-width: 1024px) { .ca-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="ca-wrap">
          <div className="ca-section">
            <h2 className="ca-section-title">{t('whyJoinHeading')}</h2>
            <div className="ca-why-grid">
              {whyJoin.map((w, i) => (
                <div key={w.title} className="ca-card">
                  <div className="ca-icon">{whyJoinIcons[i % whyJoinIcons.length]}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{w.title}</div>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, margin: 0 }}>{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ca-section">
            <h2 className="ca-section-title">{t('valuesHeading')}</h2>
            <div className="ca-values-list">
              {values.map((v) => (
                <div key={v} className="ca-value">
                  <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ca-section">
            <h2 className="ca-section-title">{t('poolHeading')}</h2>
            <p style={{ fontSize: 15, color: MUTED, margin: '0 0 24px', lineHeight: 1.55 }}>
              {t('poolSub')}
            </p>
            {submitted ? (
              <div className="ca-form ca-success">
                <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{t('successTitle')}</div>
                <p style={{ fontSize: 15, color: MUTED, margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>{t('successBody')}</p>
              </div>
            ) : (
              <form className="ca-form" onSubmit={handleSubmit}>
                <div className="ca-form-row">
                  <div className="ca-field">
                    <label className="ca-label" htmlFor="ca-name">{t('form.nameLabel')}</label>
                    <input id="ca-name" className="ca-input" type="text" placeholder={t('form.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="ca-field">
                    <label className="ca-label" htmlFor="ca-email">{t('form.emailLabel')}</label>
                    <input id="ca-email" className="ca-input" type="email" placeholder={t('form.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="ca-field">
                  <label className="ca-label" htmlFor="ca-skill">{t('form.skillLabel')}</label>
                  <select id="ca-skill" className="ca-input ca-select" value={skill} onChange={e => setSkill(e.target.value)} required>
                    <option value="">{t('form.skillPlaceholder')}</option>
                    {skillAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ca-field">
                  <label className="ca-label" htmlFor="ca-message">{t('form.messageLabel')}</label>
                  <textarea id="ca-message" className="ca-input ca-textarea" placeholder={t('form.messagePlaceholder')} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>
                <div><button type="submit" className="ca-submit">{t('form.submit')} →</button></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
