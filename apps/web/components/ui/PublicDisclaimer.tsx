'use client';

import { useTranslations } from 'next-intl';

const SURF = '#0F0F1B';
const MUTED = 'rgba(237,238,246,0.4)';
const RULE = 'rgba(255,255,255,0.08)';

// Rendered immediately before <PublicFooter /> on every public page — both
// call sites (Shell.tsx's PageShell and the landing page's own layout) sit
// right above the footer, so this is the one place to edit to keep it on
// every public route without duplicating the string per page.
export function PublicDisclaimer() {
  const t = useTranslations('publicFooter');

  return (
    <div style={{ background: SURF, borderTop: `1px solid ${RULE}`, padding: '18px 32px' }}>
      <p style={{ maxWidth: 1280, margin: '0 auto', fontSize: 12.5, lineHeight: 1.6, color: MUTED, textAlign: 'center' }}>
        {t('disclaimer')}
      </p>
    </div>
  );
}
