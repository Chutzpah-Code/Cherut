'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/firebase/auth';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationErrorMessage } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
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

export default function RegisterPage() {
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [error, setError]                       = useState('');
  const [loading, setLoading]                   = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const registerRateLimit = useRateLimit({ action: 'register' });

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registerRateLimit.canSubmit) { setError(registerRateLimit.warningMessage); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const firebaseUser = await registerUser(email, password);
      const token = await firebaseUser.getIdToken();
      await apiClient.post('/auth/register', { email, password }, { headers: { Authorization: `Bearer ${token}` } });
      registerRateLimit.recordSuccess();
      router.push('/dashboard');
    } catch (err: any) {
      registerRateLimit.recordFailure();
      setError(getRegistrationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
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
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px', color: TEXT }}>Create your account</h1>
            <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>Start building your system today</p>
          </div>
        </div>

        <div className="auth-card" style={{ background: SURF2, border: `1px solid ${RULE}`, borderRadius: 16 }}>
          <RateLimitDisplay result={registerRateLimit.result} message={registerRateLimit.warningMessage} showProgress />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className="auth-error">{error}</div>}

            <div>
              <label className="auth-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-pw-wrap">
                <input id="reg-password" className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label" htmlFor="reg-confirm">Confirm password</label>
              <div className="auth-pw-wrap">
                <input id="reg-confirm" className="auth-input" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account…' : <>Create account <span>→</span></>}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
            Already have an account?{' '}
            <a href="/auth/login" className="auth-link">Sign in</a>
          </p>
          <a href="/" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
