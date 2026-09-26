'use client';

import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicDisclaimer } from '@/components/ui/PublicDisclaimer';

export const SHELL_TOKENS = {
  BLUE:      'oklch(0.5 0.18 260)',
  BLUE_SOFT: 'oklch(0.94 0.04 260)',
  INK:       '#0F0F1E',
  PAPER:     '#FAFAF7',
  PAPER_2:   '#F5F5F2',
  MUTED:     'rgba(15,15,30,0.6)',
  RULE:      'rgba(15,15,30,0.1)',
  GRID:      'rgba(15,15,30,0.07)',
} as const;

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE, GRID } = SHELL_TOKENS;

export function CMark({ size = 32, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M 50 6 A 44 44 0 1 0 50 94 L 50 72 A 22 22 0 1 1 50 28 Z" fill={color} />
    </svg>
  );
}

interface PageShellProps {
  children: React.ReactNode;
  kicker?: string;
  title?: string;
  lead?: string;
}

// Dark theme tokens for public pages (separate from app dashboard tokens)
const PS = {
  BG:         '#07070D',
  SURF:       '#0F0F1B',
  SURF2:      '#161628',
  TEXT:       '#EDEEF6',
  MUTED_D:    'rgba(237,238,246,0.46)',
  ACCENT:     'oklch(0.68 0.24 260)',
  ACCENT_DIM: 'rgba(80,110,255,0.1)',
  RULE_D:     'rgba(255,255,255,0.08)',
  DISPLAY:    '"Barlow Condensed", "Arial Narrow", sans-serif',
  BODY:       '"DM Sans", -apple-system, system-ui, sans-serif',
} as const;

export function PageShell({ children, kicker, title, lead }: PageShellProps) {
  return (
    <div style={{ background: PS.BG, color: PS.TEXT, fontFamily: PS.BODY, fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { background: ${PS.BG} !important; color-scheme: dark !important; }
        body { margin: 0; overflow-x: hidden; background: ${PS.BG} !important; color: ${PS.TEXT} !important; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }

        .ps-kicker {
          display: inline-block; font-size: 11px; color: ${PS.ACCENT};
          letter-spacing: .14em; text-transform: uppercase; font-weight: 700;
          margin-bottom: 20px; padding: 5px 13px; border-radius: 999px;
          border: 1px solid rgba(80,110,255,0.4); background: ${PS.ACCENT_DIM};
        }
        .sh-hero {
          padding: 80px 32px 64px; background: ${PS.BG};
          border-bottom: 1px solid ${PS.RULE_D}; text-align: center;
          position: relative; overflow: hidden;
        }
        .sh-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse at 50% 40%, #000 35%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 35%, transparent 75%);
          pointer-events: none;
        }
        .sh-hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
        .sh-hero-title {
          font-family: ${PS.DISPLAY}; text-transform: uppercase;
          font-size: clamp(40px, 6vw, 72px); line-height: 0.96;
          letter-spacing: 0.01em; font-weight: 800;
          margin: 0 0 20px; color: ${PS.TEXT};
        }
        .sh-hero-lead { font-size: 18px; line-height: 1.55; color: ${PS.MUTED_D}; margin: 0; }

        .ps-surf  { background: ${PS.SURF}; }
        .ps-surf2 { background: ${PS.SURF2}; }

        @media (max-width: 1023px) {
          .sh-hero       { padding: 64px 24px 48px; }
        }
        @media (max-width: 767px) {
          .sh-hero       { padding: 56px 20px 40px; }
          .sh-hero-title { font-size: clamp(32px, 8vw, 52px); }
          .sh-hero-lead  { font-size: 16px; }
        }
        @media (max-width: 479px) {
          .sh-hero       { padding: 48px 16px 32px; }
        }
      `}</style>

      <PublicHeader variant="page" />

      {/* ── Hero (optional) ── */}
      {title && (
        <div className="sh-hero">
          <div className="sh-hero-grid" />
          <div className="sh-hero-inner">
            {kicker && <span className="ps-kicker">{kicker}</span>}
            <h1 className="sh-hero-title">{title}</h1>
            {lead && <p className="sh-hero-lead">{lead}</p>}
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <main>
        {children}
      </main>

      <PublicDisclaimer />
      <PublicFooter />
    </div>
  );
}
