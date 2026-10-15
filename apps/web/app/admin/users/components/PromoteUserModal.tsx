'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePromoteUser } from '@/hooks/useAdmin';

export function PromoteUserModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const t = useTranslations('adminUsersPage.promoteModal');
  const promote = usePromoteUser();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    promote.mutate(
      { email },
      {
        onSuccess: () => { onToast(t('toastSuccess')); onClose(); },
        onError: () => setError(t('error')),
      },
    );
  }

  return (
    <div className="adm-modal-ov on" onClick={onClose}>
      <div className="adm-box" onClick={(e) => e.stopPropagation()}>
        <h3>{t('title')}</h3>
        <p>{t('description')}</p>
        <label>
          {t('emailLabel')}
          <input className="adm-in" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p style={{ color: 'var(--adm-bad)', fontSize: 13, marginTop: -6, marginBottom: 12 }}>{error}</p>}
        <div className="adm-f">
          <button type="button" className="adm-btn adm-btn-l" onClick={onClose}>{t('cancel')}</button>
          <button type="button" className="adm-btn adm-btn-acc" disabled={!email.trim() || promote.isPending} onClick={handleSubmit}>
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
