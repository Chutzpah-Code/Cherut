'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PublicLocaleSwitcher } from '@/i18n/PublicLocaleSwitcher';
import CherutLogo from '@/components/ui/CherutLogo';
import { SHELL_TOKENS } from '@/components/shell/tokens';

const { ink, ink2, mute, rule } = SHELL_TOKENS;

interface PublicHeaderProps {
  // 'home': in-page anchors (#features) — for the landing page itself.
  // 'page': cross-page anchors (/#features) — for every other public page.
  variant?: 'home' | 'page';
}

export function PublicHeader({ variant = 'page' }: PublicHeaderProps) {
  const t = useTranslations('publicHeader');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 960) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const prefix = variant === 'home' ? '#' : '/#';
  const navItems: [string, string][] = [
    [`${prefix}features`, t('features')],
    [`${prefix}method`, t('method')],
    [`${prefix}pricing`, t('pricing')],
  ];

  return (
    <>
      <style>{`
        .nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.82); backdrop-filter: saturate(180%) blur(14px); -webkit-backdrop-filter: saturate(180%) blur(14px); border-bottom: 1px solid ${rule}; transition: background .25s; }
        .nav-in { max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 40px; }
        .nav-links { display: flex; gap: 28px; font-size: 14px; color: ${ink2}; }
        .nav-links a { transition: color .12s; }
        .nav-r { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .nav-hamburger { display: none; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 8px; color: ${ink}; }
        .nav-hamburger:hover { background: #F6F6F4; }
        .nav-mobile { display: none; flex-direction: column; background: #fff; border-top: 1px solid ${rule}; padding: 8px 0 16px; }
        .nav-mobile.open { display: flex; }
        .nav-mobile-link { padding: 14px 24px; font-size: 16px; font-weight: 500; color: ${ink}; }
        .nav-mobile-link:hover { background: #F6F6F4; }
        .nav-mobile-ctas { display: flex; gap: 10px; padding: 12px 24px 4px; flex-wrap: wrap; align-items: center; }

        @media (max-width: 960px) {
          .nav-links, .nav-lang { display: none; }
        }
        @media (max-width: 767px) {
          .nav-r { display: none; }
          .nav-hamburger { display: flex; }
        }
        @media (max-width: 640px) {
          .nav-in { padding: 0 20px; }
        }
      `}</style>

      <header className="nav" style={{ background: scrolled ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.4)' }}>
        <div className="nav-in">
          <Link href="/" aria-label="Cherut" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <CherutLogo viewBox="200 279 338 132" width={88} height={34} fillColor={ink} />
          </Link>

          <nav className="nav-links">
            {navItems.map(([href, label]) => <Link key={label} href={href}>{label}</Link>)}
          </nav>

          <div className="nav-r">
            <span className="nav-lang"><PublicLocaleSwitcher color={mute} /></span>
            <Link href="/auth/login" className="btn btn-line btn-sm">{t('login')}</Link>
            <Link href="/auth/register" className="btn btn-dark btn-sm">{t('startBuilding')}</Link>
          </div>

          <button
            className="nav-hamburger"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
          </button>
        </div>

        <div className={`nav-mobile${menuOpen ? ' open' : ''}`}>
          {navItems.map(([href, label]) => (
            <Link key={label} href={href} className="nav-mobile-link" onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          <div className="nav-mobile-ctas">
            <PublicLocaleSwitcher color={ink} />
            <Link href="/auth/login" className="btn btn-line btn-sm" style={{ flex: 1, textAlign: 'center' }}>{t('login')}</Link>
            <Link href="/auth/register" className="btn btn-dark btn-sm" style={{ flex: 1, textAlign: 'center' }}>{t('startBuilding')}</Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default PublicHeader;
