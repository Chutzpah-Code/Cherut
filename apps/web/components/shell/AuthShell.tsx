'use client';

import Link from 'next/link';
import CherutLogo from '@/components/ui/CherutLogo';
import { SHELL_TOKENS } from './Shell';
import { SiteStyles } from './primitives';
import { AppMock, AppMockFrame, MockStyles } from './AppMock';
import { geistSans, geistMono } from '@/lib/fonts';

const { ink, ink2, mute, paper, off, rule, acc, accSoft } = SHELL_TOKENS;

interface AuthShellProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  quote?: string;
  quoteNote?: string;
}

// Shared shell for /auth/login, /auth/register and /auth/reset-password —
// only the JSX/styling lives here, no auth logic (that stays in each page).
export function AuthShell({ children, footer, quote, quoteNote }: AuthShellProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', minHeight: '100vh', background: paper }}>
      <style>{`
        html { background: ${paper} !important; color-scheme: light !important; }
        body { margin: 0; background: ${paper} !important; color: ${ink} !important; }
        a { text-decoration: none; color: inherit; }
        a:hover { color: ${acc}; }

        .au { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); min-height: 100vh; }
        .au-l { display: flex; flex-direction: column; padding: 28px 48px; }
        .au-top { display: flex; justify-content: space-between; align-items: center; }
        .au-top .back { font-size: 14px; color: ${mute}; }
        .au-form-wrap { width: 100%; max-width: 400px; margin: auto; display: flex; flex-direction: column; gap: 18px; padding: 48px 0; }
        .au-foot { font-size: 12px; color: ${mute}; }
        .au-r { position: relative; overflow: hidden; margin: 12px; border-radius: 24px; background: radial-gradient(110% 80% at 50% 0%, #3E63F5 0%, #1B2E8F 48%, #0A0D1E 100%); color: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 56px 0 0 56px; isolation: isolate; }
        .au-r::before { content: ""; position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(#000, transparent 75%); -webkit-mask-image: linear-gradient(#000, transparent 75%); }
        .au-q { max-width: 460px; padding-right: 56px; display: flex; flex-direction: column; gap: 16px; }
        .au-q p { font-size: clamp(24px,2.4vw,32px); line-height: 1.15; letter-spacing: -.03em; font-weight: 500; text-wrap: balance; margin: 0; }
        .au-q span { font-size: 14px; color: rgba(255,255,255,.6); }
        .au-shot { margin-top: 48px; width: 118%; border-radius: 14px 0 0 0; overflow: hidden; border: 1px solid rgba(255,255,255,.22); border-right: 0; border-bottom: 0; box-shadow: 0 0 0 6px rgba(255,255,255,.06), 0 40px 100px -20px rgba(0,0,0,.7); }

        .f { display: flex; flex-direction: column; gap: 8px; }
        .f label { font-size: 13px; font-weight: 500; color: ${ink2}; display: flex; justify-content: space-between; }
        .f label a { color: ${mute}; font-weight: 400; }
        .pw { position: relative; display: flex; }
        .f input { flex: 1; font: inherit; font-size: 15px; color: ${ink}; background: ${off}; border: 1px solid transparent; border-radius: 10px; padding: 13px 14px; outline: none; transition: border-color .2s, background .2s, box-shadow .2s; min-width: 0; width: 100%; }
        .f input:focus { background: #fff; border-color: ${acc}; box-shadow: 0 0 0 4px ${accSoft}; }
        .pw input { padding-right: 64px; }
        .pw button { all: unset; cursor: pointer; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 500; color: ${mute}; }
        .pw button:hover { color: ${ink}; }
        .au-submit { height: 50px; margin-top: 6px; width: 100%; }
        .au-err { font-size: 13px; color: #D23B3B; }
        .au-alt { font-size: 14px; color: ${mute}; text-align: center; }
        .au-alt a { color: ${ink}; font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }

        @media (max-width: 900px) { .au { grid-template-columns: minmax(0,1fr); } .au-r { display: none; } .au-l { padding: 20px; } }
      `}</style>
      <SiteStyles />
      <MockStyles />

      <main className="au">
        <div className="au-l">
          <div className="au-top">
            <Link href="/" aria-label="Cherut" style={{ display: 'flex', alignItems: 'center' }}>
              <CherutLogo viewBox="200 279 338 132" width={88} height={34} fillColor={ink} />
            </Link>
            <Link href="/" className="back">{'←'} Back to home</Link>
          </div>

          <div className="au-form-wrap">
            {children}
          </div>

          <p className="au-foot">{footer}</p>
        </div>

        {quote && (
          <aside className="au-r">
            <div className="au-q">
              <p>{quote}</p>
              {quoteNote && <span>{quoteNote}</span>}
            </div>
            <div className="au-shot">
              <AppMockFrame label="app.cherut / today">
                <AppMock kind="dashboard" />
              </AppMockFrame>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
