'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { useState, useEffect } from 'react';

const BLUE = 'oklch(0.5 0.18 260)';
const BLUE_SOFT = 'oklch(0.94 0.04 260)';
const INK = '#0F0F1E';
const PAPER = '#FAFAF7';
const PAPER_2 = '#F5F5F2';
const MUTED = 'rgba(15,15,30,0.6)';
const RULE = 'rgba(15,15,30,0.1)';
const GRID = 'rgba(15,15,30,0.07)';

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

function CMark({ size = 32, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M 50 6 A 44 44 0 1 0 50 94 L 50 72 A 22 22 0 1 1 50 28 Z" fill={color} />
    </svg>
  );
}

const tabs = [
  { label: 'Today',       sub: 'Your day at a glance',     icon: '◐' },
  { label: 'Habits',      sub: 'Streaks that compound',    icon: '◇' },
  { label: 'OKRs',        sub: 'Goals with method',        icon: '◯' },
  { label: 'Dream Board', sub: 'Pin the future you want',  icon: '✦' },
  { label: 'Journal',     sub: 'Think clearly, daily',     icon: '◈' },
  { label: 'Finances',    sub: 'Money on the same page',   icon: '□' },
];

const featureIcons = ['◆', '◐', '◯', '✦', '◇', '◈', '□', '◉'];

export default function Home() {
  useAdminRedirect();

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: '"Inter", -apple-system, system-ui, sans-serif', fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        a { text-decoration: none; color: inherit; }
        a:hover { opacity: 0.7; transition: opacity .15s; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        ul, ol { margin: 0; padding: 0; list-style: none; }
        figure { margin: 0; }

        .lp-nav-cta-dark { transition: opacity .15s, transform .1s; }
        .lp-nav-cta-dark:hover { opacity: 0.85; transform: translateY(-1px); }
        .lp-cta-outline { transition: background .15s, border-color .15s; }
        .lp-cta-outline:hover { background: ${INK}; color: ${PAPER}; border-color: ${INK}; }
        .lp-tab { transition: opacity .15s; }
        .lp-tab:hover { opacity: 1 !important; }
        .lp-feature-card { transition: transform .25s, border-color .25s; }
        .lp-feature-card:hover { transform: translateY(-3px); border-color: ${BLUE}; }
        .lp-faq-item { transition: background .15s; }
        .lp-faq-item:hover { background: ${PAPER_2}; }
        .lp-pricing-card { transition: transform .3s, box-shadow .3s; }
        .lp-pricing-card:hover { transform: translateY(-4px); }

        @keyframes lp-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        .lp-shape { animation: lp-float 8s ease-in-out infinite; }
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
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <CMark size={28} color={PAPER} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>Cherut</span>
          </a>
          <div style={{ display: 'flex', gap: 28, marginLeft: 24, fontSize: 14, fontWeight: 500, color: 'rgba(15,15,30,0.78)' }}>
            <a href="#features">Features <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span></a>
            <a href="#how">Method</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">Resources <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span></a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <a href="/auth/login" style={{ fontSize: 14, color: 'rgba(15,15,30,0.7)', fontWeight: 500, padding: '8px 12px' }}>Login</a>
            <a href="/auth/register" className="lp-cta-outline" style={{ fontSize: 14, fontWeight: 500, padding: '9px 18px', border: `1px solid ${RULE}`, borderRadius: 999, background: PAPER, color: INK }}>
              Watch tour
            </a>
            <a href="/auth/register" className="lp-nav-cta-dark" style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', background: INK, color: PAPER, borderRadius: 999 }}>
              Try for free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', padding: '80px 32px 100px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 80%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32, alignItems: 'center', minHeight: 420 }}>
          <div className="lp-shape" style={{ width: 320, height: 360, filter: 'drop-shadow(0 30px 50px rgba(60,50,200,0.35))' }}>
            <CMark size={320} color={BLUE} />
          </div>
          <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 24 }}>
            <h1 style={{ fontSize: 'clamp(40px, 5.6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 700, margin: '0 0 24px', color: INK }}>
              <span style={{ whiteSpace: 'nowrap' }}>Silence the noise.</span><br />
              <span style={{ whiteSpace: 'nowrap' }}>Make your dreams real</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: MUTED, maxWidth: 540, margin: '0 auto 36px' }}>
              You know what you want. Cherut gives you the system to get there — habits, OKRs, calendar and journal in one quiet place.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/register" className="lp-nav-cta-dark" style={{ background: INK, color: PAPER, fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                Try for free <span>→</span>
              </a>
              <a href="#how" className="lp-cta-outline" style={{ fontSize: 15, fontWeight: 500, padding: '13px 26px', border: `1px solid ${RULE}`, borderRadius: 999, background: PAPER, color: INK }}>
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard mockup ── */}
      <section style={{ padding: '0 32px 100px', background: `linear-gradient(180deg, ${PAPER} 0%, ${PAPER_2} 100%)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: PAPER, padding: '8px 8px 0', borderRadius: '16px 16px 0 0', border: `1px solid ${RULE}`, borderBottom: 'none' }}>
            {tabs.map((t, i) => (
              <button key={i} className="lp-tab" onClick={() => setActiveTab(i)} style={{ padding: '16px 12px 18px', textAlign: 'center', borderRadius: 10, background: 'transparent', color: INK, opacity: activeTab === i ? 1 : 0.55, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', borderBottom: activeTab === i ? `2px solid ${BLUE}` : '2px solid transparent', transition: 'opacity .15s, border-color .2s' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: activeTab === i ? BLUE : BLUE_SOFT, color: activeTab === i ? PAPER : BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{t.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', background: '#E9E8E4', border: `1px solid ${RULE}`, borderTop: 'none', borderRadius: '0 0 16px 16px', minHeight: 480, display: 'grid', gridTemplateColumns: '180px 1fr', overflow: 'hidden' }}>
            <div style={{ background: '#DEDDD8', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid rgba(15,15,30,0.06)' }}>
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
            <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translateX(-50%)', width: 320, background: PAPER, borderRadius: 14, boxShadow: '0 24px 60px rgba(15,15,30,0.18), 0 0 0 1px rgba(15,15,30,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${RULE}`, background: PAPER_2 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
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
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 100px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>Plays well with the tools you already use</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px 40px', alignItems: 'center' }}>
          {['Google Calendar', 'Notion', 'Apple Health', 'Outlook', 'Slack', 'Todoist'].map((t, i) => (
            <span key={i} style={{ fontSize: 15, fontWeight: 600, color: 'rgba(15,15,30,0.4)', letterSpacing: '-0.01em' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>Features</span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0 }}>Everything you carry, in one quiet place.</h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.5, margin: '20px auto 0', maxWidth: 580 }}>Eight modules. One method. Turn each on as you grow into it.</p>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
      <section id="how" style={{ padding: '120px 32px', background: PAPER_2 }}>
        <div style={{ maxWidth: 760, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>How it works</span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0 }}>A method, not just an app.</h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.5, margin: '20px auto 0', maxWidth: 580 }}>From values to dreams to weekly action — Cherut walks the path with you.</p>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
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
      <section style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>Loved by builders of intentional lives</span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0 }}>What our community is saying.</h2>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {content.testimonials.map((t, i) => (
            <figure key={i} style={{ padding: '28px', background: PAPER, borderRadius: 16, border: `1px solid ${RULE}`, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: BLUE, fontSize: 14, letterSpacing: '0.1em' }}>★★★★★</div>
              <blockquote style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 500, margin: 0, letterSpacing: '-0.005em', color: 'rgba(15,15,30,0.85)' }}>"{t.quote}"</blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>{t.name.charAt(0)}</div>
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
      <section id="pricing" style={{ padding: '120px 32px', background: PAPER_2 }}>
        <div style={{ maxWidth: 760, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>Pricing</span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0 }}>Honest pricing, no surprises.</h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.5, margin: '20px auto 0', maxWidth: 580 }}>Start free. Upgrade when your system asks for more.</p>
          <div style={{ display: 'inline-flex', gap: 4, marginTop: 28, padding: 4, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 999 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'monthly' ? PAPER : 'rgba(15,15,30,0.65)', background: billing === 'monthly' ? INK : 'transparent', transition: 'background .15s, color .15s' }}>Monthly</button>
            <button onClick={() => setBilling('annual')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'annual' ? PAPER : 'rgba(15,15,30,0.65)', background: billing === 'annual' ? INK : 'transparent', transition: 'background .15s, color .15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Annual <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', background: BLUE, color: PAPER, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>save 22%</span>
            </button>
          </div>
        </div>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
          {content.pricing.map((p, i) => {
            const price = billing === 'annual' ? p.annual : p.monthly;
            const cadence = billing === 'annual' ? p.cadenceAnnual : p.cadenceMonthly;
            const cadenceLabel = cadence === 'forever' || cadence === 'one time' ? cadence : '/' + cadence.replace('per ', '').replace(', billed annually', '');
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
      <section style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto 64px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0 }}>Questions, answered.</h2>
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
      <section id="about" style={{ padding: '120px 32px', background: PAPER_2 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <span style={{ display: 'inline-block', fontSize: 12, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: BLUE_SOFT }}>About</span>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: 0, textAlign: 'left' }}>Built by people who needed it themselves</h2>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(15,15,30,0.8)', margin: 0 }}>Cherut started when our founder spent a year hopping between Notion, Todoist, journals and spreadsheets — and realized the missing piece was not another tool, it was a system. We are a small team building the app we wanted to use: opinionated about method, gentle about how you get there.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: BLUE_SOFT, border: `2px solid ${PAPER_2}`, marginLeft: i > 0 ? -8 : 0 }} />
              ))}
              <div style={{ fontSize: 14, color: MUTED, marginLeft: 8, fontWeight: 500 }}>+ a small, focused team</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', padding: '120px 32px', textAlign: 'center', overflow: 'hidden', background: PAPER }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`, backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 22px' }}>Your dreams are waiting.</h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.5, maxWidth: 520, margin: '0 auto 36px' }}>Start with the free plan. Bring your noise. We will help you turn it down.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/register" className="lp-nav-cta-dark" style={{ background: INK, color: PAPER, fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, paddingBottom: 48, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <CMark size={28} color={PAPER} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: INK }}>Cherut</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED, margin: '8px 0 0', lineHeight: 1.5, maxWidth: 280 }}>Cherut (חירות) — freedom in Hebrew. Not freedom from responsibility, freedom through it.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,15,30,0.55)', marginBottom: 4, fontWeight: 600 }}>Product</div>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Changelog</a>
            <a href="#">Roadmap</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,15,30,0.55)', marginBottom: 4, fontWeight: 600 }}>Company</div>
            <a href="#about">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,15,30,0.55)', marginBottom: 4, fontWeight: 600 }}>Resources</div>
            <a href="#">Community</a>
            <a href="#">Help center</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'rgba(15,15,30,0.5)' }}>
          <span>© 2026 Cherut. Built with intention.</span>
          <span>Made for the dreamers who do.</span>
        </div>
      </footer>
    </div>
  );
}
