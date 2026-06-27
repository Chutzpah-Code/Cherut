'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BG     = '#07070D';
const SURF2  = '#161628';
const TEXT   = '#EDEEF6';
const MUTED  = 'rgba(237,238,246,0.46)';
const ACCENT = 'oklch(0.68 0.24 260)';
const RULE   = 'rgba(255,255,255,0.08)';
const GRID   = 'rgba(255,255,255,0.04)';

export default function NotFound() {
  const pathname = usePathname();

  const sanitizedPath = pathname
    ?.replace(/[<>"/\\&]/g, '')
    ?.replace(/%3C/gi, '')
    ?.replace(/%3E/gi, '')
    ?.replace(/%22/gi, '')
    ?.replace(/%27/gi, '')
    ?.slice(0, 100) || '/unknown';

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .nf-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; background: ${TEXT}; color: ${BG}; font-size: 15px; font-weight: 700; font-family: inherit; border: none; border-radius: 999px; cursor: pointer; text-decoration: none; transition: opacity .15s; }
        .nf-btn-primary:hover { opacity: .85; }
        .nf-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; background: transparent; color: ${TEXT}; font-size: 15px; font-weight: 600; font-family: inherit; border: 1px solid ${RULE}; border-radius: 999px; cursor: pointer; text-decoration: none; transition: background .15s; }
        .nf-btn-ghost:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: '90px 90px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 35%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, maxWidth: 480, width: '100%' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 'clamp(80px, 20vw, 128px)', fontWeight: 800, lineHeight: 1, color: TEXT, letterSpacing: '-0.02em' }}>404</span>
          <div style={{ width: 48, height: 2, background: ACCENT, borderRadius: 2 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '0.01em', lineHeight: 1 }}>
            Page not found
          </h1>
          <p style={{ fontSize: 16, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {sanitizedPath !== '/unknown' && (
          <div style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 10, padding: '10px 16px' }}>
            <code style={{ fontSize: 13, color: MUTED, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {sanitizedPath}
            </code>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" className="nf-btn-primary">← Go home</a>
          <button onClick={() => window.history.back()} className="nf-btn-ghost">Go back</button>
        </div>

        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Need help?{' '}
          <a href="mailto:support@cherut.com" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>Contact support</a>
        </p>
      </div>
    </div>
  );
}
