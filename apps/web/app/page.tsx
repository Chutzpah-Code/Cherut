'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { useState, useEffect } from 'react';
import { CMark, SHELL_TOKENS } from '@/components/shell/Shell';

// App shell tokens — used inside the dashboard mockup to match real app UI
const { BLUE, BLUE_SOFT, INK, PAPER, PAPER_2, MUTED: APP_MUTED, RULE: APP_RULE } = SHELL_TOKENS;

// ── Dark landing page theme ──────────────────────────────────────────────────
const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.1)';
const RULE    = 'rgba(255,255,255,0.08)';
const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
const BODY    = '"DM Sans", -apple-system, system-ui, sans-serif';

const content = {
  features: [
    { tag: 'Habits',         title: 'Daily systems that compound',      body: 'Track habits with streaks, intent and reflection — not just checkboxes. Build the version of you that earns the dream.' },
    { tag: 'Tasks & Calendar', title: 'One inbox. One agenda.',         body: 'Capture tasks anywhere and see them next to your real calendar. Two-way sync with Google Calendar keeps everything honest.' },
    { tag: 'OKRs',           title: 'Goals with a method',              body: 'Set objectives, define key results, review weekly. The framework Google uses — adapted for one human life.' },
    { tag: 'Dream Board',    title: 'Pin the future you want',          body: 'A visual canvas for the life you are building. Tie every habit and task back to the dream that started it.' },
    { tag: 'Values',         title: 'A compass, not a to-do list',      body: 'Define what matters, then let your daily decisions check themselves against it. Misalignment surfaces early.' },
    { tag: 'Finances',       title: 'Money on the same page',           body: 'Budgets, goals and net worth alongside the rest of your life — because financial freedom is freedom.' },
    { tag: 'Journal',        title: 'Think on paper, daily',            body: 'Morning intentions, evening reflections, gratitude and free-form notes. Searchable, private, yours.' },
    { tag: 'Integrations',   title: 'Plays well with the tools you use', body: 'Google Calendar, Notion, Apple Health and more. Cherut adapts to your stack — not the other way around.' },
  ],
  steps: [
    { n: '01', title: 'Name the obsession',       body: 'Define your values and the life they point to. Not vague goals — the specific outcome you are willing to sacrifice for.' },
    { n: '02', title: 'Break it into quarterly bets', body: 'OKRs turn ambition into a target. You stop dreaming in years and start executing in weeks.' },
    { n: '03', title: 'Run the week like a machine', body: 'Habits, tasks and calendar aligned to one direction. Daily check-ins keep you from drifting.' },
    { n: '04', title: 'Review. Adapt. Press harder.', body: 'Weekly and quarterly reviews built in. Systems that do not evolve break. Yours will not.' },
  ],
  testimonials: [
    { quote: 'I have tried every productivity app. Cherut is the first one that connects what I do today to who I want to become.', name: 'Marina A.', role: 'Designer · São Paulo' },
    { quote: 'The OKR layer is what made it click. My habits stopped being random — they started serving an actual goal.', name: 'Daniel R.', role: 'Founder · Lisbon' },
    { quote: 'It quiets the noise. I open one app in the morning instead of seven, and I leave knowing what matters today.', name: 'Sara K.', role: 'PM · Berlin' },
  ],
  pricing: [
    { name: 'Free', monthly: '$0', annual: '$0', cadenceMonthly: 'forever', cadenceAnnual: 'forever', blurb: 'Start the practice. No excuses.', features: ['Habits, tasks, journals', 'Up to 3 OKRs', 'Web + mobile', 'Community access'], cta: 'Start building', highlight: false, annualNote: null },
    { name: 'Pro', monthly: '$9', annual: '$7', cadenceMonthly: 'per month', cadenceAnnual: 'per month', blurb: 'For people serious about their system.', features: ['Unlimited OKRs', 'Calendar & integrations', 'Dream board, values, finances', 'Weekly review automations', 'Priority support'], cta: 'Go all in', highlight: true, annualNote: 'Save 22%' },
    { name: 'Lifetime', monthly: '$249', annual: '$249', cadenceMonthly: 'one time', cadenceAnnual: 'one time', blurb: 'Pay once. Own your system forever.', features: ['Everything in Pro', 'All future updates', 'Founder community', 'Early access to new modules'], cta: 'Own it forever', highlight: false, annualNote: null },
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

  const [scrolled, setScrolled]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq]     = useState<number>(0);
  const [billing, setBilling]     = useState<'monthly' | 'annual'>('annual');
  const [menuOpen, setMenuOpen]   = useState(false);

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

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: BODY, fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { background: ${BG} !important; color-scheme: dark !important; }
        body { margin: 0; overflow-x: hidden; background: ${BG} !important; color: ${TEXT} !important; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }
        figure { margin: 0; }

        .lp-cta-primary { transition: opacity .12s, transform .1s; }
        .lp-cta-primary:hover { opacity: .87; transform: translateY(-1px); }
        .lp-cta-ghost { transition: background .15s, color .15s, border-color .15s; }
        .lp-cta-ghost:hover { background: ${TEXT}; color: ${BG}; border-color: ${TEXT}; }
        .lp-tab { transition: opacity .15s; }
        .lp-tab:hover { opacity: 1 !important; }
        .lp-feature-card { transition: transform .22s, border-color .22s; }
        .lp-feature-card:hover { transform: translateY(-3px); border-color: ${ACCENT}; }
        .lp-faq-item { transition: background .15s; }
        .lp-faq-item:hover { background: ${SURF2}; }
        .lp-pricing-card { transition: transform .28s, box-shadow .28s; }
        .lp-pricing-card:hover { transform: translateY(-4px); }
        .lp-mobile-link:hover { background: ${SURF}; }
        .lp-hamburger:hover { background: ${SURF}; }
        .lp-nav-links a { transition: color .12s; }
        .lp-nav-links a:hover { color: ${TEXT}; }

        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.10; }
          50%       { opacity: 0.18; }
        }
        .lp-hero-glow { animation: lp-glow-pulse 5s ease-in-out infinite; }

        /* Nav */
        .lp-nav-inner { max-width: 1280px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; gap: 32px; }
        .lp-nav-links { display: flex; gap: 28px; margin-left: 24px; font-size: 14px; font-weight: 500; color: rgba(237,238,246,.55); }
        .lp-nav-ctas  { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .lp-hamburger { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 8px; margin-left: auto; }
        .lp-mobile-menu { display: none; flex-direction: column; background: ${SURF}; border-top: 1px solid ${RULE}; padding: 8px 0 16px; }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-link { padding: 14px 24px; font-size: 16px; font-weight: 500; color: ${TEXT}; display: block; transition: background .1s; }
        .lp-mobile-ctas { display: flex; gap: 10px; padding: 12px 24px 4px; flex-wrap: wrap; }

        /* Kicker */
        .lp-kicker {
          display: inline-block; font-size: 11px; color: ${ACCENT};
          letter-spacing: .14em; text-transform: uppercase; font-weight: 700;
          margin-bottom: 20px; padding: 5px 13px; border-radius: 999px;
          border: 1px solid rgba(80,110,255,0.4); background: ${ACCENT_DIM};
        }

        /* Hero */
        .lp-hero-section { padding: 108px 32px 88px; position: relative; overflow: hidden; text-align: center; }
        .lp-hero-h1 {
          font-family: ${DISPLAY}; font-style: normal; text-transform: uppercase;
          font-size: clamp(54px, 10.5vw, 134px);
          line-height: 0.94; letter-spacing: 0.005em; font-weight: 800;
          margin: 0 0 32px; color: ${TEXT};
        }
        .lp-hero-h1 em { color: ${ACCENT}; font-style: normal; }
        .lp-hero-sub { font-size: clamp(15px, 1.8vw, 18px); line-height: 1.65; color: ${MUTED}; max-width: 560px; margin: 0 auto 40px; }
        .lp-hero-ctas { display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }

        /* Dashboard */
        .lp-dash-section { padding: 0 32px 100px; }
        .lp-dash-outer   { max-width: 1200px; margin: 0 auto; }
        .lp-tab-bar {
          display: grid; grid-template-columns: repeat(6, 1fr);
          background: ${SURF}; padding: 8px 8px 0;
          border-radius: 12px 12px 0 0; border: 1px solid ${RULE}; border-bottom: none;
        }
        .lp-dash-frame {
          position: relative; border: 1px solid ${RULE}; border-top: none;
          border-radius: 0 0 12px 12px; min-height: 480px;
          display: grid; grid-template-columns: 172px 1fr; overflow: hidden;
        }
        .lp-dash-sidebar { display: flex; }
        .lp-dash-mobile-preview { display: none; justify-content: center; padding: 0 24px 80px; }

        /* Sections */
        .lp-section      { padding: 120px 32px; }
        .lp-section-alt  { padding: 120px 32px; background: ${SURF}; }
        .lp-section-head { max-width: 760px; margin: 0 auto 64px; text-align: center; }
        .lp-features-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
        .lp-steps-grid    { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 36px; }
        .lp-pricing-grid  { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; align-items: stretch; }
        .lp-about-grid    { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        .lp-t-two-col     { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }

        /* Section headings */
        .lp-h2 {
          font-family: ${DISPLAY}; font-style: normal; text-transform: uppercase;
          font-size: clamp(40px, 6.5vw, 76px); line-height: 0.96;
          letter-spacing: 0.01em; font-weight: 800; margin: 0; color: ${TEXT};
        }
        .lp-h2-sub { font-size: 17px; color: ${MUTED}; line-height: 1.6; margin: 22px auto 0; max-width: 540px; }

        /* Strip */
        .lp-strip       { max-width: 1280px; margin: 0 auto; padding: 0 32px 100px; text-align: center; }
        .lp-strip-logos { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px 48px; align-items: center; }

        /* Footer */
        .lp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 32px; padding-bottom: 48px; border-bottom: 1px solid ${RULE};
        }
        .lp-footer-brand { grid-column: span 2; }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto; padding-top: 24px;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          font-size: 13px; color: rgba(237,238,246,.28);
        }

        /* ═══ Responsive ═══ */
        @media (max-width: 1023px) {
          .lp-nav-inner   { padding: 16px 24px; }
          .lp-nav-links   { gap: 20px; }
          .lp-section     { padding: 80px 24px; }
          .lp-section-alt { padding: 80px 24px; }
          .lp-strip       { padding: 0 24px 80px; }
          .lp-dash-section { padding: 0 24px 80px; }
          .lp-about-grid  { gap: 40px; }
          .lp-tab-bar     { grid-template-columns: repeat(3, 1fr); }
          .lp-dash-frame  { grid-template-columns: 1fr; }
          .lp-dash-sidebar { display: none; }
        }
        @media (max-width: 767px) {
          .lp-nav-links { display: none; }
          .lp-nav-ctas  { display: none; }
          .lp-hamburger { display: flex; }
          .lp-nav-inner { padding: 14px 20px; }
          .lp-hero-section { padding: 72px 20px 64px; }
          .lp-hero-sub  { margin-bottom: 28px; }
          .lp-hero-ctas { flex-direction: column; align-items: stretch; gap: 10px; }
          .lp-hero-ctas a { text-align: center; justify-content: center; }
          .lp-dash-outer { display: none; }
          .lp-dash-mobile-preview { display: flex; }
          .lp-section     { padding: 64px 20px; }
          .lp-section-alt { padding: 64px 20px; }
          .lp-section-head { margin-bottom: 40px; }
          .lp-strip       { padding: 0 20px 64px; }
          .lp-dash-section { padding: 0 20px 64px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-steps-grid    { grid-template-columns: 1fr 1fr; gap: 24px; }
          .lp-pricing-grid  { grid-template-columns: 1fr; }
          .lp-about-grid    { grid-template-columns: 1fr; gap: 32px; }
          .lp-t-two-col     { grid-template-columns: 1fr; gap: 48px; }
          .lp-footer-inner  { grid-template-columns: 1fr 1fr; }
          .lp-footer-brand  { grid-column: span 2; }
          .lp-footer-bottom { flex-direction: column; gap: 8px; }
          .lp-final-cta { padding: 80px 20px !important; }
        }
        @media (max-width: 479px) {
          .lp-steps-grid   { grid-template-columns: 1fr; }
          .lp-footer-inner { grid-template-columns: 1fr; }
          .lp-footer-brand { grid-column: span 1; }
          .lp-section      { padding: 56px 16px; }
          .lp-section-alt  { padding: 56px 16px; }
          .lp-strip        { padding: 0 16px 56px; }
          .lp-dash-section { padding: 0 16px 56px; }
          .lp-final-cta    { padding: 64px 16px !important; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(7,7,13,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? RULE : 'transparent'}`,
        transition: 'background .25s, border-color .25s',
      }}>
        <div className="lp-nav-inner">
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <CMark size={28} color={BG} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: TEXT }}>Cherut</span>
          </a>

          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">Method</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </div>

          <div className="lp-nav-ctas">
            <a href="/auth/login" style={{ fontSize: 14, color: MUTED, fontWeight: 500, padding: '8px 12px' }}>Login</a>
            <a href="/auth/register" className="lp-cta-primary" style={{ fontSize: 14, fontWeight: 700, padding: '10px 20px', background: TEXT, color: BG, borderRadius: 999, letterSpacing: '-0.01em' }}>
              Start building
            </a>
          </div>

          <button className="lp-hamburger" aria-label={menuOpen ? 'Close' : 'Menu'} onClick={() => setMenuOpen(v => !v)} style={{ color: TEXT }}>
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
        </div>

        <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`}>
          {[['#features','Features'],['#how','Method'],['#pricing','Pricing'],['#about','About']].map(([href, label]) => (
            <a key={label} href={href} className="lp-mobile-link" onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <div className="lp-mobile-ctas">
            <a href="/auth/login"    className="lp-cta-ghost"   style={{ fontSize: 14, fontWeight: 600, padding: '11px 20px', border: `1px solid ${RULE}`, borderRadius: 999, flex: 1, textAlign: 'center', color: TEXT }}>Login</a>
            <a href="/auth/register" className="lp-cta-primary" style={{ fontSize: 14, fontWeight: 700, padding: '11px 20px', background: TEXT, color: BG, borderRadius: 999, flex: 1, textAlign: 'center' }}>Start building</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero-section">
        {/* Dark grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', pointerEvents: 'none' }} />
        {/* Accent glow — pulsing */}
        <div className="lp-hero-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${ACCENT} 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="lp-kicker">Built for the obsessed</span>

          <h1 className="lp-hero-h1">
            The only thing<br />
            that distorts time<br />
            is <em>intensity.</em>
          </h1>

          <p className="lp-hero-sub">
            You came from the bottom with nothing but obsession. Obsession alone burns out — it needs a method. Cherut gives it one. The method is called <strong style={{ color: TEXT, fontWeight: 700 }}>ALL IN ALL THE TIME</strong>.
          </p>

          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              Start building <span>→</span>
            </a>
            <a href="#how" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              See the system
            </a>
          </div>
        </div>
      </section>

      {/* ── Dashboard mockup ── */}
      <section className="lp-dash-section">
        <div className="lp-dash-outer">
          <div className="lp-tab-bar">
            {tabs.map((t, i) => (
              <button key={i} className="lp-tab" onClick={() => setActiveTab(i)} style={{ padding: '14px 10px 16px', textAlign: 'center', borderRadius: 8, background: 'transparent', color: TEXT, opacity: activeTab === i ? 1 : 0.42, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', borderBottom: activeTab === i ? `2px solid ${ACCENT}` : '2px solid transparent', transition: 'opacity .15s, border-color .2s' }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: activeTab === i ? ACCENT : ACCENT_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: activeTab === i ? BG : TEXT }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{t.label}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{t.sub}</div>
              </button>
            ))}
          </div>

          <div className="lp-dash-frame">
            {/* Sidebar */}
            <div className="lp-dash-sidebar" style={{ background: '#060610', padding: '18px 10px', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 16px' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <CMark size={22} color={PAPER} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Cherut</span>
              </div>
              {[
                { icon: '◈', label: 'Dashboard',   active: true  },
                { icon: '◇', label: 'Habits',      active: false },
                { icon: '◆', label: 'Tasks',       active: false },
                { icon: '◯', label: 'OKRs',        active: false },
                { icon: '◐', label: 'Journal',     active: false },
                { icon: '✦', label: 'Vision Board',active: false },
                { icon: '□', label: 'Finance',     active: false },
              ].map((item) => (
                <div key={item.label} style={{ padding: '7px 8px', borderRadius: 7, background: item.active ? 'rgba(255,255,255,0.09)' : 'transparent', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 11, color: item.active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)' }}>{item.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: item.active ? 600 : 400, color: item.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.42)' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ marginTop: 'auto', padding: '8px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: BLUE_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: BLUE, flexShrink: 0 }}>MA</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.72)' }}>Marina A.</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)' }}>Personal</div>
                </div>
              </div>
            </div>

            {/* Main — light Cherut UI inside dark frame */}
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'hidden', background: PAPER_2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: APP_MUTED, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Friday · June 27</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>Good morning, Marina ☀</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PAPER, fontSize: 18, flexShrink: 0 }}>+</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'Habit streak', value: '7 days',  color: '#16a34a' },
                  { label: 'Due today',    value: '4 tasks', color: '#dc2626' },
                  { label: 'OKR score',    value: '68%',     color: BLUE      },
                  { label: 'Net balance',  value: '+$280',   color: '#16a34a' },
                ].map((s) => (
                  <div key={s.label} style={{ background: PAPER, borderRadius: 9, padding: '10px 13px', border: `1px solid ${APP_RULE}` }}>
                    <div style={{ fontSize: 9, color: APP_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: PAPER, borderRadius: 11, padding: '14px 16px', border: `1px solid ${APP_RULE}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: APP_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Today's habits</div>
                  {[
                    { name: 'Morning run',     streak: 7,  color: '#0ea5e9', done: true  },
                    { name: 'Meditate',        streak: 4,  color: '#8b5cf6', done: true  },
                    { name: 'Read 30 pages',   streak: 5,  color: '#f59e0b', done: false },
                    { name: 'Evening journal', streak: 12, color: '#10b981', done: false },
                  ].map((h, i) => (
                    <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 9, paddingTop: i > 0 ? 9 : 0, borderTop: i > 0 ? `1px solid ${APP_RULE}` : 'none' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: h.done ? h.color : 'transparent', border: `1.5px solid ${h.done ? h.color : APP_RULE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {h.done && <span style={{ color: 'white', fontSize: 8, fontWeight: 800 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 11, color: h.done ? APP_MUTED : INK, textDecoration: h.done ? 'line-through' : 'none', flex: 1 }}>{h.name}</span>
                      <span style={{ fontSize: 9, color: h.color, fontWeight: 700 }}>🔥{h.streak}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: PAPER, borderRadius: 11, padding: '14px 16px', border: `1px solid ${APP_RULE}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: APP_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Q2 OKR</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginBottom: 14 }}>Build the foundation</div>
                  {[
                    { label: 'Establish daily habits', pct: 80 },
                    { label: 'Hit revenue targets',    pct: 45 },
                    { label: 'Complete online course', pct: 62 },
                  ].map((kr, i) => (
                    <div key={kr.label} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: APP_MUTED }}>{kr.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: BLUE }}>{kr.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: BLUE_SOFT, borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${kr.pct}%`, background: BLUE, borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <WelcomeCard />
          </div>
        </div>

        <div className="lp-dash-mobile-preview">
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span className="lp-kicker">Product preview</span>
            </div>
            <WelcomeCardStatic />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="lp-strip">
        <div style={{ fontSize: 11, color: 'rgba(237,238,246,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>Connects with the tools you already use</div>
        <div className="lp-strip-logos">
          {['Google Calendar', 'Notion', 'Apple Health', 'Outlook', 'Slack', 'Todoist'].map((t, i) => (
            <span key={i} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(237,238,246,0.22)', letterSpacing: '-0.01em' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">The Arsenal</span>
          <h2 className="lp-h2">Eight weapons.<br/>One direction.</h2>
          <p className="lp-h2-sub">Every module built for execution. Turn each on as your system demands it.</p>
        </div>
        <div className="lp-features-grid">
          {content.features.map((f, i) => (
            <div key={i} className="lp-feature-card" style={{ background: SURF, padding: '26px 28px', borderRadius: 14, border: `1px solid ${RULE}`, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 228 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, color: ACCENT }}>{featureIcons[i % 8]}</span>
              </div>
              <span style={{ fontSize: 10, color: ACCENT, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>{f.tag}</span>
              <h3 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 19, lineHeight: 1.08, fontWeight: 700, margin: 0, color: TEXT }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.62, color: MUTED, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">The Method</span>
          <h2 className="lp-h2">Intention without<br/>a system is anxiety.</h2>
          <p className="lp-h2-sub">Cherut connects what you do today to who you need to become. Four steps. No shortcuts.</p>
        </div>
        <div className="lp-steps-grid">
          {content.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: '0.1em' }}>{s.n}</div>
              <div style={{ height: 2, background: ACCENT, width: 32, borderRadius: 1, marginBottom: 6 }} />
              <h3 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 22, lineHeight: 1.08, fontWeight: 700, margin: 0, color: TEXT }}>{s.title}</h3>
              <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.62, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">From the community</span>
          <h2 className="lp-h2">From people who<br/>refused to settle.</h2>
        </div>

        {/* Featured quote */}
        <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 64, marginBottom: 64, borderBottom: `1px solid ${RULE}`, textAlign: 'center' }}>
          <blockquote style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1.15, fontWeight: 700, color: TEXT, margin: '0 auto 28px', maxWidth: 860, letterSpacing: '0.01em' }}>
            "{content.testimonials[0].quote}"
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.4)`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{content.testimonials[0].name.charAt(0)}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{content.testimonials[0].name}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{content.testimonials[0].role}</div>
            </div>
          </div>
        </div>

        {/* Two smaller quotes */}
        <div className="lp-t-two-col" style={{ maxWidth: 1140, margin: '0 auto' }}>
          {content.testimonials.slice(1).map((t, i) => (
            <figure key={i} style={{ padding: i === 0 ? '0 56px 0 0' : '0 0 0 56px', borderRight: i === 0 ? `1px solid ${RULE}` : 'none', margin: 0 }}>
              <blockquote style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontWeight: 600, fontSize: 'clamp(17px, 2.2vw, 26px)', lineHeight: 1.22, color: `rgba(237,238,246,0.78)`, margin: '0 0 22px', letterSpacing: '0.005em' }}>
                "{t.quote}"
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.4)`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Community CTA */}
        <div style={{ maxWidth: 1140, margin: '64px auto 0', padding: '28px 36px', background: SURF, borderRadius: 14, border: `1px solid ${RULE}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Join the community</div>
            <div style={{ fontSize: 14, color: MUTED }}>Connect with people building intentional lives. Share systems, get feedback, grow together.</div>
          </div>
          <a href="https://t.me/+MxfNsOTcN-Y5MmYx" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 14, fontWeight: 700, padding: '12px 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            Join on Telegram →
          </a>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">Your Entry Point</span>
          <h2 className="lp-h2">Start free.<br/>Earn the upgrade.</h2>
          <p className="lp-h2-sub">No friction to start. Upgrade when your system asks for more.</p>
          <div style={{ display: 'inline-flex', gap: 4, marginTop: 28, padding: 4, background: SURF2, border: `1px solid ${RULE}`, borderRadius: 999 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'monthly' ? BG : MUTED, background: billing === 'monthly' ? TEXT : 'transparent', transition: 'background .15s, color .15s' }}>Monthly</button>
            <button onClick={() => setBilling('annual')}  style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'annual'  ? BG : MUTED, background: billing === 'annual'  ? TEXT : 'transparent', transition: 'background .15s, color .15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Annual <span style={{ fontSize: 10, fontWeight: 700, background: ACCENT, color: BG, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>save 22%</span>
            </button>
          </div>
        </div>
        <div className="lp-pricing-grid">
          {content.pricing.map((p, i) => {
            const price = billing === 'annual' ? p.annual : p.monthly;
            const cadence = billing === 'annual' ? p.cadenceAnnual : p.cadenceMonthly;
            const cadenceLabel = cadence === 'forever' || cadence === 'one time' ? cadence : '/' + cadence.replace('per ', '');
            const isHighlight = p.highlight;
            return (
              <div key={i} className="lp-pricing-card" style={{ padding: '32px 28px', background: isHighlight ? ACCENT : SURF, color: isHighlight ? BG : TEXT, border: `1px solid ${isHighlight ? ACCENT : RULE}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                {isHighlight && <div style={{ position: 'absolute', top: -12, right: 24, background: TEXT, color: BG, fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</div>}
                <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>{price}</span>
                  <span style={{ fontSize: 14, opacity: 0.55 }}>{cadenceLabel}</span>
                </div>
                {billing === 'annual' && p.annualNote && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: isHighlight ? 'rgba(7,7,13,0.65)' : ACCENT, marginTop: -6 }}>{p.annualNote} · billed annually</div>
                )}
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0, minHeight: 40 }}>{p.blurb}</p>
                <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map((feat, j) => (
                    <li key={j} style={{ fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: isHighlight ? 'rgba(7,7,13,0.7)' : ACCENT }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <a href="/auth/register" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: isHighlight ? BG : SURF2, color: TEXT, fontSize: 14, fontWeight: 700, textAlign: 'center', border: `1px solid ${isHighlight ? BG : RULE}`, display: 'block', letterSpacing: '-0.01em' }}>{p.cta}</a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">Questions</span>
          <h2 className="lp-h2">Direct answers.</h2>
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', border: `1px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', background: SURF }}>
          {content.faq.map((item, i) => (
            <div key={i} className="lp-faq-item" style={{ borderBottom: i < content.faq.length - 1 ? `1px solid ${RULE}` : 'none' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '22px 26px', fontSize: 16, fontWeight: 600, lineHeight: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, color: TEXT, letterSpacing: '-0.01em', fontFamily: BODY }}>
                <span>{item.q}</span>
                <span style={{ fontSize: 22, color: ACCENT, transition: 'transform .2s', display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: '0 26px 22px', fontSize: 15, lineHeight: 1.62, color: MUTED }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="lp-section-alt">
        <div className="lp-about-grid">
          <div>
            <span className="lp-kicker">About</span>
            <h2 className="lp-h2" style={{ textAlign: 'left' }}>Built by someone who needed it.</h2>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(237,238,246,0.72)', margin: 0 }}>Cherut started when our founder spent a year hopping between Notion, Todoist, journals and spreadsheets — and realized the missing piece was not another tool, it was a system. We are a small team building the app we wanted to use: opinionated about method, relentless about execution.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: SURF2, border: `2px solid ${RULE}`, marginLeft: i > 0 ? -8 : 0, flexShrink: 0 }} />
              ))}
              <div style={{ fontSize: 14, color: MUTED, marginLeft: 8, fontWeight: 500 }}>+ a small, focused team</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final-cta" style={{ position: 'relative', padding: '120px 32px', textAlign: 'center', overflow: 'hidden', background: BG }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 50% at 50% 110%, ${ACCENT} 0%, transparent 65%)`, opacity: 0.09, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', zIndex: 1 }}>
          <h2 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(52px, 9vw, 108px)', lineHeight: 0.95, letterSpacing: '0.01em', fontWeight: 800, margin: '0 0 24px', color: TEXT }}>
            The clock is<br/>already running.
          </h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.55, maxWidth: 480, margin: '0 auto 40px' }}>Every hour without a system is a decision. Start free. No credit card. No excuses.</p>
          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              Start building <span>→</span>
            </a>
            <a href="/contact" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              Talk to the team
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: SURF, color: MUTED, padding: '64px 32px 32px', borderTop: `1px solid ${RULE}` }}>
        <div className="lp-footer-inner">
          <div className="lp-footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <CMark size={28} color={BG} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: TEXT }}>Cherut</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED, margin: '8px 0 0', lineHeight: 1.5, maxWidth: 280 }}>Cherut (חירות) — freedom in Hebrew. Not freedom from responsibility, freedom through it.</p>
          </div>
          {[
            { label: 'Product',   links: [['Features', '#features'], ['Pricing', '#pricing'], ['Changelog', '/changelog'], ['Roadmap', '/roadmap']] },
            { label: 'Company',   links: [['About', '/about'], ['Careers', '/careers'], ['Contact', '/contact']] },
            { label: 'Resources', links: [['Community', 'https://t.me/+MxfNsOTcN-Y5MmYx'], ['Help center', '/help-center'], ['Privacy', '/privacy-policy']] },
          ].map(col => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,246,0.28)', marginBottom: 4, fontWeight: 700 }}>{col.label}</div>
              {col.links.map(([text, href]) => (
                <a key={text} href={href} style={{ color: MUTED, transition: 'color .12s' }}
                   onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                   onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>{text}</a>
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

/* ── Sub-components ── */

function WelcomeCard() {
  return (
    <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translateX(-50%)', width: 320, background: PAPER, borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden', zIndex: 10 }}>
      <WelcomeCardInner />
    </div>
  );
}

function WelcomeCardStatic() {
  return (
    <div style={{ background: PAPER, borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <WelcomeCardInner />
    </div>
  );
}

function WelcomeCardInner() {
  return (
    <>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${APP_RULE}`, background: PAPER_2 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        </div>
      </div>
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Marina A.</div>
            <div style={{ fontSize: 11, color: APP_MUTED }}>Designer · São Paulo</div>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: INK }}>Welcome to your system ✨</div>
        <div style={{ fontSize: 13, color: APP_MUTED, lineHeight: 1.5 }}>Your habits, OKRs, dream board and journal — woven together, ready when you are.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <a href="/auth/register" style={{ background: BLUE, color: PAPER, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Start your day</a>
        </div>
      </div>
    </>
  );
}
