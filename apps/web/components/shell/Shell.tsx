'use client';

import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicDisclaimer } from '@/components/ui/PublicDisclaimer';
import { geistSans, geistMono } from '@/lib/fonts';
import { SiteStyles } from './primitives';

// Design tokens extracted from docs/rebranding/site.css — the public site's
// light "Geist" rebrand. Shared by every component under components/shell
// and components/ui/{Header,PublicFooter,PublicDisclaimer}.tsx.
export const SHELL_TOKENS = {
  ink: '#0B0B10',
  ink2: '#3A3A44',
  mute: '#6B6B76',
  paper: '#FFFFFF',
  off: '#F6F6F4',
  rule: 'rgba(11,11,16,.09)',
  ruleD: 'rgba(255,255,255,.12)',
  acc: '#3B5BF6',
  accSoft: '#E8EDFF',
  accLight: '#8FA6FF',
  ease: 'cubic-bezier(.23,1,.32,1)',
  max: 1200,
} as const;

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
