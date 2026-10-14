'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/shell/Shell';
import { Section, Reveal, Cards, Card, ChecksList, FormField } from '@/components/shell/primitives';

export default function CareersPage() {
  const t = useTranslations('careersPage');
  const whyJoin = t.raw('whyJoin') as { title: string; body: string }[];
  const values = t.raw('values') as string[];
  const skillAreas = t.raw('form.skillAreas') as string[];

  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell crumb={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')}>
      <Section>
        <Reveal><h2 className="h2" style={{ marginBottom: 40 }}>{t('whyJoinHeading')}</h2></Reveal>
        <Reveal>
          <Cards cols={3}>
            {whyJoin.map((w, i) => <Card key={w.title} k={String(i + 1).padStart(2, '0')} title={w.title}>{w.body}</Card>)}
          </Cards>
        </Reveal>
      </Section>

      <Section padTop0>
        <div className="split">
          <Reveal className="sticky">
            <h2 className="h2">{t('valuesHeading')}</h2>
            <ChecksList items={values} />
          </Reveal>
          <Reveal>
            {submitted ? (
              <div className="form" style={{ textAlign: 'center', padding: '48px 36px' }}>
                <h2 className="h2" style={{ marginBottom: 10 }}>{t('successTitle')}</h2>
                <p className="lede" style={{ margin: '0 auto' }}>{t('successBody')}</p>
              </div>
            ) : (
              <form className="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <h2 className="h2">{t('poolHeading')}</h2>
                <p className="lede">{t('poolSub')}</p>
                <FormField label={t('form.nameLabel')} id="ca-name" required />
                <FormField label={t('form.emailLabel')} id="ca-email" type="email" required />
                <FormField label={t('form.skillLabel')} id="ca-skill" full>
                  <select id="ca-skill" required defaultValue="">
                    <option value="" disabled>{t('form.skillPlaceholder')}</option>
                    {skillAreas.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label={t('form.messageLabel')} id="ca-message" full>
                  <textarea id="ca-message" required />
                </FormField>
                <button className="btn btn-dark" type="submit">{t('form.submit')} →</button>
              </form>
            )}
          </Reveal>
        </div>
      </Section>
    </PageShell>
  );
}
