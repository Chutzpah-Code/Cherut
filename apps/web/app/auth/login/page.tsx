'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, resetPassword } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginErrorMessage, getAuthErrorMessage } from '@/lib/utils/auth-errors';
import { useLoginRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import { Modal } from '@mantine/core';
import { CMark } from '@/components/shell/Shell';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';
const GRID    = 'rgba(255,255,255,0.04)';

export default function LoginPage() {
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [resetModalOpened, setResetModalOpened] = useState(false);
  const [resetEmail, setResetEmail]           = useState('');
  const [resetLoading, setResetLoading]       = useState(false);
  const [resetSuccess, setResetSuccess]       = useState(false);
  const [resetError, setResetError]           = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const loginRateLimit = useLoginRateLimit();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginRateLimit.canSubmit) { setError(loginRateLimit.warningMessage); return; }
    setLoading(true);
    try {
      await loginRateLimit.handleLoginAttempt(async () => { await loginUser(email, password); });
      router.push('/dashboard');
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(getAuthErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetModalClose = () => {
    setResetModalOpened(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
    setResetLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { background: ${BG} !important; color-scheme: dark !important; }
        body { background: ${BG} !important; }
        .auth-input {
          width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
          background: ${SURF}; border: 1px solid ${RULE}; border-radius: 8px;
          color: ${TEXT}; outline: none; transition: border-color .15s, box-shadow .15s;
          appearance: none;
        }
        .auth-input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_DIM}; }
        .auth-input::placeholder { color: rgba(237,238,246,0.22); }
        .auth-pw-wrap { position: relative; }
        .auth-pw-wrap .auth-input { padding-right: 44px; }
        .auth-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: ${MUTED};
          font-size: 13px; font-family: inherit; padding: 4px;
        }
        .auth-btn {
          width: 100%; padding: 14px; background: ${TEXT}; color: ${BG};
          font-size: 15px; font-weight: 700; font-family: inherit;
          border: none; border-radius: 999px; cursor: pointer;
          transition: opacity .15s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { opacity: .85; }
        .auth-btn:disabled { opacity: .5; cursor: not-allowed; }
        .auth-label { font-size: 13px; font-weight: 600; color: rgba(237,238,246,0.55); display: block; margin-bottom: 6px; }
        .auth-link { color: ${ACCENT}; font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
        .auth-error { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.25); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #f87171; }
        .auth-card { padding: 22px 18px; }
        @media (min-width: 420px) { .auth-card { padding: 28px 28px; } }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: '90px 90px',
        maskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 75%)',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: TEXT }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CMark size={40} color={BG} />
            </div>
            <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Cherut</span>
          </a>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px', color: TEXT }}>Welcome back</h1>
            <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>Sign in to continue your journey</p>
          </div>
        </div>

        <div className="auth-card" style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 16 }}>
          <RateLimitDisplay result={loginRateLimit.result} message={loginRateLimit.warningMessage} showProgress />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className="auth-error">{error}</div>}

            <div>
              <label className="auth-label" htmlFor="login-email">Email</label>
              <input id="login-email" className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-pw-wrap">
                <input id="login-password" className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <span>→</span></>}
            </button>

            <button type="button" onClick={() => setResetModalOpened(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: ACCENT, fontWeight: 600, fontFamily: 'inherit', textAlign: 'center', padding: 0 }}>
              Forgot your password?
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
            Don't have an account?{' '}
            <a href="/auth/register" className="auth-link">Sign up</a>
          </p>
          <a href="/" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>

      <Modal
        opened={resetModalOpened}
        onClose={handleResetModalClose}
        title={<span style={{ fontWeight: 700, fontSize: 18, color: TEXT, fontFamily: 'inherit', letterSpacing: '-0.01em' }}>Reset password</span>}
        centered
        radius={16}
        styles={{
          content: { background: SURF2, border: `1px solid ${RULE}` },
          header: { background: SURF2, borderBottom: `1px solid ${RULE}` },
          overlay: { backdropFilter: 'blur(4px)', background: 'rgba(7,7,13,0.7)' },
          close: { color: MUTED },
        }}
      >
        {resetSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32 }}>✓</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Email sent!</div>
            <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.55 }}>Check your inbox (and spam folder) for reset instructions.</p>
            <button onClick={handleResetModalClose} className="auth-btn" style={{ marginTop: 8 }}>Got it</button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {resetError && <div className="auth-error">{resetError}</div>}
            <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.55 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="auth-label" htmlFor="reset-email">Email</label>
              <input id="reset-email" className="auth-input" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleResetModalClose} style={{ padding: '11px 20px', background: SURF, border: `1px solid ${RULE}`, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: TEXT }}>
                Cancel
              </button>
              <button type="submit" disabled={resetLoading} style={{ padding: '11px 20px', background: TEXT, color: BG, border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: resetLoading ? 0.5 : 1 }}>
                {resetLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
