'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { useState, useEffect } from 'react';
import { CMark, SHELL_TOKENS } from '@/components/shell/Shell';

const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED, RULE, GRID } = SHELL_TOKENS;

const content = {
  features: [
    { tag: 'Habits', title: 'Daily systems that compound', body: 'Track habits with streaks, intent and reflection — not just checkboxes. Build the version of you that earns the dream.' },
    { tag: 'Tasks & Calendar', title: 'One inbox. One agenda.', body: 'Capture tasks anywhere and see them next to your real calendar. Two-way sync with Google Calendar keeps everything honest.' },
    { tag: 'OKRs', title: 'Goals with a method', body: 'Set objectives, define key results, review weekly. The framework Google uses — adapted for one human life.' },
    { tag: 'Dream Board', title: 'Pin the future you want', body: 'A visual canvas for the life you are building. Tie every habit and task back to the dream that started it.' },
    { tag: 'Values', title: 'A compass, not a to-do list', body: 'Define what matters, then let your daily decisions check themselves against it. Misalignment surfaces early.' },
    { tag: 'Finances', title: 'Money on the same page', body: 'Budgets, goals and net worth alongside the rest of your life — because financial freedom is freedom.' },
    { tag: 'Journals', title: 'Think clearly, daily', body: 'Morning intentions, evening reflections, gratitude and free-form notes. Searchable, private, yours.' },
    { tag: 'Integrations', title: 'Plays well with the tools you use', body: 'Google Calendar, Notion, Apple Health and more. Cherut adapts to your stack — not the other way around.' },
  ],
  steps: [
    { n: '01', title: 'Define what freedom means to you', body: 'Start with values and the dreams behind them. Cherut helps you name the life you actually want.' },
    { n: '02', title: 'Translate dreams into objectives', body: 'Use the OKR method to turn the abstract into something measurable. Quarterly horizons, not vague resolutions.' },
    { n: '03', title: 'Run your week with intention', body: 'Habits, tasks and calendar all point back to the same north star. Daily check-ins keep you honest.' },
    { n: '04', title: 'Reflect, adjust, repeat', body: 'Weekly and quarterly reviews built in. Your system evolves with you, not the other way around.' },
  ],
  testimonials: [
    { quote: 'I have tried every productivity app. Cherut is the first one that connects what I do today to who I want to become.', name: 'Marina A.', role: 'Designer · São Paulo' },
    { quote: 'The OKR layer is what made it click. My habits stopped being random — they started serving an actual goal.', name: 'Daniel R.', role: 'Founder · Lisbon' },
    { quote: 'It quiets the noise. I open one app in the morning instead of seven, and I leave it knowing what matters today.', name: 'Sara K.', role: 'PM · Berlin' },
    { quote: 'The dream board sounds soft until you build one. Mine has changed how I make decisions.', name: 'Lucas P.', role: 'Engineer · Porto Alegre' },
  ],
  pricing: [
    { name: 'Free', monthly: '$0', annual: '$0', cadenceMonthly: 'forever', cadenceAnnual: 'forever', blurb: 'Everything you need to start the practice.', features: ['Habits, tasks, journals', 'Up to 3 OKRs', 'Web + mobile', 'Community access'], cta: 'Get started', highlight: false, annualNote: null },
    { name: 'Pro', monthly: '$9', annual: '$7', cadenceMonthly: 'per month', cadenceAnnual: 'per month', blurb: 'For people serious about their system.', features: ['Unlimited OKRs', 'Calendar & integrations', 'Dream board, values, finances', 'Weekly review automations', 'Priority support'], cta: 'Start free trial', highlight: true, annualNote: 'Save 22%' },
    { name: 'Lifetime', monthly: '$249', annual: '$249', cadenceMonthly: 'one time', cadenceAnnual: 'one time', blurb: 'Pay once. Own your system forever.', features: ['Everything in Pro', 'All future updates', 'Founder community', 'Early access to new modules'], cta: 'Buy lifetime', highlight: false, annualNote: null },
  ],
  faq: [
    { q: 'Is Cherut just another productivity app?', a: 'No. Most apps stop at tasks. Cherut connects your daily actions to a method (OKRs), a compass (values) and a destination (dream board). It is a system, not a list.' },
    { q: 'Do I need to know the OKR method?', a: 'Not at all. Cherut walks you through it the first time you set a goal. The framework stays in the background — you just answer prompts.' },
    { q: 'What integrations are available?', a: 'Google Calendar today, with Notion, Apple Health and Outlook coming next. The roadmap is shaped by what the community asks for.' },
    { q: 'Is my data private?', a: 'Yes. Your journals, finances and reflections are encrypted and never used to train models. You can export everything as plain JSON at any time.' },
    { q: 'Can I use Cherut on mobile?', a: 'Yes — iOS and Android apps are in beta, available to anyone on a paid plan.' },
    { q: 'What does the name mean?', a: 'Cherut (חירות) means freedom in Hebrew. Not freedom from responsibility — freedom through it.' },
  ],
};


const tabs = [
  { label: 'Today',       sub: 'Your day at a glance',    icon: '◐' },
  { label: 'Habits',      sub: 'Streaks that compound',   icon: '◇' },
  { label: 'OKRs',        sub: 'Goals with method',       icon: '◯' },
  { label: 'Dream Board', sub: 'Pin the future you want', icon: '✦' },
  { label: 'Journal',     sub: 'Think clearly, daily',    icon: '◈' },
  { label: 'Finances',    sub: 'Money on the same page',  icon: '□' },
];

const featureIcons = ['◆', '◐', '◯', '✦', '◇', '◈', '□', '◉'];

export default function Home() {
  useAdminRedirect();

  const [scrolled, setScrolled]         = useState(false);
  const [activeTab, setActiveTab]       = useState(0);
  const [openFaq, setOpenFaq]           = useState<number>(0);
  const [billing, setBilling]           = useState<'monthly' | 'annual'>('annual');
  const [menuOpen, setMenuOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
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
        figure { margin: 0; }

        /* ── Hover micro-interactions ── */
        .lp-cta-dark  { transition: opacity .15s, transform .1s; }
        .lp-cta-dark:hover  { opacity: .85; transform: translateY(-1px); }
        .lp-cta-outline { transition: background .15s, border-color .15s, color .15s; }
        .lp-cta-outline:hover { background: ${INK}; color: ${PAPER}; border-color: ${INK}; }
        .lp-tab { transition: opacity .15s; }
        .lp-tab:hover { opacity: 1 !important; }
        .lp-feature-card { transition: transform .25s, border-color .25s; }
        .lp-feature-card:hover { transform: translateY(-3px); border-color: ${BLUE}; }
        .lp-faq-item { transition: background .15s; }
        .lp-faq-item:hover { background: ${PAPER_2}; }
        .lp-pricing-card { transition: transform .3s, box-shadow .3s; }
        .lp-pricing-card:hover { transform: translateY(-4px); }
        .lp-mobile-link { transition: background .1s; }
        .lp-mobile-link:hover { background: ${PAPER_2}; }

        /* ── Animation ── */
        @keyframes lp-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        .lp-shape { animation: lp-float 8s ease-in-out infinite; }

        /* ── Nav ── */
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

        /* ── Hero ── */
        .lp-hero-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1.4fr;
          gap: 32px; align-items: center; min-height: 420px;
        }
        .lp-hero-shape-wrap {
          width: 320px; height: 360px;
          filter: drop-shadow(0 30px 50px rgba(60,50,200,.35));
        }
        .lp-hero-text { text-align: center; padding-top: 24px; padding-bottom: 24px; }
        .lp-hero-h1 {
          font-size: clamp(40px, 5.6vw, 72px);
          line-height: 1.05; letter-spacing: -.035em;
          font-weight: 700; margin: 0 0 24px; color: ${INK};
        }
        .lp-hero-sub {
          font-size: 18px; line-height: 1.55; color: ${MUTED};
          max-width: 540px; margin: 0 auto 36px;
        }
        .lp-hero-ctas {
          display: flex; gap: 14px; justify-content: center;
          align-items: center; flex-wrap: wrap;
        }
        /* Mobile-only C mark decoration above headline */
        .lp-hero-cmark-mobile {
          display: none; justify-content: center; margin-bottom: 24px;
          filter: drop-shadow(0 12px 24px rgba(60,50,200,.25));
        }

        /* Hero section padding (overrideable by media queries) */
        .lp-hero-section { padding: 80px 32px 100px; }

        /* ── Dashboard mockup ── */
        .lp-dash-section { padding: 0 32px 100px; background: linear-gradient(180deg, ${PAPER} 0%, ${PAPER_2} 100%); }
        .lp-dash-outer   { max-width: 1200px; margin: 0 auto; }
        .lp-tab-bar {
          display: grid; grid-template-columns: repeat(6, 1fr);
          background: ${PAPER}; padding: 8px 8px 0;
          border-radius: 16px 16px 0 0;
          border: 1px solid ${RULE}; border-bottom: none;
        }
        .lp-dash-frame {
          position: relative; background: #E9E8E4;
          border: 1px solid ${RULE}; border-top: none;
          border-radius: 0 0 16px 16px; min-height: 480px;
          display: grid; grid-template-columns: 180px 1fr; overflow: hidden;
        }
        .lp-dash-sidebar { display: flex; }
        /* Mobile: hide entire dashboard, show welcome-card only */
        .lp-dash-mobile-preview { display: none; justify-content: center; padding: 0 24px 80px; }

        /* ── Sections ── */
        .lp-section         { padding: 120px 32px; }
        .lp-section-alt     { padding: 120px 32px; background: ${PAPER_2}; }
        .lp-section-head    { max-width: 760px; margin: 0 auto 64px; text-align: center; }
        .lp-features-grid   { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .lp-steps-grid      { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
        .lp-testimonials-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .lp-pricing-grid    { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; align-items: stretch; }

        /* ── About ── */
        .lp-about-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }

        /* ── Trust strip ── */
        .lp-strip        { max-width: 1280px; margin: 0 auto; padding: 0 32px 100px; text-align: center; }
        .lp-strip-logos  { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px 40px; align-items: center; }

        /* ── Footer ── */
        .lp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 32px; padding-bottom: 48px; border-bottom: 1px solid ${RULE};
        }
        .lp-footer-brand { grid-column: span 2; }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto; padding-top: 24px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          font-size: 13px; color: rgba(15,15,30,.5);
        }

        /* ── Kicker badge ── */
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

        /* ════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════ */

        /* ── Laptop (< 1200px) ── */
        @media (max-width: 1199px) {
          .lp-hero-shape-wrap { width: 260px; height: 300px; }
        }

        /* ── Tablet landscape (< 1024px) ── */
        @media (max-width: 1023px) {
          .lp-nav-inner   { padding: 16px 24px; gap: 20px; }
          .lp-nav-links   { gap: 20px; }
          .lp-nav-tour    { display: none; }
          .lp-section     { padding: 80px 24px; }
          .lp-section-alt { padding: 80px 24px; }
          .lp-section-head { margin-bottom: 48px; }
          .lp-strip       { padding: 0 24px 80px; }
          .lp-dash-section { padding: 0 24px 80px; }
          .lp-about-grid  { gap: 40px; }
          /* Tabs: 3+3 two-row visual or horizontal scroll */
          .lp-tab-bar     { grid-template-columns: repeat(3, 1fr); }
          /* Sidebar hidden on tablet — dashboard goes full-width */
          .lp-dash-frame  { grid-template-columns: 1fr; }
          .lp-dash-sidebar { display: none; }
        }

        /* ── Tablet portrait (< 768px) ── */
        @media (max-width: 767px) {
          /* Nav: hamburger replaces links */
          .lp-nav-links  { display: none; }
          .lp-nav-ctas   { display: none; }
          .lp-hamburger  { display: flex; }
          .lp-nav-inner  { padding: 14px 20px; }

          /* Hero: single column, C mark above headline */
          .lp-hero-section            { padding: 56px 20px 72px; }
          .lp-hero-inner              { grid-template-columns: 1fr; gap: 0; min-height: unset; }
          .lp-hero-shape-wrap         { display: none; }
          .lp-hero-cmark-mobile       { display: flex; }
          .lp-hero-text               { padding-top: 0; }
          .lp-hero-h1                 { font-size: clamp(32px, 9vw, 52px); }
          .lp-hero-sub                { font-size: 16px; margin-bottom: 28px; }
          .lp-hero-ctas               { flex-direction: column; align-items: stretch; gap: 10px; }
          .lp-hero-ctas a             { text-align: center; justify-content: center; }

          /* Dashboard mockup: hide complex version, show welcome card preview */
          .lp-dash-outer     { display: none; }
          .lp-dash-mobile-preview { display: flex; }

          /* Sections */
          .lp-section     { padding: 64px 20px; }
          .lp-section-alt { padding: 64px 20px; }
          .lp-section-head { margin-bottom: 40px; }
          .lp-strip       { padding: 0 20px 64px; }
          .lp-dash-section { padding: 0 20px 64px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-steps-grid    { grid-template-columns: 1fr 1fr; gap: 24px; }
          .lp-testimonials-grid { grid-template-columns: 1fr; }
          .lp-pricing-grid  { grid-template-columns: 1fr; }

          /* About */
          .lp-about-grid { grid-template-columns: 1fr; gap: 32px; }

          /* Footer */
          .lp-footer-inner {
            grid-template-columns: 1fr 1fr;
          }
          .lp-footer-brand { grid-column: span 2; }
          .lp-footer-bottom { flex-direction: column; gap: 8px; }

          /* Final CTA padding */
          .lp-final-cta { padding: 80px 20px !important; }
        }

        /* ── Mobile (< 480px) ── */
        @media (max-width: 479px) {
          .lp-steps-grid     { grid-template-columns: 1fr; }
          .lp-hero-section   { padding: 48px 16px 64px; }
          .lp-hero-h1        { font-size: clamp(28px, 9vw, 44px); }
          .lp-footer-inner   { grid-template-columns: 1fr; }
          .lp-footer-brand   { grid-column: span 1; }
          .lp-section        { padding: 56px 16px; }
          .lp-section-alt    { padding: 56px 16px; }
          .lp-strip          { padding: 0 16px 56px; }
          .lp-dash-section   { padding: 0 16px 56px; }
          .lp-final-cta      { padding: 64px 16px !important; }
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
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <CMark size={28} color={PAPER} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>Cherut</span>
          </a>

          {/* Desktop nav links */}
          <div className="lp-nav-links">
            <a href="#features">Features <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span></a>
            <a href="#how">Method</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">Resources <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span></a>
          </div>

          {/* Desktop CTAs */}
          <div className="lp-nav-ctas">
            <a href="/auth/login" style={{ fontSize: 14, color: 'rgba(15,15,30,0.7)', fontWeight: 500, padding: '8px 12px' }}>Login</a>
            <a href="/auth/register" className="lp-cta-dark" style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', background: INK, color: PAPER, borderRadius: 999 }}>
              Try for free
            </a>
          </div>

          {/* Hamburger (mobile only) */}
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

        {/* Mobile dropdown menu */}
        <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`}>
          <a href="#features" className="lp-mobile-link" onClick={closeMenu}>Features</a>
          <a href="#how"      className="lp-mobile-link" onClick={closeMenu}>Method</a>
          <a href="#pricing"  className="lp-mobile-link" onClick={closeMenu}>Pricing</a>
          <a href="#about"    className="lp-mobile-link" onClick={closeMenu}>Resources</a>
          <div className="lp-mobile-ctas">
            <a href="/auth/login"    className="lp-cta-outline" style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', border: `1px solid ${RULE}`, borderRadius: 999, flex: 1, textAlign: 'center' }}>Login</a>
            <a href="/auth/register" className="lp-cta-dark"    style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', background: INK, color: PAPER, borderRadius: 999, flex: 1, textAlign: 'center' }}>Try for free</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero-section" style={{ position: 'relative', overflowX: 'clip' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 80%)',
          pointerEvents: 'none',
        }} />
        <div className="lp-hero-inner">
          {/* Desktop: large floating shape on the left */}
          <div className="lp-shape lp-hero-shape-wrap">
            <CMark size={320} color={BLUE} />
          </div>

          <div className="lp-hero-text">
            {/* Mobile: small C mark above headline */}
            <div className="lp-hero-cmark-mobile">
              <div style={{ filter: 'drop-shadow(0 8px 20px rgba(60,50,200,.3))' }}>
                <CMark size={80} color={BLUE} />
              </div>
            </div>

            <h1 className="lp-hero-h1">
              <span style={{ whiteSpace: 'nowrap' }}>Silence the noise.</span><br />
              <span style={{ whiteSpace: 'nowrap' }}>Make your dreams real</span>
            </h1>
            <p className="lp-hero-sub">
              You know what you want. Cherut gives you the system to get there — habits, OKRs, calendar and journal in one quiet place.
            </p>
            <div className="lp-hero-ctas">
              <a href="/auth/register" className="lp-cta-dark" style={{ background: INK, color: PAPER, fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                Try for free <span>→</span>
              </a>
              <a href="#how" className="lp-cta-outline" style={{ fontSize: 15, fontWeight: 500, padding: '13px 26px', border: `1px solid ${RULE}`, borderRadius: 999, background: PAPER, color: INK }}>
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard mockup (desktop / tablet) ── */}
      <section className="lp-dash-section">
        <div className="lp-dash-outer">
          {/* Tab strip */}
          <div className="lp-tab-bar">
            {tabs.map((t, i) => (
              <button key={i} className="lp-tab" onClick={() => setActiveTab(i)} style={{
                padding: '16px 12px 18px', textAlign: 'center', borderRadius: 10,
                background: 'transparent', color: INK, opacity: activeTab === i ? 1 : 0.55,
                display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
                borderBottom: activeTab === i ? `2px solid ${BLUE}` : '2px solid transparent',
                transition: 'opacity .15s, border-color .2s',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: activeTab === i ? BLUE : BLUE_SOFT, color: activeTab === i ? PAPER : BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{t.sub}</div>
              </button>
            ))}
          </div>
          {/* Dashboard frame */}
          <div className="lp-dash-frame">
            <div className="lp-dash-sidebar" style={{ background: '#DEDDD8', padding: '20px 16px', flexDirection: 'column', gap: 14, borderRight: '1px solid rgba(15,15,30,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>M</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>Marina A.</div>
                  <div style={{ fontSize: 10, color: 'rgba(15,15,30,0.55)' }}>Personal</div>
                </div>
                <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 'auto' }}>▾</span>
              </div>
              {['80%', '60%', '75%', '55%', '70%', '45%'].map((w, i) => (
                <div key={i} style={{ height: 8, borderRadius: 4, background: 'rgba(15,15,30,0.08)', width: w }} />
              ))}
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Dashboard</div>
                <div style={{ display: 'flex', gap: 6, background: INK, borderRadius: 8, padding: 4 }}>
                  <button style={{ width: 24, height: 24, borderRadius: 5, color: PAPER, fontSize: 14, fontWeight: 500 }}>+</button>
                  <button style={{ width: 24, height: 24, borderRadius: 5, color: PAPER, fontSize: 14, fontWeight: 500 }}>—</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ background: '#D4D3CE', borderRadius: 10, padding: '18px 20px', minHeight: 130, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(15,15,30,0.18)', width: '40%' }} />
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(15,15,30,0.08)' }} />
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(15,15,30,0.08)', width: '70%' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Floating welcome card */}
            <WelcomeCard />
          </div>
        </div>

        {/* Mobile: welcome card preview standalone */}
        <div className="lp-dash-mobile-preview">
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span className="lp-kicker">Product preview</span>
              <p style={{ fontSize: 15, color: MUTED, margin: '8px 0 0' }}>Your entire life system, in one place.</p>
            </div>
            <WelcomeCardStatic />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="lp-strip">
        <div style={{ fontSize: 12, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>Plays well with the tools you already use</div>
        <div className="lp-strip-logos">
          {['Google Calendar', 'Notion', 'Apple Health', 'Outlook', 'Slack', 'Todoist'].map((t, i) => (
            <span key={i} style={{ fontSize: 15, fontWeight: 600, color: 'rgba(15,15,30,0.4)', letterSpacing: '-0.01em' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">Features</span>
          <h2 className="lp-h2">Everything you carry, in one quiet place.</h2>
          <p className="lp-h2-sub">Eight modules. One method. Turn each on as you grow into it.</p>
        </div>
        <div className="lp-features-grid">
          {content.features.map((f, i) => (
            <div key={i} className="lp-feature-card" style={{ background: PAPER, padding: '28px', borderRadius: 16, border: `1px solid ${RULE}`, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: BLUE_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, color: BLUE }}>{featureIcons[i % 8]}</span>
              </div>
              <span style={{ fontSize: 11, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{f.tag}</span>
              <h3 style={{ fontSize: 19, lineHeight: 1.25, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">How it works</span>
          <h2 className="lp-h2">A method, not just an app.</h2>
          <p className="lp-h2-sub">From values to dreams to weekly action — Cherut walks the path with you.</p>
        </div>
        <div className="lp-steps-grid">
          {content.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: BLUE, fontWeight: 700, letterSpacing: '0.05em' }}>{s.n}</div>
              <div style={{ height: 2, background: BLUE, width: 32, borderRadius: 1, marginBottom: 6 }} />
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.55, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">Loved by builders of intentional lives</span>
          <h2 className="lp-h2">What our community is saying.</h2>
        </div>
        <div className="lp-testimonials-grid">
          {content.testimonials.map((t, i) => (
            <figure key={i} style={{ padding: '28px', background: PAPER, borderRadius: 16, border: `1px solid ${RULE}`, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: BLUE, fontSize: 14, letterSpacing: '0.1em' }}>★★★★★</div>
              <blockquote style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 500, margin: 0, color: 'rgba(15,15,30,0.85)' }}>"{t.quote}"</blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">Pricing</span>
          <h2 className="lp-h2">Honest pricing, no surprises.</h2>
          <p className="lp-h2-sub">Start free. Upgrade when your system asks for more.</p>
          <div style={{ display: 'inline-flex', gap: 4, marginTop: 28, padding: 4, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 999 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'monthly' ? PAPER : 'rgba(15,15,30,0.65)', background: billing === 'monthly' ? INK : 'transparent', transition: 'background .15s, color .15s' }}>Monthly</button>
            <button onClick={() => setBilling('annual')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'annual' ? PAPER : 'rgba(15,15,30,0.65)', background: billing === 'annual' ? INK : 'transparent', transition: 'background .15s, color .15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Annual <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', background: BLUE, color: PAPER, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>save 22%</span>
            </button>
          </div>
        </div>
        <div className="lp-pricing-grid">
          {content.pricing.map((p, i) => {
            const price = billing === 'annual' ? p.annual : p.monthly;
            const cadence = billing === 'annual' ? p.cadenceAnnual : p.cadenceMonthly;
            const cadenceLabel = cadence === 'forever' || cadence === 'one time' ? cadence : '/' + cadence.replace('per ', '');
            return (
              <div key={i} className="lp-pricing-card" style={{ padding: '32px 28px', background: p.highlight ? INK : PAPER, color: p.highlight ? PAPER : INK, border: `1px solid ${p.highlight ? INK : RULE}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, right: 24, background: BLUE, color: PAPER, fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Most popular</div>}
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 48, lineHeight: 1, fontWeight: 700, letterSpacing: '-0.03em' }}>{price}</span>
                  <span style={{ fontSize: 14, opacity: 0.6 }}>{cadenceLabel}</span>
                </div>
                {billing === 'annual' && p.annualNote && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: p.highlight ? 'rgba(255,255,255,0.7)' : BLUE, marginTop: -6 }}>{p.annualNote} · billed annually</div>
                )}
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0, minHeight: 40 }}>{p.blurb}</p>
                <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map((feat, j) => (
                    <li key={j} style={{ fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: p.highlight ? 'rgba(255,255,255,0.8)' : BLUE, fontWeight: 700 }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <a href="/auth/register" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: p.highlight ? PAPER : PAPER_2, color: INK, fontSize: 14, fontWeight: 600, textAlign: 'center', border: `1px solid ${p.highlight ? PAPER : RULE}`, display: 'block' }}>{p.cta}</a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">FAQ</span>
          <h2 className="lp-h2">Questions, answered.</h2>
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', border: `1px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', background: PAPER }}>
          {content.faq.map((item, i) => (
            <div key={i} className="lp-faq-item" style={{ borderBottom: i < content.faq.length - 1 ? `1px solid ${RULE}` : 'none' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '22px 26px', fontSize: 17, fontWeight: 600, lineHeight: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, color: INK, letterSpacing: '-0.01em' }}>
                <span>{item.q}</span>
                <span style={{ fontSize: 22, color: BLUE, transition: 'transform .2s', display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: '0 26px 22px', fontSize: 15, lineHeight: 1.6, color: MUTED }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="lp-section-alt">
        <div className="lp-about-grid">
          <div>
            <span className="lp-kicker">About</span>
            <h2 className="lp-h2" style={{ textAlign: 'left' }}>Built by people who needed it themselves</h2>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(15,15,30,0.8)', margin: 0 }}>Cherut started when our founder spent a year hopping between Notion, Todoist, journals and spreadsheets — and realized the missing piece was not another tool, it was a system. We are a small team building the app we wanted to use: opinionated about method, gentle about how you get there.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: BLUE_SOFT, border: `2px solid ${PAPER_2}`, marginLeft: i > 0 ? -8 : 0, flexShrink: 0 }} />
              ))}
              <div style={{ fontSize: 14, color: MUTED, marginLeft: 8, fontWeight: 500 }}>+ a small, focused team</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final-cta" style={{ position: 'relative', padding: '120px 32px', textAlign: 'center', overflow: 'hidden', background: PAPER }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`, backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 22px' }}>Your dreams are waiting.</h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.5, maxWidth: 520, margin: '0 auto 36px' }}>Start with the free plan. Bring your noise. We will help you turn it down.</p>
          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-dark" style={{ background: INK, color: PAPER, fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Start free <span>→</span>
            </a>
            <a href="#" className="lp-cta-outline" style={{ fontSize: 15, fontWeight: 500, padding: '13px 26px', border: `1px solid ${RULE}`, borderRadius: 999, background: PAPER, color: INK }}>
              Talk to the team
            </a>
          </div>
        </div>
      </section>

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
            { label: 'Product',   links: [['Features', '#features'], ['Pricing', '#pricing'], ['Changelog', '/changelog'], ['Roadmap', '/roadmap']] },
            { label: 'Company',   links: [['About', '/about'], ['Careers', '/careers'], ['Contact', '/contact']] },
            { label: 'Resources', links: [['Community', 'https://t.me/+MxfNsOTcN-Y5MmYx'], ['Help center', '/help-center'], ['Privacy', '/privacy-policy']] },
          ].map(col => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,15,30,0.55)', marginBottom: 4, fontWeight: 600 }}>{col.label}</div>
              {col.links.map(([text, href]) => <a key={text} href={href}>{text}</a>)}
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

/* ── Sub-components ── */

function WelcomeCard() {
  return (
    <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translateX(-50%)', width: 320, background: PAPER, borderRadius: 14, boxShadow: '0 24px 60px rgba(15,15,30,0.18), 0 0 0 1px rgba(15,15,30,0.05)', overflow: 'hidden', zIndex: 10 }}>
      <WelcomeCardInner />
    </div>
  );
}

function WelcomeCardStatic() {
  return (
    <div style={{ background: PAPER, borderRadius: 14, boxShadow: '0 16px 40px rgba(15,15,30,0.12), 0 0 0 1px rgba(15,15,30,0.05)', overflow: 'hidden' }}>
      <WelcomeCardInner />
    </div>
  );
}

function WelcomeCardInner() {
  return (
    <>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${RULE}`, background: PAPER_2 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        </div>
      </div>
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Marina A.</div>
            <div style={{ fontSize: 11, color: MUTED }}>Designer · São Paulo</div>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Welcome to your system ✨</div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Your habits, OKRs, dream board and journal — woven together, ready when you are.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <a href="/auth/register" style={{ background: BLUE, color: PAPER, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Start your day</a>
        </div>
      </div>
    </>
  );
}
