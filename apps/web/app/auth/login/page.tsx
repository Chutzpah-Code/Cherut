'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { loginUser, resetPassword } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginErrorMessage, getAuthErrorMessage } from '@/lib/utils/auth-errors';
import { useLoginRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import { Modal } from '@mantine/core';
import { AuthShell } from '@/components/shell/AuthShell';
import { SHELL_TOKENS } from '@/components/shell/Shell';

const { ink, mute, rule, acc } = SHELL_TOKENS;

export default function LoginPage() {
  const t = useTranslations('loginPage');
  const tc = useTranslations('authCommon');
  const tErr = useTranslations('authErrors');
  const tf = useTranslations('publicFooter');

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
      setError(getLoginErrorMessage(err, tErr));
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
      setResetError(getAuthErrorMessage(err, tErr));
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
    <AuthShell
      footer={tf('disclaimer')}
      quote="A bad day is not a verdict on who you are. It is a day to review and return from."
      quoteNote="All In All The Time"
    >
      <h1 style={{ fontSize: 'clamp(34px,3.6vw,44px)', letterSpacing: '-.04em', fontWeight: 600, lineHeight: 1.02, margin: 0 }}>{t('title')}</h1>
      <p className="lede" style={{ fontSize: 16, marginTop: -6 }}>{t('subtitle')}</p>

      <RateLimitDisplay result={loginRateLimit.result} message={loginRateLimit.warningMessage} showProgress />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {error && <p className="au-err">{error}</p>}

        <div className="f">
          <label htmlFor="login-email">{tc('emailLabel')}</label>
          <input id="login-email" type="email" placeholder={tc('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div className="f">
          <label htmlFor="login-password">{t('passwordLabel')}<a href="#" onClick={(e) => { e.preventDefault(); setResetModalOpened(true); }}>{t('forgotPassword')}</a></label>
          <div className="pw">
            <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? tc('hidePasswordAria') : tc('showPasswordAria')}>
              {showPassword ? tc('hide') : tc('show')}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-dark au-submit" disabled={loading}>
          {loading ? t('signingIn') : <>{t('signIn')} →</>}
        </button>
      </form>

      <p className="au-alt">{t('noAccount')} <a href="/auth/register">{t('signUp')}</a></p>

      <Modal
        opened={resetModalOpened}
        onClose={handleResetModalClose}
        title={<span style={{ fontWeight: 600, fontSize: 18, color: ink, letterSpacing: '-0.01em' }}>{t('resetModal.title')}</span>}
        centered
        radius={16}
        styles={{
          content: { background: '#fff', border: `1px solid ${rule}` },
          header: { background: '#fff', borderBottom: `1px solid ${rule}` },
          close: { color: mute },
        }}
      >
        {resetSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32, color: acc }}>{'✓'}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: ink }}>{t('resetModal.emailSentTitle')}</div>
            <p style={{ fontSize: 14, color: mute, margin: 0, lineHeight: 1.55 }}>{t('resetModal.emailSentBody')}</p>
            <button onClick={handleResetModalClose} className="btn btn-dark" style={{ marginTop: 8 }}>{t('resetModal.gotIt')}</button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {resetError && <p className="au-err">{resetError}</p>}
            <p style={{ fontSize: 14, color: mute, margin: 0, lineHeight: 1.55 }}>{t('resetModal.prompt')}</p>
            <div className="f">
              <label htmlFor="reset-email">{tc('emailLabel')}</label>
              <input id="reset-email" type="email" placeholder={tc('emailPlaceholder')} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleResetModalClose} className="btn btn-line">{t('resetModal.cancel')}</button>
              <button type="submit" disabled={resetLoading} className="btn btn-dark">
                {resetLoading ? t('resetModal.sending') : t('resetModal.sendResetLink')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AuthShell>
  );
}
