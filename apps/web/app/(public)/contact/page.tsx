'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageShell, SHELL_TOKENS } from '@/components/shell/Shell';
import { Section, Reveal, FormField } from '@/components/shell/primitives';

const { mute, rule, acc, ink } = SHELL_TOKENS;

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const subjects = t.raw('subjects') as string[];
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <style>{`
        .ct { display: grid; grid-template-columns: minmax(0,1.5fr) minmax(0,1fr); gap: 48px; align-items: start; }
        .side { display: flex; flex-direction: column; border-top: 1px solid ${rule}; }
        .side > div { padding: 28px 0; border-bottom: 1px solid ${rule}; display: flex; flex-direction: column; gap: 8px; }
        .side h3 { font-size: 13px; font-weight: 500; color: ${mute}; margin: 0; }
        .side .big { font-size: 22px; font-weight: 600; letter-spacing: -.02em; word-break: break-word; }
        .side p { color: ${mute}; font-size: 15px; margin: 0; }
        .side .dark { background: ${ink}; color: #fff; border-radius: 18px; padding: 28px; border: 0; margin-top: 28px; }
        .side .dark p { color: rgba(255,255,255,.62); }
        @media (max-width: 960px) { .ct { grid-template-columns: minmax(0,1fr); } }
      `}</style>

      <Section>
        <div className="ct">
          <Reveal>
            {submitted ? (
              <div className="form" style={{ textAlign: 'center', padding: '48px 36px' }}>
                <h2 className="h2" style={{ marginBottom: 10 }}>{t('successTitle')}</h2>
                <p className="lede" style={{ margin: '0 auto' }}>{t('successBody')}</p>
              </div>
            ) : (
              <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <h2 className="h2">{t('formTitle')}</h2>
                <FormField label={t('nameLabel')} id="ct-name" required />
                <FormField label={t('emailLabel')} id="ct-email" type="email" required />
                <FormField label={t('subjectLabel')} id="ct-subject" full>
                  <select id="ct-subject" required defaultValue="">
                    <option value="" disabled>{t('subjectPlaceholder')}</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label={t('messageLabel')} id="ct-message" full>
                  <textarea id="ct-message" required />
                </FormField>
                <button className="btn btn-dark" type="submit">{t('submit')} →</button>
              </form>
            )}
          </Reveal>

          <Reveal>
            <aside className="side">
              <div>
                <h3>{t('sidebar.emailTitle')}</h3>
                <a className="big" href="mailto:contact@hanielrolemberg.com" style={{ color: acc }}>contact@hanielrolemberg.com</a>
                <p>{t('sidebar.emailDesc')}</p>
              </div>
              <div>
                <h3>{t('sidebar.responseTitle')}</h3>
                <span className="big">{t('sidebar.responseValue')}</span>
                <p>{t('sidebar.responseDesc')}</p>
              </div>
              <div className="dark">
                <h3 style={{ color: 'rgba(255,255,255,.5)' }}>{t('sidebar.communityTitle')}</h3>
                <p>{t('sidebar.communityDesc')}</p>
                <a href="https://t.me/+MxfNsOTcN-Y5MmYx" target="_blank" rel="noopener noreferrer" className="btn btn-light" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  {t('sidebar.communityCta')} →
                </a>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>
    </PageShell>
  );
}
