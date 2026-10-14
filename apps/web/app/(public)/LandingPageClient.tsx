'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicDisclaimer } from '@/components/ui/PublicDisclaimer';
import CherutLogo from '@/components/ui/CherutLogo';
import { SHELL_TOKENS } from '@/components/shell/Shell';
import { SiteStyles, Wrap, Section, Reveal, FaqItem } from '@/components/shell/primitives';
import { AppMock, AppMockFrame, MockStyles, type AppMockKind } from '@/components/shell/AppMock';
import { geistSans, geistMono } from '@/lib/fonts';

const { ink, ink2, mute, paper, off, rule, ruleD, acc, accSoft, accLight, ease } = SHELL_TOKENS;

interface SystemTab { title: string; body: string; url: string; mock: AppMockKind }
interface FaqEntry { q: string; a: string }
interface PlanFeatureSet { title: string; tag?: string; monthly: [string, string, string]; annual: [string, string, string]; desc: string; features: string[]; cta: string; href: string }

// requestAnimationFrame-driven orbit, mirrors the prototype's 12s loop:
// rotates the dot continuously and highlights the node every 40deg (9
// nodes). Respects prefers-reduced-motion by freezing on the first node.
function useOrbit(periodMs: number, count: number) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(0);
      return;
    }
    let raf = 0;
    let last = -1;
    const step = (t: number) => {
      const angle = (t / periodMs * 360) % 360;
      if (orbitRef.current) orbitRef.current.style.transform = `rotate(${angle}deg)`;
      const k = Math.floor((angle + 360 / count / 2) / (360 / count)) % count;
      if (k !== last) { setActive(k); last = k; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [periodMs, count]);

  return { orbitRef, active };
}

export default function LandingPageClient() {
  useAdminRedirect();
  const t = useTranslations('landing');

  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState(0);

  const nodes = t.raw('pattern.nodes') as string[];
  const quotes = t.raw('pattern.quotes') as string[];
  const pillars = t.raw('method.pillars') as { title: string; body: string }[];
  const tabs = t.raw('system.tabs') as SystemTab[];
  const steps = t.raw('how.steps') as { title: string; body: string }[];
  const checks = t.raw('return.checks') as string[];
  const faq = t.raw('faq.items') as FaqEntry[];
  const plans = t.raw('pricing.plans') as PlanFeatureSet[];

  const { orbitRef, active } = useOrbit(12000, nodes.length);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: paper, color: ink, fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', fontSize: 16, lineHeight: 1.5 }}>
      <style>{`
        html { background: ${paper} !important; color-scheme: light !important; scroll-behavior: smooth; }
        body { margin: 0; overflow-x: hidden; background: ${paper} !important; color: ${ink} !important; }
        a { text-decoration: none; color: inherit; }
        a:hover { color: ${acc}; }

        .hero { position: relative; padding: 96px 0 0; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(${rule} 1px, transparent 1px), linear-gradient(90deg, ${rule} 1px, transparent 1px); background-size: 80px 80px; mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, #000 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, #000 30%, transparent 75%); pointer-events: none; }
        .hero-mark { position: absolute; right: -60px; top: 40px; width: 380px; height: 380px; pointer-events: none; filter: drop-shadow(0 40px 60px rgba(59,91,246,.28)); color: ${acc}; }
        .hero-top { position: relative; display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap: 56px; align-items: end; }
        .hero h1 { font-size: clamp(44px,6.6vw,88px); line-height: .98; letter-spacing: -.045em; font-weight: 600; text-wrap: balance; margin: 0; }
        .hero h1 em { font-style: normal; color: ${acc}; }
        .hero-side { display: flex; flex-direction: column; gap: 28px; padding-bottom: 8px; }
        .hero-line { font-size: 20px; line-height: 1.4; color: ${ink2}; margin: 0; }
        .hero-line b { font-weight: 600; color: ${ink}; display: block; }
        .ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .hero-note { font-size: 13px; color: ${mute}; }
        .shot-hero { position: relative; margin-top: 72px; }
        .showcase { position: relative; border-radius: 24px; padding: 64px 64px 0; background: radial-gradient(110% 80% at 50% 0%, #3E63F5 0%, #1B2E8F 48%, #0A0D1E 100%); overflow: hidden; isolation: isolate; }
        .showcase::before { content: ""; position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(#000, transparent 70%); -webkit-mask-image: linear-gradient(#000, transparent 70%); }
        .fc { position: absolute; z-index: 2; background: #fff; border-radius: 14px; padding: 14px 16px; box-shadow: 0 24px 60px -12px rgba(8,12,40,.45), 0 0 0 1px rgba(11,11,16,.06); font-size: 13px; display: flex; flex-direction: column; gap: 8px; min-width: 210px; animation: fc-float 7s ${ease} infinite alternate; }
        .fc .mono { font-size: 10.5px; color: ${mute}; }
        .fc b { font-size: 22px; font-weight: 600; letter-spacing: -.03em; }
        .fc-a { left: 18px; bottom: 64px; }
        .fc-b { right: 18px; top: 150px; animation-delay: -3s; }
        .fc-dots { display: flex; gap: 3px; }
        .fc-dots i { width: 10px; height: 10px; border-radius: 3px; background: #6F8BFF; display: block; }
        .fc-dots i.o { background: #EEF0F5; }
        .fc-kr { display: flex; align-items: center; gap: 10px; }
        .fc-kr span { flex: 1; height: 6px; border-radius: 3px; background: #EEF0F5; overflow: hidden; display: block; }
        .fc-kr span i { display: block; height: 100%; width: 62%; background: ${acc}; }
        @keyframes fc-float { to { transform: translateY(-10px); } }
        @media (prefers-reduced-motion: reduce) { .fc { animation: none; } }

        .dark { background: ${ink}; color: #fff; }
        .dark .mute { color: rgba(255,255,255,.62); }
        .loop { padding: 128px 0; }
        .loop-head { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(0,1fr); gap: 56px; align-items: end; margin-bottom: 88px; }
        .loop-head .lede { color: rgba(255,255,255,.62); }
        .ring { --s: min(520px,100vw - 64px); position: relative; width: var(--s); aspect-ratio: 1; margin: 0 auto; }
        .ring::before, .orbit { position: absolute; top: calc(var(--s)*.14); left: calc(var(--s)*.14); width: calc(var(--s)*.72); height: calc(var(--s)*.72); }
        .ring::before { content: ""; border: 3px solid rgba(255,255,255,.28); border-radius: 50%; }
        .orbit { border-radius: 50%; background: conic-gradient(from 0deg, transparent 0 62%, rgba(143,166,255,.15) 75%, ${accLight} 99.6%, transparent 0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px)); mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px)); }
        .orbit i { position: absolute; left: 50%; top: -4px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 5px rgba(143,166,255,.35), 0 0 24px 6px rgba(143,166,255,.7); display: block; }
        .ring-c svg { width: 44px; height: 44px; color: ${accLight}; margin-bottom: 6px; }
        .ring-c { position: absolute; top: 0; left: 0; width: var(--s); height: var(--s); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; padding: 22%; }
        .ring-c .mono { white-space: nowrap; }
        .ring-c b { font-size: clamp(22px,2.6vw,30px); font-weight: 600; letter-spacing: -.03em; line-height: 1.1; }
        .node { position: absolute; left: 50%; top: 50%; width: 130px; margin: -24px 0 0 -65px; text-align: center; }
        .tick { position: absolute; left: calc(var(--s)/2); top: calc(var(--s)/2); width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: ${ink}; border: 2px solid rgba(255,255,255,.45); transition: border-color .3s, background .3s; z-index: 1; }
        .tick.on { background: ${accLight}; border-color: #fff; }
        .node span { display: block; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: rgba(255,255,255,.45); margin-bottom: 4px; transition: color .3s; }
        .node p { transition: opacity .3s; opacity: .7; font-size: 14px; line-height: 1.3; color: #fff; text-wrap: balance; margin: 0; }
        .node.on span { color: ${accLight}; }
        .node.on p { opacity: 1; }
        .loop-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 64px; align-items: center; }
        .quotes { display: flex; flex-direction: column; gap: 0; border-top: 1px solid ${ruleD}; padding: 0; margin: 18px 0 0; }
        .quotes li { list-style: none; padding: 18px 0; border-bottom: 1px solid ${ruleD}; font-size: 19px; letter-spacing: -.01em; color: rgba(255,255,255,.88); }
        .loop-foot { margin-top: 28px; font-size: 18px; }
        .loop-foot b { color: #fff; font-weight: 600; }

        .method { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.25fr); gap: 72px; }
        .method-l { position: sticky; top: 112px; align-self: start; display: flex; flex-direction: column; gap: 24px; }
        .aiatt { display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 999px; background: ${accSoft}; color: ${acc}; font-weight: 600; font-size: 14px; width: max-content; }
        .pillars { border-top: 1px solid ${rule}; }
        .pillar { display: grid; grid-template-columns: 72px minmax(0,1fr); gap: 24px; padding: 36px 0; border-bottom: 1px solid ${rule}; }
        .pillar .n { font-family: var(--font-geist-mono), monospace; font-size: 13px; color: ${acc}; padding-top: 8px; }
        .pillar h3 { font-size: 28px; letter-spacing: -.025em; font-weight: 600; line-height: 1.15; margin: 0 0 10px; }
        .pillar p { color: ${mute}; font-size: 16px; max-width: 460px; margin: 0; }
        .method-note { margin-top: 28px; font-size: 15px; color: ${ink2}; }
        .method-note b { font-weight: 600; }

        .system { background: ${off}; border-top: 1px solid ${rule}; border-bottom: 1px solid ${rule}; }
        .sys-head { display: flex; justify-content: space-between; align-items: end; gap: 48px; margin-bottom: 56px; flex-wrap: wrap; }
        .sys { display: grid; grid-template-columns: 320px minmax(0,1fr); gap: 40px; align-items: start; }
        .tabs { display: flex; flex-direction: column; border-top: 1px solid ${rule}; }
        .tab { all: unset; cursor: pointer; display: block; padding: 18px 4px 18px 0; border-bottom: 1px solid ${rule}; transition: color .2s; }
        .tab .tt { display: flex; align-items: center; gap: 12px; font-size: 17px; font-weight: 600; letter-spacing: -.01em; color: ${mute}; transition: color .2s; }
        .tab .tt i { width: 8px; height: 8px; border-radius: 2px; background: ${rule}; transition: background .2s; display: block; }
        .tab .td { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s ${ease}; }
        .tab .td > div { overflow: hidden; }
        .tab .td p { padding: 10px 0 2px 20px; font-size: 15px; color: ${ink2}; line-height: 1.5; margin: 0; }
        .tab.active .tt { color: ${ink}; }
        .tab.active .tt i { background: ${acc}; }
        .tab.active .td { grid-template-rows: 1fr; }
        .stage { position: relative; padding: 32px; border-radius: 22px; background: radial-gradient(90% 90% at 100% 0%, #D3DEFF 0%, #E8EDFF 40%, #F3F2EF 100%); border: 1px solid ${rule}; }
        .sys-foot { margin-top: 48px; font-size: 15px; color: ${ink2}; }

        .how-head { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(0,1fr); gap: 56px; align-items: end; margin-bottom: 64px; }
        .steps { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); border-top: 1px solid ${rule}; border-left: 1px solid ${rule}; }
        .step { padding: 32px 28px 36px; border-right: 1px solid ${rule}; border-bottom: 1px solid ${rule}; display: flex; flex-direction: column; gap: 12px; min-height: 220px; transition: background .25s; }
        .step:hover { background: ${off}; }
        .step .n { font-family: var(--font-geist-mono), monospace; font-size: 12px; color: ${mute}; }
        .step h3 { font-size: 21px; letter-spacing: -.02em; font-weight: 600; line-height: 1.2; margin-top: auto; }
        .step p { color: ${mute}; font-size: 15px; margin: 0; }
        .step.first { background: ${ink}; color: #fff; }
        .step.first .n, .step.first p { color: rgba(255,255,255,.62); }

        .ret { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 72px; }
        .ret-checks { display: grid; grid-template-columns: 1fr; border-top: 1px solid ${rule}; margin-top: 40px; padding: 0; }
        .ret-checks div { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid ${rule}; font-size: 16px; }
        .ret-checks div::before { content: ""; flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 5px; background: ${acc} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/14px no-repeat; }
        .formula { background: ${ink}; color: #fff; border-radius: 18px; padding: 40px; display: flex; flex-direction: column; gap: 28px; align-self: start; position: sticky; top: 112px; }
        .eq { display: flex; flex-direction: column; gap: 6px; font-size: clamp(20px,2.2vw,26px); letter-spacing: -.02em; line-height: 1.25; }
        .eq span { display: flex; gap: 14px; align-items: baseline; }
        .eq .op { font-family: var(--font-geist-mono), monospace; color: ${accLight}; width: 18px; flex: none; }
        .eq .res { border-top: 1px solid ${ruleD}; padding-top: 16px; margin-top: 10px; font-weight: 600; }
        .formula small { color: rgba(255,255,255,.55); font-size: 13px; }

        .pricing { background: ${off}; border-top: 1px solid ${rule}; border-bottom: 1px solid ${rule}; }
        .pr-head { text-align: center; max-width: 720px; margin: 0 auto 56px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .plans { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; align-items: stretch; }
        .bill { display: inline-flex; padding: 4px; border-radius: 999px; background: #fff; border: 1px solid ${rule}; gap: 4px; }
        .bill button { all: unset; cursor: pointer; padding: 8px 18px; border-radius: 999px; font-size: 14px; font-weight: 500; color: ${mute}; display: inline-flex; gap: 8px; align-items: center; transition: background .2s, color .2s; }
        .bill button.active { background: ${ink}; color: #fff; }
        .bill button .save { font-family: var(--font-geist-mono), monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em; background: ${accSoft}; color: ${acc}; padding: 2px 8px; border-radius: 999px; }
        .bill-note { font-size: 13px; color: ${mute}; }

        .faq { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.6fr); gap: 72px; }
        .faq-l { position: sticky; top: 112px; align-self: start; display: flex; flex-direction: column; gap: 20px; }

        .final { position: relative; overflow: hidden; padding: 144px 0 128px; text-align: center; }
        .final h2 { font-size: clamp(44px,6vw,80px); line-height: 1; letter-spacing: -.045em; font-weight: 600; text-wrap: balance; margin: 0; color: #fff; }
        .final p.mute { max-width: 600px; margin: 28px auto 40px; font-size: 18px; line-height: 1.55; text-wrap: pretty; }
        .final .ctas { justify-content: center; }
        .final .disc { margin-top: 64px; font-size: 13px; color: rgba(255,255,255,.4); }

        @media (max-width: 960px) {
          .hero { padding-top: 64px; }
          .hero-top, .loop-head, .loop-grid, .method, .how-head, .ret, .faq { grid-template-columns: minmax(0,1fr); gap: 36px; }
          .hero-mark { width: 220px; height: 220px; right: -70px; top: -10px; opacity: .9; }
          .showcase { padding: 28px 20px 0; border-radius: 18px; }
          .fc { display: none; }
          .stage { padding: 16px; }
          .method-l, .formula, .faq-l { position: static; }
          .sys { grid-template-columns: minmax(0,1fr); }
          .steps, .plans { grid-template-columns: minmax(0,1fr); }
          .sec, .loop { padding: 88px 0; }
        }
        @media (max-width: 640px) {
          .ring { --s: min(340px,100vw - 40px); aspect-ratio: auto; padding-top: calc(var(--s) + 28px); display: flex; flex-direction: column; }
          .ring-c b { font-size: 22px; }
          .ring-c svg { width: 30px; height: 30px; }
          .node { position: static; transform: none !important; margin: 0; width: auto; text-align: left; display: flex; gap: 14px; align-items: baseline; padding: 12px 0; border-top: 1px solid ${ruleD}; }
          .node span { margin: 0; flex: none; width: 22px; }
          .hero-mark { opacity: .12; }
          .formula { padding: 28px; }
          .hero-line { font-size: 18px; }
          .pillar { grid-template-columns: 40px minmax(0,1fr); }
        }
      `}</style>
      <SiteStyles />
      <MockStyles />

      <PublicHeader variant="home" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-grid" />
        <CherutLogo className="hero-mark" viewBox="200 279 108 132" width={380} height={380} fillColor="currentColor" />
        <Wrap>
          <div className="hero-top">
            <div><h1>{t('hero.headlinePre')} <em>{t('hero.headlineAccent')}</em></h1></div>
            <div className="hero-side">
              <p className="hero-line"><span>{t('hero.obsessionLine')}</span> <b>{t('hero.structureLine')}</b></p>
              <div className="ctas">
                <Link href="/auth/register" className="btn btn-dark">{t('hero.ctaPrimary')} <span>→</span></Link>
                <Link href="#how" className="btn btn-line">{t('hero.ctaSecondary')}</Link>
              </div>
              <span className="hero-note">{t('hero.note')}</span>
            </div>
          </div>
          <Reveal style={{ marginTop: 0 }}>
            <div className="shot-hero">
              <div className="showcase">
                <div className="fc fc-a">
                  <span className="mono">{t('hero.mockCardA.label')}</span>
                  <b>{t('hero.mockCardA.value')}</b>
                  <div className="fc-dots">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i === 6 ? 'o' : ''} />)}</div>
                </div>
                <div className="fc fc-b">
                  <span className="mono">{t('hero.mockCardB.label')}</span>
                  <span style={{ fontWeight: 600 }}>{t('hero.mockCardB.value')}</span>
                  <div className="fc-kr"><span><i /></span><b style={{ fontSize: 14 }}>62%</b></div>
                </div>
                <AppMockFrame label="app.cherut / today" dark>
                  <AppMock kind="dashboard" />
                </AppMockFrame>
              </div>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* The pattern */}
      <section className="dark loop">
        <Wrap>
          <Reveal as="div" style={{ display: 'contents' }}>
            <div className="loop-head">
              <div><h2 className="h2" style={{ color: '#fff' }}>{t('pattern.heading')}</h2></div>
              <p className="lede">{t('pattern.lede')}</p>
            </div>
          </Reveal>
          <div className="loop-grid">
            <Reveal>
              <div className="ring">
                {nodes.map((text, i) => (
                  <div key={i} className={`node${active === i ? ' on' : ''}`} style={{ transform: `rotate(${i * 40}deg) translateY(calc(var(--s)*-.5)) rotate(${-i * 40}deg)` }}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <p>{text}</p>
                  </div>
                ))}
                <div className="orbit" ref={orbitRef}><i /></div>
                {nodes.map((_, i) => <span key={i} className={`tick${active === i ? ' on' : ''}`} style={{ transform: `rotate(${i * 40}deg) translateY(calc(var(--s)*-.36 + 1.5px))` }} />)}
                <div className="ring-c">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v4h-4" /></svg>
                  <span className="mono mute">{t('pattern.ringLabel')}</span>
                  <b>{t('pattern.ringSub')}</b>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <span className="mono mute">{t('pattern.quotesLabel')}</span>
                <ul className="quotes">
                  {quotes.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}
                </ul>
                <p className="loop-foot mute">{t('pattern.footPre')} <b>{t('pattern.footBold')}</b></p>
              </div>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {/* Method */}
      <Section id="method">
        <div className="method">
          <Reveal>
            <div className="method-l">
              <h2 className="h2">{t('method.heading')}</h2>
              <p className="lede">{t('method.lede')}</p>
              <span className="aiatt"><CherutLogo viewBox="200 279 108 132" width={14} height={14} fillColor={acc} />{t('method.badge')}</span>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <div className="pillars">
                {pillars.map((p, i) => (
                  <div className="pillar" key={p.title}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <div><h3>{p.title}</h3><p>{p.body}</p></div>
                  </div>
                ))}
              </div>
              <p className="method-note">{t('method.notePre')} <b>{t('method.noteBold')}</b></p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* One system */}
      <section id="features" className="sec system">
        <Wrap>
          <Reveal>
            <div className="sys-head">
              <div style={{ maxWidth: 640 }}><h2 className="h2">{t('system.heading')}</h2></div>
              <p className="lede">{t('system.lede')}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="sys">
              <div className="tabs" role="tablist">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.title}
                    role="tab"
                    aria-selected={activeTab === i}
                    className={`tab${activeTab === i ? ' active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    <span className="tt"><i />{tab.title}</span>
                    <span className="td"><div><p>{tab.body}</p></div></span>
                  </button>
                ))}
              </div>
              <div className="stage">
                <AppMockFrame label={tabs[activeTab]?.url ?? ''}>
                  <AppMock kind={tabs[activeTab]?.mock ?? 'okrs'} />
                </AppMockFrame>
              </div>
            </div>
          </Reveal>
          <p className="sys-foot">{t('system.foot')}</p>
        </Wrap>
      </section>

      {/* How it works */}
      <Section id="how">
        <Reveal>
          <div className="how-head">
            <div><h2 className="h2">{t('how.heading')}</h2></div>
            <p className="lede">{t('how.lede')}</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="steps">
            {steps.map((s, i) => (
              <div className={`step${i === 0 ? ' first' : ''}`} key={s.title}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* The return */}
      <Section padTop0>
        <div className="ret">
          <Reveal>
            <div>
              <h2 className="h2">{t('return.heading')}</h2>
              <ul className="ret-checks">
                {checks.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal>
            <div className="formula">
              <span className="mono" style={{ color: accLight }}>{t('return.formulaLabel')}</span>
              <div className="eq">
                <span><i className="op" />{t('return.formula.a')}</span>
                <span><i className="op">+</i>{t('return.formula.b')}</span>
                <span><i className="op">−</i>{t('return.formula.c')}</span>
                <span className="res"><i className="op">=</i>{t('return.formula.result')}</span>
              </div>
              <small>{t('return.formulaNote')}</small>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Pricing */}
      <section id="pricing" className="sec pricing">
        <Wrap>
          <Reveal>
            <div className="pr-head">
              <h2 className="h2">{t('pricing.heading')}</h2>
              <p className="lede">{t('pricing.lede')}</p>
              <div className="bill" role="group">
                <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>{t('pricing.billingMonthly')}</button>
                <button className={billing === 'annual' ? 'active' : ''} onClick={() => setBilling('annual')}>{t('pricing.billingAnnual')} <span className="save">{t('pricing.billingSaveTag')}</span></button>
              </div>
              <span className="bill-note">{t('pricing.billNote')}</span>
            </div>
          </Reveal>
          <Reveal>
            <div className="plans">
              {plans.map((plan, i) => {
                const [price, period, note] = billing === 'monthly' ? plan.monthly : plan.annual;
                const highlighted = i === 1;
                return (
                  <div className={`plan${highlighted ? ' hl' : ''}`} key={plan.title}>
                    {plan.tag && <span className="ptag tag acc" style={highlighted ? { background: acc, color: '#fff' } : undefined}>{plan.tag}</span>}
                    <h3>{plan.title}</h3>
                    <div className="price"><b>{price}</b><span>{period}</span></div>
                    <p className="per">{note}</p>
                    <p className="for">{plan.desc}</p>
                    <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
                    <Link href={plan.href} className={`btn ${highlighted ? 'btn-light' : 'btn-line'}`}>{plan.cta}</Link>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* FAQ */}
      <Section>
        <div className="faq">
          <Reveal>
            <div className="faq-l">
              <h2 className="h2">{t('faq.heading')}</h2>
              <p className="lede">{t('faq.lede')} <Link href="/contact" style={{ color: ink, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t('faq.contactLink')}</Link></p>
            </div>
          </Reveal>
          <Reveal>
            <div>
              {faq.map((item, i) => <FaqItem key={item.q} q={item.q} a={item.a} open={i === 0} />)}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="dark final">
        <Reveal>
          <Wrap>
            <CherutLogo viewBox="200 279 108 132" width={88} height={88} fillColor="#fff" style={{ margin: '0 auto 40px' }} />
            <h2>{t('finalCta.heading')}</h2>
            <p className="mute">{t('finalCta.body')}</p>
            <div className="ctas">
              <Link href="/auth/register" className="btn btn-light">{t('finalCta.ctaPrimary')} <span>→</span></Link>
              <Link href="/contact" className="btn btn-ghost-d">{t('finalCta.ctaSecondary')}</Link>
            </div>
            <p className="disc">{t('finalCta.disclaimer')}</p>
          </Wrap>
        </Reveal>
      </section>

      <PublicDisclaimer />
      <PublicFooter />
    </div>
  );
}
