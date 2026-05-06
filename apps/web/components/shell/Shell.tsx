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
    <div style={{ background: PAPER, color: INK, fontFamily: '"Inter", -apple-system, system-ui, sans-serif', fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }

        .lp-cta-dark { transition: opacity .15s, transform .1s; }
        .lp-cta-dark:hover { opacity: .85; transform: translateY(-1px); }
        .lp-cta-outline { transition: background .15s, border-color .15s, color .15s; }
        .lp-cta-outline:hover { background: ${INK}; color: ${PAPER}; border-color: ${INK}; }
        .lp-mobile-link { transition: background .1s; }
        .lp-mobile-link:hover { background: ${PAPER_2}; }

        .lp-nav-inner   { max-width: 1280px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; gap: 32px; }
        .lp-nav-links   { display: flex; gap: 28px; margin-left: 24px; font-size: 14px; font-weight: 500; color: rgba(15,15,30,.78); }
        .lp-nav-ctas    { display: flex; align-items: center; gap: 12px; margin-left: auto; }

        .lp-hamburger   { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; margin-left: auto; }
        .lp-hamburger:hover { background: ${PAPER_2}; }
        .lp-mobile-menu {
          display: none; flex-direction: column;
          background: ${PAPER}; border-top: 1px solid ${RULE};
          padding: 8px 0 16px;
        }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-link {
          padding: 14px 24px; font-size: 16px; font-weight: 500; color: ${INK};
          border-radius: 0; display: block;
        }
        .lp-mobile-ctas {
          display: flex; gap: 10px; padding: 12px 24px 4px; flex-wrap: wrap;
        }

        .lp-section         { padding: 120px 32px; }
        .lp-section-alt     { padding: 120px 32px; background: ${PAPER_2}; }
        .lp-section-head    { max-width: 760px; margin: 0 auto 64px; text-align: center; }

        .lp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 32px; padding-bottom: 48px; border-bottom: 1px solid ${RULE};
        }
        .lp-footer-brand { grid-column: span 1; }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto; padding-top: 24px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          font-size: 13px; color: rgba(15,15,30,.5);
        }

        .lp-kicker {
          display: inline-block; font-size: 12px; color: ${BLUE};
          letter-spacing: .1em; text-transform: uppercase;
          margin-bottom: 18px; font-weight: 600;
          padding: 5px 12px; border-radius: 999px; background: ${BLUE_SOFT};
        }
        .lp-h2 {
          font-size: clamp(36px, 5vw, 60px); line-height: 1.05;
          letter-spacing: -.03em; font-weight: 700; margin: 0;
        }
        .lp-h2-sub {
          font-size: 18px; color: ${MUTED}; line-height: 1.5;
          margin: 20px auto 0; max-width: 580px;
        }

        .sh-hero {
          padding: 80px 32px 64px;
          background: ${PAPER};
          border-bottom: 1px solid ${RULE};
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .sh-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px);
          background-size: 90px 90px;
          mask-image: radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .sh-hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
        .sh-hero-title {
          font-size: clamp(36px, 5vw, 60px); line-height: 1.05;
          letter-spacing: -.03em; font-weight: 700; margin: 0 0 20px; color: ${INK};
        }
        .sh-hero-lead { font-size: 18px; line-height: 1.55; color: ${MUTED}; margin: 0; }

        .sh-content { max-width: 1180px; margin: 0 auto; padding: 80px 32px; }

        .sh-card {
          background: ${PAPER}; border: 1px solid ${RULE};
          border-radius: 16px; padding: 32px;
          transition: transform .2s, border-color .2s;
        }
        .sh-card:hover { transform: translateY(-2px); border-color: ${BLUE}; }

        .sh-principles-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;
        }

        @media (max-width: 1023px) {
          .lp-nav-inner   { padding: 16px 24px; gap: 20px; }
          .lp-nav-links   { gap: 20px; }
          .lp-nav-tour    { display: none; }
          .lp-section     { padding: 80px 24px; }
          .lp-section-alt { padding: 80px 24px; }
          .sh-hero        { padding: 64px 24px 48px; }
          .sh-content     { padding: 64px 24px; }
        }

        @media (max-width: 767px) {
          .lp-nav-links  { display: none; }
          .lp-nav-ctas   { display: none; }
          .lp-hamburger  { display: flex; }
          .lp-nav-inner  { padding: 14px 20px; }
          .lp-section     { padding: 64px 20px; }
          .lp-section-alt { padding: 64px 20px; }
          .sh-hero        { padding: 56px 20px 40px; }
          .sh-hero-title  { font-size: clamp(32px, 8vw, 48px); }
          .sh-hero-lead   { font-size: 16px; }
          .sh-content     { padding: 48px 20px; }
          .sh-principles-grid { grid-template-columns: 1fr 1fr; }
          .lp-footer-inner { grid-template-columns: 1fr 1fr; }
          .lp-footer-brand { grid-column: span 2; }
          .lp-footer-bottom { flex-direction: column; gap: 8px; }
        }

        @media (max-width: 479px) {
          .sh-hero        { padding: 48px 16px 32px; }
          .sh-content     { padding: 40px 16px; }
          .sh-principles-grid { grid-template-columns: 1fr; }
          .lp-footer-inner { grid-template-columns: 1fr; }
          .lp-footer-brand { grid-column: span 1; }
          .lp-section     { padding: 56px 16px; }
          .lp-section-alt { padding: 56px 16px; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(250,250,247,0.82)' : PAPER,
        backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? RULE : 'transparent'}`,
        boxShadow: scrolled ? '0 1px 0 rgba(15,15,14,0.02), 0 8px 24px -16px rgba(15,15,14,0.08)' : 'none',
        transition: 'background .25s, border-color .25s, box-shadow .25s',
      }}>
        <div className="lp-nav-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <CMark size={28} color={PAPER} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: INK }}>Cherut</span>
          </Link>

          <div className="lp-nav-links">
            <Link href="/#features">Features <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span></Link>
            <Link href="/#how">Method</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/about">About</Link>
          </div>

          <div className="lp-nav-ctas">
            <Link href="/auth/login" style={{ fontSize: 14, color: 'rgba(15,15,30,0.7)', fontWeight: 500, padding: '8px 12px' }}>Login</Link>
            <Link href="/auth/register" className="lp-cta-dark" style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', background: INK, color: PAPER, borderRadius: 999 }}>
              Try for free
            </Link>
          </div>

          <button
            className="lp-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(v => !v)}
            style={{ color: INK }}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`}>
          <Link href="/#features" className="lp-mobile-link" onClick={closeMenu}>Features</Link>
          <Link href="/#how"      className="lp-mobile-link" onClick={closeMenu}>Method</Link>
          <Link href="/#pricing"  className="lp-mobile-link" onClick={closeMenu}>Pricing</Link>
          <Link href="/about"     className="lp-mobile-link" onClick={closeMenu}>About</Link>
          <div className="lp-mobile-ctas">
            <Link href="/auth/login"    className="lp-cta-outline" style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', border: `1px solid ${RULE}`, borderRadius: 999, flex: 1, textAlign: 'center' }}>Login</Link>
            <Link href="/auth/register" className="lp-cta-dark"    style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', background: INK, color: PAPER, borderRadius: 999, flex: 1, textAlign: 'center' }}>Try for free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero (optional) ── */}
      {title && (
        <div className="sh-hero">
          <div className="sh-hero-grid" />
          <div className="sh-hero-inner">
            {kicker && <span className="lp-kicker">{kicker}</span>}
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
      <footer style={{ background: PAPER, color: 'rgba(15,15,30,0.7)', padding: '64px 32px 32px', borderTop: `1px solid ${RULE}` }}>
        <div className="lp-footer-inner">
          <div className="lp-footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <CMark size={28} color={PAPER} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: INK }}>Cherut</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED, margin: '8px 0 0', lineHeight: 1.5, maxWidth: 280 }}>Cherut (חירות) — freedom in Hebrew. Not freedom from responsibility, freedom through it.</p>
          </div>
          {[
            { label: 'Product',   links: [['Features', '/#features'], ['Pricing', '/#pricing'], ['Changelog', '/changelog'], ['Roadmap', '/roadmap']] },
            { label: 'Company',   links: [['About', '/about'], ['Careers', '/careers'], ['Contact', '/contact']] },
            { label: 'Resources', links: [['Community', '#'], ['Help center', '/help-center'], ['Privacy', '/privacy-policy']] },
          ].map(col => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,15,30,0.55)', marginBottom: 4, fontWeight: 600 }}>{col.label}</div>
              {col.links.map(([text, href]) => <Link key={text} href={href}>{text}</Link>)}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 Cherut. Built with intention.</span>
          <span>Made for the dreamers who do.</span>
        </div>
      </footer>
    </div>
  );
}
