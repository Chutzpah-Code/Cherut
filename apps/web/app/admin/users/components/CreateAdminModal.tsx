'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateAdminUser } from '@/hooks/useAdmin';

// The prototype frames this as "send an invite" — this project has no
// email-sending service, so creating an admin here really does create the
// Firebase Auth account immediately with the password given, not an
// invite flow. Copy reflects that honestly.
export function CreateAdminModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const t = useTranslations('adminUsersPage.createAdminModal');
  const createAdmin = useCreateAdminUser();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    createAdmin.mutate(
      { email, password, displayName: displayName || undefined },
      {
        onSuccess: () => { onToast(t('toastSuccess')); onClose(); },
        onError: () => setError(t('error')),
      },
    );
  }

  const canSubmit = email.trim() && password.trim().length >= 6;

  return (
    <div className="adm-modal-ov on" onClick={onClose}>
      <div className="adm-box" onClick={(e) => e.stopPropagation()}>
        <h3>{t('title')}</h3>
        <p>{t('description')}</p>
        <label>
          {t('nameLabel')}
          <input className="adm-in" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label>
          {t('emailLabel')}
          <input className="adm-in" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          {t('passwordLabel')}
          <input className="adm-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p style={{ color: 'var(--adm-bad)', fontSize: 13, marginTop: -6, marginBottom: 12 }}>{error}</p>}
        <div className="adm-f">
          <button type="button" className="adm-btn adm-btn-l" onClick={onClose}>{t('cancel')}</button>
          <button type="button" className="adm-btn adm-btn-acc" disabled={!canSubmit || createAdmin.isPending} onClick={handleSubmit}>
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
