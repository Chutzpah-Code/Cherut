'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const SURF = '#0F0F1B';
const TEXT = '#EDEEF6';
const MUTED = 'rgba(237,238,246,0.46)';
const RULE = 'rgba(255,255,255,0.08)';

export function PublicFooter() {
  const t = useTranslations('publicFooter');

  const columns = [
    {
      label: t('product'),
      links: [
        [t('features'), '/#features'],
        [t('method'), '/#how'],
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
      <style jsx global>{`
        .pf-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 32px; padding-bottom: 48px; border-bottom: 1px solid ${RULE};
        }
        .pf-brand { grid-column: span 1; }
        .pf-bottom {
          max-width: 1280px; margin: 0 auto; padding-top: 24px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          font-size: 13px; color: rgba(237,238,246,.28);
        }
        @media (max-width: 767px) {
          .pf-inner { grid-template-columns: 1fr 1fr; }
          .pf-brand { grid-column: span 2; }
          .pf-bottom { flex-direction: column; gap: 8px; }
        }
        @media (max-width: 479px) {
          .pf-inner { grid-template-columns: 1fr; }
          .pf-brand { grid-column: span 1; }
        }
      `}</style>
      <footer style={{ background: SURF, color: MUTED, padding: '64px 32px 32px', borderTop: `1px solid ${RULE}` }}>
        <div className="pf-inner">
          <div className="pf-brand" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg viewBox="0 0 64 64" width={24} height={24} fill="none" aria-hidden="true">
                <circle cx="32" cy="32" r="23.8" stroke={TEXT} strokeWidth="8.4" />
                <circle cx="32" cy="32" r="7" fill={TEXT} />
              </svg>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: '-0.025em', color: TEXT }}>Cherut</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED, margin: '8px 0 0', lineHeight: 1.5, maxWidth: 280 }}>{t('tagline')}</p>
          </div>
          {columns.map((col) => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,246,0.28)', marginBottom: 4, fontWeight: 700 }}>{col.label}</div>
              {col.links.map(([text, href]) => (
                <Link
                  key={text}
                  href={href}
                  style={{ color: MUTED, transition: 'color .12s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                >
                  {text}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <p style={{ maxWidth: 1280, margin: '24px auto 0', fontSize: 12, lineHeight: 1.6, color: 'rgba(237,238,246,0.28)' }}>{t('disclaimer')}</p>
        <div className="pf-bottom">
          <span>{t('copyright')}</span>
          <span>{t('tagline2')}</span>
        </div>
        <p style={{ maxWidth: 1280, margin: '16px auto 0', fontSize: 12, color: 'rgba(237,238,246,0.28)' }}>{t('poweredBy')}</p>
      </footer>
    </>
  );
}
