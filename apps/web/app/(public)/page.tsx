'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PublicHeader } from '@/components/ui/Header';
import { PublicFooter } from '@/components/ui/PublicFooter';

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

const featureIcons = ['◆', '◐', '◯', '✦', '◇', '◈', '□', '◉'];
const pricingData = [
  { id: 'free', monthly: '$0', annual: '$0', kind: 'forever' as const, highlight: false },
  { id: 'pro', monthly: '$9', annual: '$7', kind: 'month' as const, highlight: true },
  { id: 'lifetime', monthly: '$249', annual: '$249', kind: 'onetime' as const, highlight: false },
];

interface TranslatedText {
  q?: string;
  a?: string;
}

export default function Home() {
  useAdminRedirect();
  const t = useTranslations('landing');

  const [openFaq, setOpenFaq]     = useState<number>(0);
  const [billing, setBilling]     = useState<'monthly' | 'annual'>('annual');

  const featureItems = t.raw('features.items') as { tag: string; title: string; body: string }[];
  const howSteps = t.raw('how.steps') as { n: string; title: string; body: string }[];
  const testimonialItems = t.raw('testimonials.items') as { quote: string; name: string; role: string }[];
  const faqItems = t.raw('faq.items') as TranslatedText[];

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
        .lp-feature-card { transition: transform .22s, border-color .22s; }
        .lp-feature-card:hover { transform: translateY(-3px); border-color: ${ACCENT}; }
        .lp-faq-item { transition: background .15s; }
        .lp-faq-item:hover { background: ${SURF2}; }
        .lp-pricing-card { transition: transform .28s, box-shadow .28s; }
        .lp-pricing-card:hover { transform: translateY(-4px); }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.10; }
          50%       { opacity: 0.18; }
        }
        .lp-hero-glow { animation: lp-glow-pulse 5s ease-in-out infinite; }

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

        /* ═══ Responsive ═══ */
        @media (max-width: 1023px) {
          .lp-section     { padding: 80px 24px; }
          .lp-section-alt { padding: 80px 24px; }
          .lp-strip       { padding: 0 24px 80px; }
          .lp-about-grid  { gap: 40px; }
        }
        @media (max-width: 767px) {
          .lp-hero-section { padding: 72px 20px 64px; }
          .lp-hero-sub  { margin-bottom: 28px; }
          .lp-hero-ctas { flex-direction: column; align-items: stretch; gap: 10px; }
          .lp-hero-ctas a { text-align: center; justify-content: center; }
          .lp-section     { padding: 64px 20px; }
          .lp-section-alt { padding: 64px 20px; }
          .lp-section-head { margin-bottom: 40px; }
          .lp-strip       { padding: 0 20px 64px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-steps-grid    { grid-template-columns: 1fr 1fr; gap: 24px; }
          .lp-pricing-grid  { grid-template-columns: 1fr; }
          .lp-about-grid    { grid-template-columns: 1fr; gap: 32px; }
          .lp-t-two-col     { grid-template-columns: 1fr; gap: 48px; }
          .lp-final-cta { padding: 80px 20px !important; }
        }
        @media (max-width: 479px) {
          .lp-steps-grid   { grid-template-columns: 1fr; }
          .lp-section      { padding: 56px 16px; }
          .lp-section-alt  { padding: 56px 16px; }
          .lp-strip        { padding: 0 16px 56px; }
          .lp-final-cta    { padding: 64px 16px !important; }
        }
      `}</style>

      <PublicHeader variant="home" />

      {/* ── Hero ── */}
      <section className="lp-hero-section">
        {/* Dark grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 80%)', pointerEvents: 'none' }} />
        {/* Accent glow — pulsing */}
        <div className="lp-hero-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${ACCENT} 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="lp-kicker">{t('kicker')}</span>

          <h1 className="lp-hero-h1">
            {t('hero.line1')}<br />
            {t('hero.line2')}<br />
            {t('hero.line3')} <em>{t('hero.emphasis')}</em>
          </h1>

          <p className="lp-hero-sub">
            {t('hero.subBefore')} <strong style={{ color: TEXT, fontWeight: 700 }}>{t('hero.subBold')}</strong>.
          </p>

          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              {t('hero.ctaStart')} <span>→</span>
            </a>
            <a href="#how" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              {t('hero.ctaSystem')}
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="lp-strip">
        <div style={{ fontSize: 11, color: 'rgba(237,238,246,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>{t('trust.heading')}</div>
        <div className="lp-strip-logos">
          {['Google Calendar', 'Notion', 'Apple Health', 'Outlook', 'Slack', 'Todoist'].map((tool, i) => (
            <span key={i} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(237,238,246,0.22)', letterSpacing: '-0.01em' }}>{tool}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('features.kicker')}</span>
          <h2 className="lp-h2">{t('features.heading1')}<br/>{t('features.heading2')}</h2>
          <p className="lp-h2-sub">{t('features.sub')}</p>
        </div>
        <div className="lp-features-grid">
          {featureItems.map((f, i) => (
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
          <span className="lp-kicker">{t('how.kicker')}</span>
          <h2 className="lp-h2">{t('how.heading1')}<br/>{t('how.heading2')}</h2>
          <p className="lp-h2-sub">{t('how.sub')}</p>
        </div>
        <div className="lp-steps-grid">
          {howSteps.map((s, i) => (
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
          <span className="lp-kicker">{t('testimonials.kicker')}</span>
          <h2 className="lp-h2">{t('testimonials.heading1')}<br/>{t('testimonials.heading2')}</h2>
        </div>

        {/* Featured quote */}
        <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 64, marginBottom: 64, borderBottom: `1px solid ${RULE}`, textAlign: 'center' }}>
          <blockquote style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1.15, fontWeight: 700, color: TEXT, margin: '0 auto 28px', maxWidth: 860, letterSpacing: '0.01em' }}>
            "{testimonialItems[0].quote}"
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.4)`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{testimonialItems[0].name.charAt(0)}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{testimonialItems[0].name}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{testimonialItems[0].role}</div>
            </div>
          </div>
        </div>

        {/* Two smaller quotes */}
        <div className="lp-t-two-col" style={{ maxWidth: 1140, margin: '0 auto' }}>
          {testimonialItems.slice(1).map((tItem, i) => (
            <figure key={i} style={{ padding: i === 0 ? '0 56px 0 0' : '0 0 0 56px', borderRight: i === 0 ? `1px solid ${RULE}` : 'none', margin: 0 }}>
              <blockquote style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontWeight: 600, fontSize: 'clamp(17px, 2.2vw, 26px)', lineHeight: 1.22, color: `rgba(237,238,246,0.78)`, margin: '0 0 22px', letterSpacing: '0.005em' }}>
                "{tItem.quote}"
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACCENT_DIM, border: `1px solid rgba(80,110,255,0.4)`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{tItem.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{tItem.name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{tItem.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Community CTA */}
        <div style={{ maxWidth: 1140, margin: '64px auto 0', padding: '28px 36px', background: SURF, borderRadius: 14, border: `1px solid ${RULE}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{t('testimonials.joinTitle')}</div>
            <div style={{ fontSize: 14, color: MUTED }}>{t('testimonials.joinBody')}</div>
          </div>
          <a href="https://t.me/+MxfNsOTcN-Y5MmYx" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 14, fontWeight: 700, padding: '12px 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {t('testimonials.joinCta')} →
          </a>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section-alt">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('pricing.kicker')}</span>
          <h2 className="lp-h2">{t('pricing.heading1')}<br/>{t('pricing.heading2')}</h2>
          <p className="lp-h2-sub">{t('pricing.sub')}</p>
          <div style={{ display: 'inline-flex', gap: 4, marginTop: 28, padding: 4, background: SURF2, border: `1px solid ${RULE}`, borderRadius: 999 }}>
            <button onClick={() => setBilling('monthly')} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'monthly' ? BG : MUTED, background: billing === 'monthly' ? TEXT : 'transparent', transition: 'background .15s, color .15s' }}>{t('pricing.monthly')}</button>
            <button onClick={() => setBilling('annual')}  style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: billing === 'annual'  ? BG : MUTED, background: billing === 'annual'  ? TEXT : 'transparent', transition: 'background .15s, color .15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t('pricing.annual')} <span style={{ fontSize: 10, fontWeight: 700, background: ACCENT, color: BG, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('pricing.saveBadge')}</span>
            </button>
          </div>
        </div>
        <div className="lp-pricing-grid">
          {pricingData.map((p, i) => {
            const price = billing === 'annual' ? p.annual : p.monthly;
            const cadenceLabel = p.kind === 'forever' ? t('pricing.cadenceForever')
              : p.kind === 'onetime' ? t('pricing.cadenceOnetime')
              : '/' + t('pricing.cadenceMonth');
            const isHighlight = p.highlight;
            const name = t(`pricing.plans.${p.id}.name`);
            const blurb = t(`pricing.plans.${p.id}.blurb`);
            const features = t.raw(`pricing.plans.${p.id}.features`) as string[];
            const cta = t(`pricing.plans.${p.id}.cta`);
            const annualNote = p.id === 'pro' ? t('pricing.saveBadge') : null;
            return (
              <div key={i} className="lp-pricing-card" style={{ padding: '32px 28px', background: isHighlight ? ACCENT : SURF, color: isHighlight ? BG : TEXT, border: `1px solid ${isHighlight ? ACCENT : RULE}`, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                {isHighlight && <div style={{ position: 'absolute', top: -12, right: 24, background: TEXT, color: BG, fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('pricing.mostPopular')}</div>}
                <div style={{ fontFamily: DISPLAY, textTransform: 'uppercase', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 52, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>{price}</span>
                  <span style={{ fontSize: 14, opacity: 0.55 }}>{cadenceLabel}</span>
                </div>
                {billing === 'annual' && annualNote && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: isHighlight ? 'rgba(7,7,13,0.65)' : ACCENT, marginTop: -6 }}>{annualNote} · {t('pricing.billedAnnually')}</div>
                )}
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0, minHeight: 40 }}>{blurb}</p>
                <div style={{ height: 1, background: 'currentColor', opacity: 0.1, margin: '4px 0' }} />
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {features.map((feat, j) => (
                    <li key={j} style={{ fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: isHighlight ? 'rgba(7,7,13,0.7)' : ACCENT }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <a href="/auth/register" style={{ marginTop: 'auto', padding: '13px 24px', borderRadius: 999, background: isHighlight ? BG : SURF2, color: TEXT, fontSize: 14, fontWeight: 700, textAlign: 'center', border: `1px solid ${isHighlight ? BG : RULE}`, display: 'block', letterSpacing: '-0.01em' }}>{cta}</a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-kicker">{t('faq.kicker')}</span>
          <h2 className="lp-h2">{t('faq.heading')}</h2>
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', border: `1px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', background: SURF }}>
          {faqItems.map((item, i) => (
            <div key={i} className="lp-faq-item" style={{ borderBottom: i < faqItems.length - 1 ? `1px solid ${RULE}` : 'none' }}>
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
            <span className="lp-kicker">{t('about.kicker')}</span>
            <h2 className="lp-h2" style={{ textAlign: 'left' }}>{t('about.heading')}</h2>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'rgba(237,238,246,0.72)', margin: 0 }}>{t('about.body')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: SURF2, border: `2px solid ${RULE}`, marginLeft: i > 0 ? -8 : 0, flexShrink: 0 }} />
              ))}
              <div style={{ fontSize: 14, color: MUTED, marginLeft: 8, fontWeight: 500 }}>{t('about.teamNote')}</div>
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
            {t('finalCta.heading1')}<br/>{t('finalCta.heading2')}
          </h2>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.55, maxWidth: 480, margin: '0 auto 40px' }}>{t('finalCta.sub')}</p>
          <div className="lp-hero-ctas">
            <a href="/auth/register" className="lp-cta-primary" style={{ background: TEXT, color: BG, fontSize: 15, fontWeight: 700, padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}>
              {t('finalCta.ctaStart')} <span>→</span>
            </a>
            <a href="/contact" className="lp-cta-ghost" style={{ fontSize: 15, fontWeight: 500, padding: '13px 28px', border: `1px solid ${RULE}`, borderRadius: 999, background: 'transparent', color: TEXT }}>
              {t('finalCta.ctaTalk')}
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
