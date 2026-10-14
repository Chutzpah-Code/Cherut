'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { confirmPasswordReset } from '@/lib/firebase/auth';
import { getPasswordErrorMessage } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import Link from 'next/link';
import { AuthShell } from '@/components/shell/AuthShell';
import { SHELL_TOKENS } from '@/components/shell/Shell';

const { mute, acc } = SHELL_TOKENS;

function ResetPasswordPageContent() {
  const t = useTranslations('resetPasswordPage');
  const tc = useTranslations('authCommon');
  const tErr = useTranslations('authErrors');
  const tf = useTranslations('publicFooter');

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
      setError(t('missingCode'));
      setValidatingCode(false);
      return;
    }
    setValidatingCode(false);
    setIsValidCode(true);
  }, [oobCode, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordResetRateLimit.canSubmit) { setError(passwordResetRateLimit.warningMessage); return; }
    if (password.length < 6) { setError(t('passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('passwordMismatch')); return; }
    if (!oobCode) { setError(t('invalidCode')); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(oobCode, password);
      passwordResetRateLimit.recordSuccess();
      setSuccess(true);
    } catch (err: any) {
      passwordResetRateLimit.recordFailure();
      setError(getPasswordErrorMessage(err, tErr));
    } finally {
      setLoading(false);
    }
  };

  const quote = 'Discipline runs out. A well-built structure does not need it to.';

  if (validatingCode) {
    return (
      <AuthShell footer={tf('disclaimer')} quote={quote} quoteNote="All In All The Time">
        <p style={{ textAlign: 'center', color: mute, fontSize: 16 }}>{t('validatingCode')}</p>
      </AuthShell>
    );
  }

  if (!isValidCode) {
    return (
      <AuthShell footer={tf('disclaimer')} quote={quote} quoteNote="All In All The Time">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px,3.2vw,36px)', letterSpacing: '-.03em', fontWeight: 600, margin: '0 0 8px' }}>{t('invalidLinkTitle')}</h1>
          <p className="lede" style={{ margin: '0 auto' }}>{t('invalidLinkSubtitle')}</p>
        </div>
        <p className="au-err" style={{ textAlign: 'center' }}>{t('invalidLinkError')}</p>
        <Link href="/auth/login" className="btn btn-line" style={{ justifyContent: 'center' }}>{t('backToLogin')}</Link>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell footer={tf('disclaimer')} quote={quote} quoteNote="All In All The Time">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px,3.2vw,36px)', letterSpacing: '-.03em', fontWeight: 600, margin: '0 0 8px' }}>{t('successTitle')}</h1>
          <p className="lede" style={{ margin: '0 auto' }}>{t('successSubtitle')}</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: acc, fontWeight: 600 }}>{t('successBox')}</p>
        <Link href="/auth/login" className="btn btn-dark au-submit" style={{ textAlign: 'center' }}>{t('signIn')} →</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell footer={tf('disclaimer')} quote={quote} quoteNote="All In All The Time">
      <h1 style={{ fontSize: 'clamp(28px,3.2vw,36px)', letterSpacing: '-.03em', fontWeight: 600, margin: 0 }}>{t('title')}</h1>
      <p className="lede" style={{ fontSize: 16, marginTop: -6 }}>{t('subtitle')}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <RateLimitDisplay result={passwordResetRateLimit.result} message={passwordResetRateLimit.warningMessage} showProgress />
        {error && <p className="au-err">{error}</p>}

        <div className="f">
          <label htmlFor="rp-password">{t('newPasswordLabel')}</label>
          <div className="pw">
            <input id="rp-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? tc('hide') : tc('show')}</button>
          </div>
        </div>

        <div className="f">
          <label htmlFor="rp-confirm">{t('confirmNewPasswordLabel')}</label>
          <div className="pw">
            <input id="rp-confirm" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? tc('hide') : tc('show')}</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/auth/login" className="btn btn-line" style={{ flex: 1, justifyContent: 'center' }}>{t('cancel')}</Link>
          <button type="submit" className="btn btn-dark" disabled={loading} style={{ flex: 2 }}>
            {loading ? t('resetting') : `${t('resetButton')} →`}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('resetPasswordPage');
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: mute, fontSize: 16 }}>
        {t('loadingFallback')}
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
