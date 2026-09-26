'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PublicLocaleSwitcher } from '@/i18n/PublicLocaleSwitcher';

// Dark theme tokens — mirrors the local copies in app/page.tsx and
// components/shell/Shell.tsx (this codebase duplicates these per-file
// rather than sharing one export; not something this change fixes).
const BG = '#07070D';
const SURF = '#0F0F1B';
const TEXT = '#EDEEF6';
const MUTED = 'rgba(237,238,246,0.46)';
const RULE = 'rgba(255,255,255,0.08)';

interface PublicHeaderProps {
  // 'home': in-page anchors (#features) — for the landing page itself.
  // 'page': cross-page anchors (/#features) — for every other public page.
  variant?: 'home' | 'page';
}

export function PublicHeader({ variant = 'page' }: PublicHeaderProps) {
  const t = useTranslations('publicHeader');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navInnerRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);

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

  // position: sticky is unreliable here — html/body carry overflow-x: hidden
  // (needed to clip the decorative bleed elements elsewhere on these pages),
  // and per the CSS overflow spec, setting only overflow-x forces the
  // browser to compute overflow-y: auto too. That silently turns body into
  // its own scroll container, which breaks sticky positioning relative to
  // the viewport in several browsers (notably Safari/iOS). position: fixed
  // isn't affected by ancestor scroll-container status, so we use that
  // instead and measure the bar's own height to reserve equivalent space —
  // measuring the inner row only (not the mobile dropdown) so the mobile
  // menu can still overlay page content instead of pushing it down.
  useEffect(() => {
    const measure = () => setNavHeight(navInnerRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const prefix = variant === 'home' ? '#' : '/#';
  const navItems: [string, string][] = [
    [`${prefix}features`, t('features')],
    [`${prefix}how`, t('method')],
    [`${prefix}pricing`, t('pricing')],
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style jsx global>{`
        .ph-nav-inner { max-width: 1280px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; gap: 32px; }
        .ph-nav-links { display: flex; gap: 28px; margin-left: 24px; font-size: 14px; font-weight: 500; }
        .ph-nav-links a { transition: color .12s; color: ${MUTED}; }
        .ph-nav-links a:hover { color: ${TEXT}; }
        .ph-nav-ctas { display: flex; align-items: center; gap: 16px; margin-left: auto; }
        .ph-cta-primary { transition: opacity .12s, transform .1s; }
        .ph-cta-primary:hover { opacity: .87; transform: translateY(-1px); }
        .ph-cta-ghost { transition: background .15s, color .15s, border-color .15s; }
        .ph-cta-ghost:hover { background: ${TEXT}; color: ${BG}; border-color: ${TEXT}; }
        .ph-hamburger { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; margin-left: auto; color: ${TEXT}; }
        .ph-hamburger:hover { background: ${SURF}; }
        .ph-mobile-menu { display: none; flex-direction: column; background: ${SURF}; border-top: 1px solid ${RULE}; padding: 8px 0 16px; }
        .ph-mobile-menu.open { display: flex; }
        .ph-mobile-link { padding: 14px 24px; font-size: 16px; font-weight: 500; color: ${TEXT}; display: block; transition: background .1s; }
        .ph-mobile-link:hover { background: ${SURF}; }
        .ph-mobile-ctas { display: flex; gap: 10px; padding: 12px 24px 4px; flex-wrap: wrap; align-items: center; }

        @media (max-width: 1023px) {
          .ph-nav-inner { padding: 16px 24px; gap: 20px; }
          .ph-nav-links { gap: 20px; }
        }
        @media (max-width: 767px) {
          .ph-nav-links { display: none; }
          .ph-nav-ctas { display: none; }
          .ph-hamburger { display: flex; }
          .ph-nav-inner { padding: 14px 20px; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(7,7,13,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? RULE : 'transparent'}`,
        transition: 'background .25s, border-color .25s',
      }}>
        <div className="ph-nav-inner" ref={navInnerRef}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <svg viewBox="0 0 64 64" width={24} height={24} fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="23.8" stroke={TEXT} strokeWidth="8.4" />
              <circle cx="32" cy="32" r="7" fill={TEXT} />
            </svg>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: '-0.025em', color: TEXT }}>Cherut</span>
          </Link>

          <div className="ph-nav-links">
            {navItems.map(([href, label]) => (
              <Link key={label} href={href}>{label}</Link>
            ))}
          </div>

          <div className="ph-nav-ctas">
            <PublicLocaleSwitcher color={MUTED} />
            <Link href="/auth/login" style={{ fontSize: 14, color: MUTED, fontWeight: 500, padding: '8px 12px' }}>{t('login')}</Link>
            <Link
              href="/auth/register"
              className="ph-cta-primary"
              style={{ fontSize: 14, fontWeight: 700, padding: '10px 20px', background: TEXT, color: BG, borderRadius: 999, letterSpacing: '-0.01em' }}
            >
              {t('startBuilding')}
            </Link>
          </div>

          <button
            className="ph-hamburger"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            }
          </button>
        </div>

        <div className={`ph-mobile-menu${menuOpen ? ' open' : ''}`}>
          {navItems.map(([href, label]) => (
            <Link key={label} href={href} className="ph-mobile-link" onClick={closeMenu}>{label}</Link>
          ))}
          <div className="ph-mobile-ctas">
            <PublicLocaleSwitcher color={TEXT} />
            <Link href="/auth/login" className="ph-cta-ghost" style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', border: `1px solid ${RULE}`, borderRadius: 999, flex: 1, textAlign: 'center', color: TEXT }}>
              {t('login')}
            </Link>
            <Link href="/auth/register" className="ph-cta-primary" style={{ fontSize: 14, fontWeight: 700, padding: '11px 20px', background: TEXT, color: BG, borderRadius: 999, flex: 1, textAlign: 'center' }}>
              {t('startBuilding')}
            </Link>
          </div>
        </div>
      </nav>
      <div style={{ height: navHeight }} aria-hidden="true" />
    </>
  );
}

// Keep a default export too, matching the original file's export shape in
// case anything imports it as `import Header from '...'` in the future.
export default PublicHeader;
