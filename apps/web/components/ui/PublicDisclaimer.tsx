'use client';

import { useTranslations } from 'next-intl';
import { SHELL_TOKENS } from '@/components/shell/Shell';

const { mute, rule } = SHELL_TOKENS;

// Rendered immediately before <PublicFooter /> on every public page — both
// call sites (Shell.tsx's PageShell and the landing page's own layout) sit
// right above the footer, so this is the one place to edit to keep it on
// every public route without duplicating the string per page.
export function PublicDisclaimer() {
  const t = useTranslations('publicFooter');

  return (
    <div style={{ padding: '40px 0', borderTop: `1px solid ${rule}`, textAlign: 'center' }}>
      <p style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', fontSize: 13, lineHeight: 1.6, color: mute }}>
        {t('disclaimer')}
      </p>
    </div>
  );
}
