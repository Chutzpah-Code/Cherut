'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from '@/lib/firebase/auth';
import { getPasswordErrorMessage } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import Link from 'next/link';

const BG      = '#07070D';
const SURF    = '#0F0F1B';
const SURF2   = '#161628';
const TEXT    = '#EDEEF6';
const MUTED   = 'rgba(237,238,246,0.46)';
const ACCENT  = 'oklch(0.68 0.24 260)';
const ACCENT_DIM = 'rgba(80,110,255,0.12)';
const RULE    = 'rgba(255,255,255,0.08)';
const GRID    = 'rgba(255,255,255,0.04)';

function ResetPasswordPageContent() {
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [validatingCode, setValidatingCode]   = useState(true);
  const [isValidCode, setIsValidCode]         = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const passwordResetRateLimit = useRateLimit({ action: 'passwordReset' });

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset code');
      setValidatingCode(false);
      return;
    }
    setValidatingCode(false);
    setIsValidCode(true);
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordResetRateLimit.canSubmit) { setError(passwordResetRateLimit.warningMessage); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!oobCode) { setError('Invalid reset code'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(oobCode, password);
      passwordResetRateLimit.recordSuccess();
      setSuccess(true);
    } catch (err: any) {
      passwordResetRateLimit.recordFailure();
      setError(getPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .rp-input {
          width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
          background: ${SURF}; border: 1px solid ${RULE}; border-radius: 8px;
          color: ${TEXT}; outline: none; transition: border-color .15s, box-shadow .15s; appearance: none;
        }
        .rp-input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_DIM}; }
        .rp-input::placeholder { color: rgba(237,238,246,0.22); }
        .rp-pw-wrap { position: relative; }
        .rp-pw-wrap .rp-input { padding-right: 44px; }
        .rp-pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${MUTED}; font-size: 13px; font-family: inherit; padding: 4px; }
        .rp-btn { width: 100%; padding: 14px; background: ${TEXT}; color: ${BG}; font-size: 15px; font-weight: 700; font-family: inherit; border: none; border-radius: 999px; cursor: pointer; transition: opacity .15s; }
        .rp-btn:hover:not(:disabled) { opacity: .85; }
        .rp-btn:disabled { opacity: .5; cursor: not-allowed; }
        .rp-btn-ghost { padding: 13px 24px; background: transparent; color: ${TEXT}; font-size: 15px; font-weight: 600; font-family: inherit; border: 1px solid ${RULE}; border-radius: 999px; cursor: pointer; text-decoration: none; transition: background .15s; display: inline-block; }
        .rp-btn-ghost:hover { background: rgba(255,255,255,0.05); }
        .rp-label { font-size: 13px; font-weight: 600; color: rgba(237,238,246,0.55); display: block; margin-bottom: 6px; }
        .rp-error { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.25); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #f87171; }
        .rp-success-box { background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.25); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #4ade80; }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: '90px 90px',
        maskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 75%)',
      }} />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );

  if (validatingCode) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', color: MUTED, fontSize: 16 }}>Validating reset code…</div>
      </Shell>
    );
  }

  if (!isValidCode) {
    return (
      <Shell>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 36, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1 }}>Invalid link</h1>
            <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>This reset link is invalid or has expired.</p>
          </div>
          <div style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="rp-error">The password reset link is invalid or has expired. Please request a new one.</div>
            <Link href="/auth/login" className="rp-btn-ghost" style={{ textAlign: 'center' }}>← Back to login</Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', fontSize: 36, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1 }}>Password reset</h1>
            <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>You're good to go.</p>
          </div>
          <div style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="rp-success-box">✓ Your password has been updated. You can now sign in with your new password.</div>
            <Link href="/auth/login" className="rp-btn" style={{ textAlign: 'center', display: 'block' }}>Sign in →</Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px', color: TEXT }}>Reset your password</h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>Enter your new password below</p>
        </div>

        <div style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 16, padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <RateLimitDisplay result={passwordResetRateLimit.result} message={passwordResetRateLimit.warningMessage} showProgress />
            {error && <div className="rp-error">{error}</div>}

            <div>
              <label className="rp-label" htmlFor="rp-password">New password</label>
              <div className="rp-pw-wrap">
                <input id="rp-password" className="rp-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="rp-pw-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div>
              <label className="rp-label" htmlFor="rp-confirm">Confirm new password</label>
              <div className="rp-pw-wrap">
                <input id="rp-confirm" className="rp-input" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="rp-pw-toggle" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/auth/login" className="rp-btn-ghost" style={{ flex: 1, textAlign: 'center' }}>Cancel</Link>
              <button type="submit" className="rp-btn" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Resetting…' : 'Reset password →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#07070D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: 'rgba(237,238,246,0.46)', fontSize: 16 }}>
        Loading…
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
