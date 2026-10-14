'use client';

import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicDisclaimer } from '@/components/ui/PublicDisclaimer';
import { geistSans, geistMono } from '@/lib/fonts';
import { SiteStyles } from './primitives';
import { SHELL_TOKENS } from './tokens';

// Re-exported so existing `import { PageShell, SHELL_TOKENS } from
// '@/components/shell/Shell'` call sites keep working — the tokens
// themselves live in ./tokens.ts to avoid a circular import (see that
// file's comment).
export { SHELL_TOKENS };

const { ink, mute, paper, rule, acc, max } = SHELL_TOKENS;

interface PageShellProps {
  children: React.ReactNode;
  crumb?: string;
  title?: string;
  lead?: string;
}

export function PageShell({ children, crumb, title, lead }: PageShellProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: paper, color: ink, fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { background: ${paper} !important; color-scheme: light !important; scroll-behavior: smooth; }
        body { margin: 0; overflow-x: hidden; background: ${paper} !important; color: ${ink} !important; }
        a { text-decoration: none; color: inherit; }
        a:hover { color: ${acc}; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }

        .ps-crumb { font-size: 14px; color: ${mute}; }
        .ps-hero {
          position: relative; padding: 112px 0 72px; overflow: hidden;
          border-bottom: 1px solid ${rule}; background: ${paper};
        }
        .ps-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(${rule} 1px, transparent 1px), linear-gradient(90deg, ${rule} 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 70% 80% at 30% 0%, #000 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 80% at 30% 0%, #000 30%, transparent 75%);
          pointer-events: none;
        }
        .ps-hero-inner { position: relative; max-width: ${max}px; margin: 0 auto; padding: 0 32px; display: flex; flex-direction: column; gap: 24px; }
        .ps-hero-title {
          font-size: clamp(44px, 6.4vw, 84px); line-height: .98; letter-spacing: -.045em;
          font-weight: 600; text-wrap: balance; max-width: 900px; margin: 0; color: ${ink};
        }
        .ps-hero-lead { font-size: 18px; color: ${mute}; line-height: 1.55; max-width: 560px; margin: 0; }

        @media (max-width: 960px) { .ps-hero { padding: 80px 0 56px; } }
        @media (max-width: 640px) { .ps-hero-inner { padding: 0 20px; } }
      `}</style>
      <SiteStyles />

      <PublicHeader variant="page" />

      {title && (
        <section className="ps-hero">
          <div className="ps-hero-grid" />
          <div className="ps-hero-inner">
            {crumb && <span className="ps-crumb">{crumb}</span>}
            <h1 className="ps-hero-title">{title}</h1>
            {lead && <p className="ps-hero-lead">{lead}</p>}
          </div>
        </section>
      )}

      <main>{children}</main>

      <PublicDisclaimer />
      <PublicFooter />
    </div>
  );
}
