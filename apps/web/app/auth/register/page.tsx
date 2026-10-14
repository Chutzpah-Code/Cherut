'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { registerUser } from '@/lib/firebase/auth';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationErrorMessage } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import { AuthShell } from '@/components/shell/AuthShell';

export default function RegisterPage() {
  const t = useTranslations('registerPage');
  const tc = useTranslations('authCommon');
  const tErr = useTranslations('authErrors');
  const tf = useTranslations('publicFooter');

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
    if (password !== confirmPassword) { setError(t('passwordMismatch')); return; }
    if (password.length < 6) { setError(t('passwordTooShort')); return; }
    setLoading(true);
    try {
      const firebaseUser = await registerUser(email, password);
      const token = await firebaseUser.getIdToken();
      await apiClient.post('/auth/register', { email, password }, { headers: { Authorization: `Bearer ${token}` } });
      registerRateLimit.recordSuccess();
      router.push('/dashboard');
    } catch (err: any) {
      registerRateLimit.recordFailure();
      setError(getRegistrationErrorMessage(err, tErr));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={tf('disclaimer')}
      quote={t('quote')}
      quoteNote={t('quoteNote')}
    >
      <h1 style={{ fontSize: 'clamp(34px,3.6vw,44px)', letterSpacing: '-.04em', fontWeight: 600, lineHeight: 1.02, margin: 0 }}>{t('title')}</h1>
      <p className="lede" style={{ fontSize: 16, marginTop: -6 }}>{t('subtitle')}</p>

      <RateLimitDisplay result={registerRateLimit.result} message={registerRateLimit.warningMessage} showProgress />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {error && <p className="au-err">{error}</p>}

        <div className="f">
          <label htmlFor="reg-email">{tc('emailLabel')}</label>
          <input id="reg-email" type="email" placeholder={tc('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div className="f">
          <label htmlFor="reg-password">{t('passwordLabel')}</label>
          <div className="pw">
            <input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? tc('hidePasswordAria') : tc('showPasswordAria')}>
              {showPassword ? tc('hide') : tc('show')}
            </button>
          </div>
        </div>

        <div className="f">
          <label htmlFor="reg-confirm">{t('confirmPasswordLabel')}</label>
          <div className="pw">
            <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? tc('hidePasswordAria') : tc('showPasswordAria')}>
              {showConfirm ? tc('hide') : tc('show')}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-dark au-submit" disabled={loading}>
          {loading ? t('creatingAccount') : <>{t('createAccount')} →</>}
        </button>
      </form>

      <p className="au-alt">{t('alreadyHaveAccount')} <a href="/auth/login">{t('signIn')}</a></p>
    </AuthShell>
  );
}
