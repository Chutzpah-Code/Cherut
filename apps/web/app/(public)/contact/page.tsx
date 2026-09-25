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

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const subjects = t.raw('subjects') as string[];

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <PageShell kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .ct-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 20px 80px; }
        .ct-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        .ct-form-box { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 20px; }
        .ct-field { display: flex; flex-direction: column; gap: 6px; }
        .ct-label { font-size: 13px; font-weight: 600; color: rgba(237,238,246,0.55); }
        .ct-input { width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit; background: ${SURF}; border: 1px solid ${RULE}; border-radius: 8px; color: ${TEXT}; outline: none; transition: border-color .15s; }
        .ct-input:focus { border-color: ${ACCENT}; }
        .ct-input::placeholder { color: rgba(237,238,246,0.22); }
        .ct-textarea { min-height: 130px; resize: vertical; }
        .ct-select { appearance: none; cursor: pointer; }
        .ct-select option { background: ${SURF2}; }
        .ct-submit { padding: 14px 24px; background: ${TEXT}; color: ${BG}; font-size: 15px; font-weight: 700; font-family: inherit; border: none; border-radius: 999px; cursor: pointer; transition: opacity .15s; width: 100%; }
        .ct-submit:hover { opacity: .87; }
        .ct-success { text-align: center; padding: 40px 24px; }
        .ct-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .ct-info-card { background: ${SURF2}; border: 1px solid ${RULE}; border-radius: 14px; padding: 24px; }
        .ct-info-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: rgba(237,238,246,0.35); margin-bottom: 10px; }
        .ct-form-row { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px)  { .ct-wrap { padding: 64px 32px 100px; } .ct-form-row { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px)  { .ct-grid { grid-template-columns: 1fr 380px; gap: 40px; } }
        @media (min-width: 1024px) { .ct-wrap { padding: 80px 32px 120px; } }
      `}</style>

      <div style={{ background: BG }}>
        <div className="ct-wrap">
          <div className="ct-grid">
            <div>
              {submitted ? (
                <div className="ct-form-box ct-success">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{t('successTitle')}</div>
                  <p style={{ fontSize: 16.5, color: MUTED, margin: 0, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>{t('successBody')}</p>
                </div>
              ) : (
                <form className="ct-form-box" onSubmit={handleSubmit}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.015em' }}>{t('formTitle')}</h2>
                  <div className="ct-form-row">
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="ct-name">{t('nameLabel')}</label>
                      <input id="ct-name" className="ct-input" type="text" placeholder={t('namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="ct-email">{t('emailLabel')}</label>
                      <input id="ct-email" className="ct-input" type="email" placeholder={t('emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="ct-subject">{t('subjectLabel')}</label>
                    <select id="ct-subject" className="ct-input ct-select" value={subject} onChange={e => setSubject(e.target.value)} required>
                      <option value="">{t('subjectPlaceholder')}</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="ct-message">{t('messageLabel')}</label>
                    <textarea id="ct-message" className="ct-input ct-textarea" placeholder={t('messagePlaceholder')} value={message} onChange={e => setMessage(e.target.value)} required />
                  </div>
                  <button type="submit" className="ct-submit">{t('submit')} →</button>
                </form>
              )}
            </div>

            <div className="ct-sidebar">
              <div className="ct-info-card">
                <div className="ct-info-title">{t('sidebar.emailTitle')}</div>
                <a href="mailto:contact@hanielrolemberg.com" style={{ fontSize: 17, fontWeight: 600, color: ACCENT, display: 'block', marginBottom: 6 }}>contact@hanielrolemberg.com</a>
                <p style={{ fontSize: 15.5, color: MUTED, margin: 0, lineHeight: 1.55 }}>{t('sidebar.emailDesc')}</p>
              </div>
              <div className="ct-info-card">
                <div className="ct-info-title">{t('sidebar.responseTitle')}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: TEXT, marginBottom: 6 }}>{t('sidebar.responseValue')}</div>
                <p style={{ fontSize: 15.5, color: MUTED, margin: 0, lineHeight: 1.55 }}>{t('sidebar.responseDesc')}</p>
              </div>
              <div className="ct-info-card">
                <div className="ct-info-title">{t('sidebar.communityTitle')}</div>
                <p style={{ fontSize: 15.5, color: MUTED, margin: '0 0 12px', lineHeight: 1.55 }}>{t('sidebar.communityDesc')}</p>
                <a href="https://t.me/+MxfNsOTcN-Y5MmYx" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: ACCENT, padding: '10px 16px', background: ACCENT_DIM, borderRadius: 999, display: 'inline-block', border: `1px solid rgba(80,110,255,0.3)` }}>
                  {t('sidebar.communityCta')} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
