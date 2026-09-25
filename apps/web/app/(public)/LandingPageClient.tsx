'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { HeroAnimatedWord } from './HeroAnimatedWord';

// ── Dark landing page theme — same background as every other public page ──
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

const featureIcons = ['◆', '◐', '◯', '✦', '◇', '◈'];

interface FaqItem { q?: string; a?: string }
interface SystemItem { tag: string; title: string; body: string }
interface StepItem { n: string; title: string; body: string }
interface PrincipleItem { n: string; title: string; body: string }

export default function LandingPageClient() {
  useAdminRedirect();
  const t = useTranslations('landing');

  const [openFaq, setOpenFaq] = useState<number>(0);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  const animatedWords = t.raw('hero.animatedWords') as string[];
  const cycle = t.raw('problem.cycle') as string[];
  const voices = t.raw('problem.voices') as string[];
  const principles = t.raw('solution.principles') as PrincipleItem[];
  const systemItems = t.raw('features.items') as SystemItem[];
  const howSteps = t.raw('how.steps') as StepItem[];
  const benefitItems = t.raw('benefits.items') as string[];
  const faqItems = t.raw('faq.items') as FaqItem[];
  const saasFeatures = t.raw('pricing.plans.saas.features') as string[];
  const courseFeatures = t.raw('pricing.plans.course.features') as string[];
  const mentorshipFeatures = t.raw('pricing.plans.mentorship.features') as string[];

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: BODY, fontSize: 16, lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700&display=swap');
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
        .lp-feature-card { transition: transform .22s, border-color .22s; flex: 1 1 300px; max-width: 320px; }
        .lp-feature-card:hover { transform: translateY(-3px); border-color: ${ACCENT}; }
        .lp-faq-item { transition: background .15s; }
        .lp-faq-item:hover { background: ${SURF2}; }
        .lp-pricing-card { transition: transform .28s, box-shadow .28s; flex: 1 1 300px; max-width: 340px; }
        .lp-pricing-card:hover { transform: translateY(-4px); }
        .lp-principle-item { flex: 1 1 200px; max-width: 220px; }
        .lp-testimonial-card { flex: 1 1 260px; max-width: 300px; }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.10; }
          50%       { opacity: 0.18; }
        }
        .lp-hero-glow { animation: lp-glow-pulse 5s ease-in-out infinite; }
        @keyframes lp-cursor-blink-kf {
          0%, 45% { opacity: 1; }
          50%, 95% { opacity: 0; }
          100% { opacity: 1; }
        }
        .lp-hero-cursor-blink { animation: lp-cursor-blink-kf 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lp-hero-glow { animation: none; opacity: 0.14; }
          .lp-hero-cursor-blink { animation: none; opacity: 1; }
          .lp-loop-arc-path { animation: none; }
        }

        /* Kicker */
        .lp-kicker {
          display: inline-block; font-size: 11px; color: ${ACCENT};
          letter-spacing: .14em; text-transform: uppercase; font-weight: 700;
          margin-bottom: 20px; padding: 5px 13px; border-radius: 999px;
          border: 1px solid rgba(80,110,255,0.4); background: ${ACCENT_DIM};
        }

        /* Hero */
        .lp-hero-section { padding: 108px 32px 64px; position: relative; overflow: hidden; text-align: center; }
        .lp-hero-inner { position: relative; z-index: 1; max-width: 880px; margin: 0 auto; }
        .lp-hero-h1 {
          font-family: ${DISPLAY}; font-style: normal; text-transform: uppercase;
          font-size: clamp(40px, 7.4vw, 92px);
          line-height: 1.02; letter-spacing: 0.005em; font-weight: 800;
          margin: 0 0 28px; color: ${TEXT};
        }
        .lp-hero-sub { font-size: clamp(16px, 1.9vw, 19px); line-height: 1.65; color: ${MUTED}; max-width: 620px; margin: 0 auto 32px; }
        .lp-hero-ctas { display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }
        .lp-hero-micro { font-size: 13.5px; color: rgba(237,238,246,0.36); margin: 18px 0 0; }

        /* Sections — one consistent background across the whole page, same
           tone as every other public page. Alternate sections get a soft
           hairline instead of a hard color swap. */
        .lp-section      { padding: 120px 32px; background: ${BG}; }
        .lp-section-alt  { padding: 120px 32px; background: ${BG}; border-top: 1px solid ${RULE}; }
        .lp-section-head { max-width: 780px; margin: 0 auto 64px; text-align: center; }
        .lp-features-grid { max-width: 1160px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; }
        .lp-steps-grid    { max-width: 720px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 40px 48px; }
        .lp-steps-grid > *:nth-child(odd):last-child { grid-column: 1 / -1; max-width: 320px; }
        .lp-principles-grid { max-width: 960px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 36px; }
        .lp-pricing-grid  { max-width: 1080px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 14px; }
        .lp-voices-grid   { max-width: 980px; margin: 40px auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lp-benefits-grid { max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 18px 40px; }
        .lp-testimonial-grid { max-width: 1000px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }

        /* Problem cycle — mobile-first vertical timeline. Base (unprefixed)
           values are already correct at 320px; wider breakpoints only add
           breathing room, never restructure. */
        @keyframes lp-loop-flow { to { stroke-dashoffset: -24; } }
        .lp-loop-wrap      { max-width: 640px; margin: 0 auto; }
        .lp-loop-col       { position: relative; max-width: 480px; margin: 0 auto; padding-left: 30px; }
        .lp-loop-arc       { position: absolute; left: -6px; top: 4px; width: 24px; height: calc(100% - 8px); }
        .lp-loop-arc-path  { stroke-dasharray: 4 5; animation: lp-loop-flow 1.6s linear infinite; }
        .lp-loop-step      { display: grid; grid-template-columns: 32px 1fr; column-gap: 16px; position: relative; padding-bottom: 22px; }
        .lp-loop-step:last-child { padding-bottom: 0; }
        .lp-loop-left      { display: flex; flex-direction: column; align-items: center; }
        .lp-loop-num       {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: ${DISPLAY}; font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
          color: ${ACCENT}; background: ${ACCENT_DIM}; border: 1px solid rgba(80,110,255,0.4);
        }
        .lp-loop-num-repeat { background: ${ACCENT}; color: ${BG}; border-color: ${ACCENT}; }
        .lp-loop-line      { flex: 1; width: 1px; background: ${RULE}; margin: 6px 0 0; }
        .lp-loop-text      { margin: 0; padding-top: 5px; font-size: 16px; line-height: 1.5; color: ${MUTED}; }
        .lp-loop-text-last { color: ${TEXT}; font-weight: 600; }
        .lp-loop-caption   { max-width: 440px; margin: 28px auto 0; text-align: center; font-size: 14px; font-style: italic; color: ${MUTED}; }
        @media (min-width: 768px) {
          .lp-loop-col  { max-width: 560px; padding-left: 34px; }
          .lp-loop-arc  { width: 28px; left: -8px; }
          .lp-loop-num  { width: 36px; height: 36px; font-size: 14px; }
          .lp-loop-text { font-size: 16.5px; }
        }

        /* Section headings */
        .lp-h2 {
          font-family: ${DISPLAY}; font-style: normal; text-transform: uppercase;
          font-size: clamp(34px, 5.2vw, 60px); line-height: 1.02;
          letter-spacing: 0.01em; font-weight: 800; margin: 0; color: ${TEXT};
        }
        .lp-h2-sub { font-size: 18.5px; color: ${MUTED}; line-height: 1.6; margin: 22px auto 0; max-width: 580px; }

        /* ═══ Responsive ═══ */
        @media (max-width: 1023px) {
          .lp-section     { padding: 80px 24px; }
          .lp-section-alt { padding: 80px 24px; }
        }
        @media (max-width: 767px) {
          .lp-hero-section { padding: 72px 20px 56px; }
          .lp-hero-ctas { flex-direction: column; align-items: stretch; gap: 10px; }
          .lp-hero-ctas a { text-align: center; justify-content: center; }
          .lp-section     { padding: 64px 20px; }
          .lp-section-alt { padding: 64px 20px; }
          .lp-section-head { margin-bottom: 40px; }
          .lp-voices-grid   { grid-template-columns: 1fr; }
          .lp-feature-card, .lp-pricing-card, .lp-testimonial-card,
          .lp-principle-item { flex-basis: 100%; max-width: 460px; }
          .lp-steps-grid, .lp-benefits-grid { grid-template-columns: 1fr; max-width: 460px; }
          .lp-steps-grid > *:nth-child(odd):last-child { max-width: 100%; }
          .lp-final-cta { padding: 80px 20px !important; }
        }
        @media (max-width: 479px) {
          .lp-section      { padding: 56px 16px; }
          .lp-section-alt  { padding: 56px 16px; }
          .lp-final-cta    { padding: 64px 16px !important; }
          .lp-hero-h1      { font-size: 34px; }
          .lp-loop-col     { padding-left: 26px; }
          .lp-loop-arc     { left: -5px; width: 20px; }
          .lp-loop-num     { width: 28px; height: 28px; font-size: 12px; }
          .lp-loop-text    { font-size: 15px; }
        }
      `}</style>

      <PublicHeader variant="home" />

      {/* ── Hero ── */}
      <section className="lp-hero-section">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', pointerEvents: 'none' }} />
        <div className="lp-hero-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${ACCENT} 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div className="lp-hero-inner">
          <span className="lp-kicker">{t('hero.kicker')}</span>

          <h1 className="lp-hero-h1">
            {t('hero.headlinePrefix')} <HeroAnimatedWord color={ACCENT} words={animatedWords} />
          </h1>

          <p className="lp-hero-sub">{t('hero.sub')}</p>

          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              {t('hero.ctaStart')} <span>→</span>
            </a>
            <a href="#how" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              {t('hero.ctaSystem')}
            </a>
          </div>
          <p className="lp-hero-micro">{t('hero.microcopy')}</p>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('problem.kicker')}</span>
          <h2 className="lp-h2">{t('problem.heading')}</h2>
          <p className="lp-h2-sub">{t('problem.sub')}</p>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(237,238,246,0.34)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28, fontWeight: 700, textAlign: 'center' }}>{t('problem.cycleHeading')}</div>
        <div className="lp-loop-wrap">
          <div className="lp-loop-col">
            <svg className="lp-loop-arc" viewBox="0 0 24 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                className="lp-loop-arc-path"
                d="M 20 94 C 2 94, 2 6, 20 6"
                fill="none"
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.55}
              />
              <path
                d="M 15 11 L 20 5 L 25 11"
                fill="none"
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {cycle.map((step, i) => {
              const isLast = i === cycle.length - 1;
              return (
                <div key={i} className="lp-loop-step">
                  <div className="lp-loop-left">
                    <div className={isLast ? 'lp-loop-num lp-loop-num-repeat' : 'lp-loop-num'}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {!isLast && <div className="lp-loop-line" />}
                  </div>
                  <p className={isLast ? 'lp-loop-text lp-loop-text-last' : 'lp-loop-text'}>
                    {step}
                    {isLast && <RotateCcw size={13} strokeWidth={2.5} aria-hidden="true" style={{ marginLeft: 7, verticalAlign: '-2px', color: ACCENT }} />}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="lp-loop-caption">{t('problem.loopCaption')}</p>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(237,238,246,0.34)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 56, marginBottom: 4, fontWeight: 700, textAlign: 'center' }}>{t('problem.voicesHeading')}</div>
        <div className="lp-voices-grid">
          {voices.map((v, i) => (
            <div key={i} style={{ padding: '18px 22px', background: SURF, border: `1px solid ${RULE}`, borderRadius: 12 }}>
              <p style={{ fontSize: 16.5, lineHeight: 1.55, color: 'rgba(237,238,246,0.8)', margin: 0, fontStyle: 'italic' }}>&ldquo;{v}&rdquo;</p>
            </div>
          ))}
        </div>

        <p style={{ maxWidth: 660, margin: '48px auto 0', textAlign: 'center', fontSize: 16, color: MUTED, lineHeight: 1.6 }}>{t('problem.note')}</p>
      </section>

      {/* ── Solution / Method ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('solution.kicker')}</span>
          <h2 className="lp-h2">{t('solution.heading')}</h2>
          <p className="lp-h2-sub">{t('solution.body')}</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12.5, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('solution.methodLabel')}</div>
          <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: ACCENT, letterSpacing: '0.02em' }}>{t('solution.methodName')}</div>
        </div>

        <div className="lp-principles-grid">
          {principles.map((p, i) => (
            <div key={i} className="lp-principle-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: '0.1em' }}>{p.n}</div>
              <div style={{ height: 2, background: ACCENT, width: 32, borderRadius: 1, marginBottom: 4 }} />
              <h3 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 21, lineHeight: 1.1, fontWeight: 700, margin: 0, color: TEXT }}>{p.title}</h3>
              <p style={{ fontSize: 15.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        <p style={{ maxWidth: 580, margin: '48px auto 0', textAlign: 'center', fontSize: 16, color: MUTED, lineHeight: 1.6, fontStyle: 'italic' }}>{t('solution.note')}</p>
      </section>

      {/* ── System (modules) ── */}
      <section id="features" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('features.kicker')}</span>
          <h2 className="lp-h2">{t('features.heading1')}<br/>{t('features.heading2')}</h2>
          <p className="lp-h2-sub">{t('features.sub')}</p>
        </div>
        <div className="lp-features-grid">
          {systemItems.map((f, i) => (
            <div key={i} className="lp-feature-card" style={{ background: SURF, padding: '26px 28px', borderRadius: 14, border: `1px solid ${RULE}`, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 216 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, color: ACCENT }}>{featureIcons[i % featureIcons.length]}</span>
              </div>
              <span style={{ fontSize: 10, color: ACCENT, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>{f.tag}</span>
              <h3 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 20, lineHeight: 1.08, fontWeight: 700, margin: 0, color: TEXT }}>{f.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: MUTED, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
        <p style={{ maxWidth: 580, margin: '48px auto 0', textAlign: 'center', fontSize: 16.5, color: TEXT, fontWeight: 600, lineHeight: 1.5 }}>{t('features.banner')}</p>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('how.kicker')}</span>
          <h2 className="lp-h2">{t('how.heading1')}<br/>{t('how.heading2')}</h2>
          <p className="lp-h2-sub">{t('how.sub')}</p>
        </div>
        <div className="lp-steps-grid">
          {howSteps.map((s, i) => (
            <div key={i} className="lp-step-item" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: '0.1em' }}>{s.n}</div>
              <div style={{ height: 2, background: ACCENT, width: 32, borderRadius: 1, marginBottom: 6 }} />
              <h3 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 21, lineHeight: 1.08, fontWeight: 700, margin: 0, color: TEXT }}>{s.title}</h3>
              <p style={{ fontSize: 15.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <p style={{ maxWidth: 580, margin: '56px auto 0', textAlign: 'center', fontSize: 16, color: MUTED, lineHeight: 1.6, fontStyle: 'italic' }}>{t('how.note')}</p>
      </section>

      {/* ── Benefits / ROI ── */}
      <section className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('benefits.kicker')}</span>
          <h2 className="lp-h2">{t('benefits.heading')}</h2>
          <p className="lp-h2-sub">{t('benefits.sub')}</p>
        </div>
        <div className="lp-benefits-grid">
          {benefitItems.map((b, i) => (
            <div key={i} className="lp-benefit-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: ACCENT, fontWeight: 700, fontSize: 16, lineHeight: '1.6' }}>✓</span>
              <span style={{ fontSize: 16.5, color: 'rgba(237,238,246,0.8)', lineHeight: 1.55 }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 720, margin: '56px auto 0', padding: '28px 32px', background: SURF, border: `1px solid ${RULE}`, borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>{t('benefits.roiHeading')}</div>
          <p style={{ fontSize: 16.5, color: TEXT, lineHeight: 1.6, margin: '0 0 10px' }}>{t('benefits.roiFormula')}</p>
          <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>{t('benefits.roiDisclaimer')}</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('testimonials.kicker')}</span>
          <h2 className="lp-h2">{t('testimonials.heading1')}<br/>{t('testimonials.heading2')}</h2>
          <p className="lp-h2-sub">{t('testimonials.sub')}</p>
        </div>

        {/* Placeholder — no fabricated names, quotes or results. Swap these
            three cards for real, authorized testimonials as they come in. */}
        <div className="lp-testimonial-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="lp-testimonial-card" style={{ padding: '24px 22px', border: `1px dashed rgba(237,238,246,0.18)`, borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>{t('testimonials.placeholderLabel')}</div>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, margin: 0 }}>{t('testimonials.placeholderBody')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('pricing.kicker')}</span>
          <h2 className="lp-h2">{t('pricing.heading1')}<br/>{t('pricing.heading2')}</h2>
          <p className="lp-h2-sub">{t('pricing.sub')}</p>
          <div style={{ display: 'inline-flex', gap: 4, marginTop: 28, padding: 4, background: SURF2, border: `1px solid ${RULE}`, borderRadius: 999 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, color: billing === 'monthly' ? BG : MUTED, background: billing === 'monthly' ? TEXT : 'transparent', transition: 'background .15s, color .15s' }}>{t('pricing.monthly')}</button>
            <button onClick={() => setBilling('annual')}  style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, color: billing === 'annual'  ? BG : MUTED, background: billing === 'annual'  ? TEXT : 'transparent', transition: 'background .15s, color .15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t('pricing.annual')} <span style={{ fontSize: 10, fontWeight: 700, background: ACCENT, color: BG, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('pricing.saveBadge')}</span>
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(237,238,246,0.36)', marginTop: 14 }}>{t('pricing.toggleNote')}</p>
        </div>

        <div className="lp-pricing-grid">
          {/* Plan 1 — SaaS */}
          <div className="lp-pricing-card" style={{ padding: '32px 28px', background: SURF, color: TEXT, border: `1px solid ${RULE}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>{t('pricing.plans.saas.name')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>{billing === 'annual' ? t('pricing.plans.saas.priceAnnual') : t('pricing.plans.saas.priceMonthly')}</span>
              <span style={{ fontSize: 15, opacity: 0.55 }}>{billing === 'annual' ? t('pricing.plans.saas.cadenceAnnual') : t('pricing.plans.saas.cadenceMonthly')}</span>
            </div>
            {billing === 'annual' && <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginTop: -6 }}>{t('pricing.plans.saas.annualNote')}</div>}
            <p style={{ fontSize: 15.5, opacity: 0.7, margin: 0, minHeight: 40 }}>{t('pricing.plans.saas.blurb')}</p>
            <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {saasFeatures.map((feat, j) => (
                <li key={j} style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, color: ACCENT }}>✓</span> {feat}
                </li>
              ))}
            </ul>
            <a href="/auth/register" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: SURF2, color: TEXT, fontSize: 14.5, fontWeight: 700, textAlign: 'center', border: `1px solid ${RULE}`, display: 'block', letterSpacing: '-0.01em' }}>{t('pricing.plans.saas.cta')}</a>
          </div>

          {/* Plan 2 — SaaS + Course (most popular) */}
          <div className="lp-pricing-card" style={{ padding: '32px 28px', background: ACCENT, color: BG, border: `1px solid ${ACCENT}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, right: 24, background: TEXT, color: BG, fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('pricing.mostPopular')}</div>
            <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>{t('pricing.plans.course.name')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>{billing === 'annual' ? t('pricing.plans.course.priceAnnual') : t('pricing.plans.course.priceMonthly')}</span>
              <span style={{ fontSize: 15, opacity: 0.55 }}>{t('pricing.plans.course.cadence')}</span>
            </div>
            {billing === 'annual' && <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(7,7,13,0.65)', marginTop: -6 }}>{t('pricing.plans.course.priceNote')}</div>}
            <p style={{ fontSize: 15.5, opacity: 0.7, margin: 0, minHeight: 40 }}>{t('pricing.plans.course.blurb')}</p>
            <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {courseFeatures.map((feat, j) => (
                <li key={j} style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, color: 'rgba(7,7,13,0.7)' }}>✓</span> {feat}
                </li>
              ))}
            </ul>
            <a href="/auth/register" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: BG, color: TEXT, fontSize: 14.5, fontWeight: 700, textAlign: 'center', border: `1px solid ${BG}`, display: 'block', letterSpacing: '-0.01em' }}>{t('pricing.plans.course.cta')}</a>
          </div>

          {/* Plan 3 — Mentorship (apply, not checkout) */}
          <div className="lp-pricing-card" style={{ padding: '32px 28px', background: SURF, color: TEXT, border: `1px solid ${RULE}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>{t('pricing.plans.mentorship.name')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>{billing === 'annual' ? t('pricing.plans.mentorship.priceAnnual') : t('pricing.plans.mentorship.priceMonthly')}</span>
              <span style={{ fontSize: 15, opacity: 0.55 }}>{t('pricing.plans.mentorship.cadence')}</span>
            </div>
            <p style={{ fontSize: 15.5, opacity: 0.7, margin: 0, minHeight: 40 }}>{t('pricing.plans.mentorship.blurb')}</p>
            <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mentorshipFeatures.map((feat, j) => (
                <li key={j} style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, color: ACCENT }}>✓</span> {feat}
                </li>
              ))}
            </ul>
            <a href="/contact" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: SURF2, color: TEXT, fontSize: 14.5, fontWeight: 700, textAlign: 'center', border: `1px solid ${RULE}`, display: 'block', letterSpacing: '-0.01em' }}>{t('pricing.plans.mentorship.cta')}</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('faq.kicker')}</span>
          <h2 className="lp-h2">{t('faq.heading')}</h2>
        </div>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', border: `1px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', background: SURF }}>
          {faqItems.map((item, i) => (
            <div key={i} className="lp-faq-item" style={{ borderBottom: i < faqItems.length - 1 ? `1px solid ${RULE}` : 'none' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i} style={{ width: '100%', textAlign: 'left', padding: '22px 26px', fontSize: 17, fontWeight: 600, lineHeight: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, color: TEXT, letterSpacing: '-0.01em', fontFamily: BODY }}>
                <span>{item.q}</span>
                <span style={{ fontSize: 22, color: ACCENT, transition: 'transform .2s', display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: '0 26px 22px', fontSize: 16.5, lineHeight: 1.62, color: MUTED }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final-cta" style={{ position: 'relative', padding: '120px 32px', textAlign: 'center', overflow: 'hidden', background: BG }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 50% at 50% 110%, ${ACCENT} 0%, transparent 65%)`, opacity: 0.09, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', zIndex: 1 }}>
          <h2 style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(38px, 6.4vw, 72px)', lineHeight: 1.03, letterSpacing: '0.01em', fontWeight: 800, margin: '0 0 24px', color: TEXT }}>
            {t('finalCta.heading1')}<br/>{t('finalCta.heading2')}
          </h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.6, maxWidth: 580, margin: '0 auto 40px' }}>{t('finalCta.sub')}</p>
          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              {t('finalCta.ctaStart')} <span>→</span>
            </a>
            <a href="/contact" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              {t('finalCta.ctaTalk')}
            </a>
          </div>
          <p className="lp-hero-micro">{t('finalCta.microcopy')}</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
