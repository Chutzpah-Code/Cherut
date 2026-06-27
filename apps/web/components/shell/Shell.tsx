'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div style={{ background: PS.BG, color: PS.TEXT, fontFamily: PS.BODY, fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { background: ${PS.BG} !important; color-scheme: dark !important; }
        body { margin: 0; overflow-x: hidden; background: ${PS.BG} !important; color: ${PS.TEXT} !important; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }

        .ps-cta-primary { transition: opacity .12s, transform .1s; }
        .ps-cta-primary:hover { opacity: .87; transform: translateY(-1px); }
        .ps-cta-ghost { transition: background .15s, color .15s, border-color .15s; }
        .ps-cta-ghost:hover { background: ${PS.TEXT}; color: ${PS.BG}; }
        .ps-mobile-link:hover { background: ${PS.SURF}; }
        .ps-hamburger:hover { background: ${PS.SURF}; }
        .ps-nav-links a { transition: color .12s; color: ${PS.MUTED_D}; }
        .ps-nav-links a:hover { color: ${PS.TEXT}; }

        .ps-nav-inner  { max-width: 1280px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; gap: 32px; }
        .ps-nav-links  { display: flex; gap: 28px; margin-left: 24px; font-size: 14px; font-weight: 500; }
        .ps-nav-ctas   { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .ps-hamburger  { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; margin-left: auto; color: ${PS.TEXT}; }
        .ps-mobile-menu { display: none; flex-direction: column; background: ${PS.SURF}; border-top: 1px solid ${PS.RULE_D}; padding: 8px 0 16px; }
        .ps-mobile-menu.open { display: flex; }
        .ps-mobile-link { padding: 14px 24px; font-size: 16px; font-weight: 500; color: ${PS.TEXT}; display: block; }
        .ps-mobile-ctas { display: flex; gap: 10px; padding: 12px 24px 4px; flex-wrap: wrap; }

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

        .lp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 32px; padding-bottom: 48px; border-bottom: 1px solid ${PS.RULE_D};
        }
        .lp-footer-brand { grid-column: span 1; }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto; padding-top: 24px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          font-size: 13px; color: rgba(237,238,246,.28);
        }

        @media (max-width: 1023px) {
          .ps-nav-inner  { padding: 16px 24px; gap: 20px; }
          .ps-nav-links  { gap: 20px; }
          .sh-hero       { padding: 64px 24px 48px; }
        }
        @media (max-width: 767px) {
          .ps-nav-links  { display: none; }
          .ps-nav-ctas   { display: none; }
          .ps-hamburger  { display: flex; }
          .ps-nav-inner  { padding: 14px 20px; }
          .sh-hero       { padding: 56px 20px 40px; }
          .sh-hero-title { font-size: clamp(32px, 8vw, 52px); }
          .sh-hero-lead  { font-size: 16px; }
          .lp-footer-inner { grid-template-columns: 1fr 1fr; }
          .lp-footer-brand { grid-column: span 2; }
          .lp-footer-bottom { flex-direction: column; gap: 8px; }
        }
        @media (max-width: 479px) {
          .sh-hero       { padding: 48px 16px 32px; }
          .lp-footer-inner { grid-template-columns: 1fr; }
          .lp-footer-brand { grid-column: span 1; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(7,7,13,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? PS.RULE_D : 'transparent'}`,
        transition: 'background .25s, border-color .25s',
      }}>
        <div className="ps-nav-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: PS.ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <CMark size={28} color={PS.BG} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: PS.TEXT }}>Cherut</span>
          </Link>

          <div className="ps-nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#how">Method</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/about">About</Link>
          </div>

          <div className="ps-nav-ctas">
            <Link href="/auth/login" style={{ fontSize: 14, color: PS.MUTED_D, fontWeight: 500, padding: '8px 12px' }}>Login</Link>
            <Link href="/auth/register" className="ps-cta-primary" style={{ fontSize: 14, fontWeight: 700, padding: '10px 20px', background: PS.TEXT, color: PS.BG, borderRadius: 999 }}>
              Start building
            </Link>
          </div>

          <button className="ps-hamburger" aria-label={menuOpen ? 'Close' : 'Menu'} onClick={() => setMenuOpen(v => !v)}>
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
        </div>

        <div className={`ps-mobile-menu${menuOpen ? ' open' : ''}`}>
          {([['/#features','Features'],['/#how','Method'],['/#pricing','Pricing'],['/about','About']] as [string,string][]).map(([href, label]) => (
            <Link key={label} href={href} className="ps-mobile-link" onClick={closeMenu}>{label}</Link>
          ))}
          <div className="ps-mobile-ctas">
            <Link href="/auth/login"    className="ps-cta-ghost"   style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', border: `1px solid ${PS.RULE_D}`, borderRadius: 999, flex: 1, textAlign: 'center', color: PS.TEXT }}>Login</Link>
            <Link href="/auth/register" className="ps-cta-primary" style={{ fontSize: 14, fontWeight: 700, padding: '11px 20px', background: PS.TEXT, color: PS.BG, borderRadius: 999, flex: 1, textAlign: 'center' }}>Start building</Link>
          </div>
        </div>
      </nav>

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

      {/* ── Footer ── */}
      <footer style={{ background: PS.SURF, color: PS.MUTED_D, padding: '64px 32px 32px', borderTop: `1px solid ${PS.RULE_D}` }}>
        <div className="lp-footer-inner">
          <div className="lp-footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: PS.ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <CMark size={28} color={PS.BG} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: PS.TEXT }}>Cherut</span>
            </div>
            <p style={{ fontSize: 14, color: PS.MUTED_D, margin: '8px 0 0', lineHeight: 1.5, maxWidth: 280 }}>Cherut (חירות) — freedom in Hebrew. Not freedom from responsibility, freedom through it.</p>
          </div>
          {[
            { label: 'Product',   links: [['Features', '/#features'], ['Pricing', '/#pricing'], ['Changelog', '/changelog'], ['Roadmap', '/roadmap']] },
            { label: 'Company',   links: [['About', '/about'], ['Careers', '/careers'], ['Contact', '/contact']] },
            { label: 'Resources', links: [['Community', 'https://t.me/+MxfNsOTcN-Y5MmYx'], ['Help center', '/help-center'], ['Privacy', '/privacy-policy']] },
          ].map(col => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,246,0.28)', marginBottom: 4, fontWeight: 700 }}>{col.label}</div>
              {col.links.map(([text, href]) => (
                <Link key={text} href={href} style={{ color: PS.MUTED_D, transition: 'color .12s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = PS.TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = PS.MUTED_D)}>{text}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 Cherut. Built with obsession.</span>
          <span>For the ones who refused to wait.</span>
        </div>
      </footer>
    </div>
  );
}
