'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import CherutLogo from '@/components/ui/CherutLogo';
import { SHELL_TOKENS } from '@/components/shell/tokens';

const { ink, ruleD } = SHELL_TOKENS;

export function PublicFooter() {
  const t = useTranslations('publicFooter');

  const columns = [
    {
      label: t('product'),
      links: [
        [t('features'), '/#features'],
        [t('method'), '/#method'],
        [t('pricing'), '/#pricing'],
        [t('changelog'), '/changelog'],
        [t('roadmap'), '/roadmap'],
      ],
    },
    {
      label: t('company'),
      links: [
        [t('about'), '/about'],
        [t('careers'), '/careers'],
        [t('contact'), '/contact'],
      ],
    },
    {
      label: t('resources'),
      links: [
        [t('helpCenter'), '/help-center'],
        [t('privacy'), '/privacy-policy'],
      ],
    },
  ];

  return (
    <>
      <style>{`
        .ft-footer { padding: 72px 0 36px; background: ${ink}; color: rgba(255,255,255,.62); border-top: 1px solid ${ruleD}; }
        .ft { max-width: 1200px; margin: 0 auto; padding: 0 32px 48px; display: grid; grid-template-columns: minmax(0,2fr) repeat(3,minmax(0,1fr)); gap: 40px; border-bottom: 1px solid ${ruleD}; }
        .ft p { margin-top: 14px; font-size: 14px; max-width: 320px; }
        .ft h4 { margin: 0 0 14px; font-family: var(--font-geist-mono), monospace; font-weight: 400; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.4); }
        .ft nav { display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
        .ft a:hover { color: #fff; }
        .fb { max-width: 1200px; margin: 0 auto; padding: 24px 32px 0; display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; font-size: 13px; color: rgba(255,255,255,.4); }
        @media (max-width: 960px) { .ft { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .ft, .fb { padding-left: 20px; padding-right: 20px; } }
      `}</style>
      <footer className="ft-footer">
        <div className="ft">
          <div>
            <Link href="/" aria-label="Cherut" style={{ display: 'inline-flex' }}>
              <CherutLogo viewBox="200 279 338 132" width={88} height={34} fillColor="#fff" />
            </Link>
            <p>{t('tagline')}</p>
          </div>
          {columns.map((col) => (
            <div key={col.label}>
              <h4>{col.label}</h4>
              <nav>
                {col.links.map(([text, href]) => <Link key={text} href={href}>{text}</Link>)}
              </nav>
            </div>
          ))}
        </div>
        <div className="fb">
          <span>{t('copyright')} {t('tagline2')}</span>
          <span>{t('poweredBy')}</span>
        </div>
      </footer>
    </>
  );
}

export default PublicFooter;
