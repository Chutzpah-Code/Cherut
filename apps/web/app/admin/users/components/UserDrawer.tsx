'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, X } from 'lucide-react';
import { AdminUser } from '@/lib/api/services/admin';
import { useUpdateAdminUser, useGeneratePasswordResetLink, useSuspendUser, useReactivateUser, useDeleteAdminUser } from '@/hooks/useAdmin';
import { RolePill, PlanPill, StatusPill } from './pills';

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  return base.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

interface UserDrawerProps {
  user: AdminUser;
  onClose: () => void;
  onToast: (message: string) => void;
}

export function UserDrawer({ user, onClose, onToast }: UserDrawerProps) {
  const t = useTranslations('adminUsersPage.drawer');
  const updateUser = useUpdateAdminUser();
  const resetLink = useGeneratePasswordResetLink();
  const suspend = useSuspendUser();
  const reactivate = useReactivateUser();
  const deleteUser = useDeleteAdminUser();

  type AssignablePlan = 'free' | 'core' | 'method' | 'mentorship';
  const toAssignablePlan = (plan: string | undefined): AssignablePlan =>
    plan === 'core' || plan === 'method' || plan === 'mentorship' ? plan : 'free';

  const [plan, setPlan] = useState<AssignablePlan>(toAssignablePlan(user.subscription?.plan));
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    setPlan(toAssignablePlan(user.subscription?.plan));
    setRole(user.role);
  }, [user]);

  function handleSave() {
    updateUser.mutate(
      { uid: user.uid, dto: { role, plan } },
      { onSuccess: () => { onToast(t('toastUpdated')); onClose(); } },
    );
  }

  function handleResetPassword() {
    resetLink.mutate(user.uid, {
      onSuccess: ({ link }) => {
        navigator.clipboard?.writeText(link);
        onToast(t('toastResetLinkCopied'));
      },
    });
  }

  function handleSuspendToggle() {
    const mutation = user.suspended ? reactivate : suspend;
    mutation.mutate(user.uid, { onSuccess: () => onToast(t(user.suspended ? 'toastReactivated' : 'toastSuspended')) });
  }

  function copyId() {
    navigator.clipboard?.writeText(user.uid);
    onToast(t('toastIdCopied'));
  }

  function handleDelete() {
    const confirmed = window.confirm(
      t('confirmDelete', {
        name: user.displayName || user.email,
        email: user.email,
        uid: user.uid,
        joined: new Date(user.createdAt).toLocaleDateString(),
      }),
    );
    if (!confirmed) return;
    deleteUser.mutate(user.uid, {
      onSuccess: () => { onToast(t('toastDeleted')); onClose(); },
    });
  }

  return (
    <>
      <div className="adm-scrim on" onClick={onClose} aria-hidden="true" />
      <div className="adm-drawer on">
        <div className="adm-dr-h">
          <span className="adm-av">{initials(user.displayName || user.email)}</span>
          <div>
            <h3>{user.displayName || user.email}</h3>
            <small>{user.email}</small>
          </div>
          <button type="button" className="adm-ia" onClick={onClose} aria-label={t('close')}><X size={16} /></button>
        </div>
        <div className="adm-dr-b">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <RolePill role={user.role} />
            <PlanPill plan={user.subscription?.plan ?? 'free'} />
            <StatusPill status={user.subscription?.status} />
          </div>

          <div className="adm-dr-sec">
            <h4>{t('account')}</h4>
            <dl className="adm-dl">
              <dt>{t('userId')}</dt>
              <dd><button type="button" className="adm-copy" onClick={copyId}>{user.uid} <Copy size={12} /></button></dd>
              <dt>{t('displayName')}</dt>
              <dd>{user.displayName || '—'}</dd>
              <dt>{t('email')}</dt>
              <dd>{user.email}</dd>
              <dt>{t('joined')}</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </dl>
          </div>

          <div className="adm-dr-sec">
            <h4>{t('subscription')}</h4>
            <dl className="adm-dl">
              <dt>{t('plan')}</dt>
              <dd>
                <select className="adm-in" value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)}>
                  <option value="free">{t('planFree')}</option>
                  <option value="core">{t('planCore')}</option>
                  <option value="method">{t('planMethod')}</option>
                  <option value="mentorship">{t('planMentorship')}</option>
                </select>
              </dd>
              <dt>{t('role')}</dt>
              <dd>
                <select className="adm-in" value={role} onChange={(e) => setRole(e.target.value as 'user' | 'admin')}>
                  <option value="user">{t('roleUser')}</option>
                  <option value="admin">{t('roleAdmin')}</option>
                </select>
              </dd>
            </dl>
          </div>
        </div>
        <div className="adm-dr-f">
          <button type="button" className="adm-btn adm-btn-acc" disabled={updateUser.isPending} onClick={handleSave}>{t('save')}</button>
          <button type="button" className="adm-btn adm-btn-l" disabled={resetLink.isPending} onClick={handleResetPassword}>{t('resetPassword')}</button>
          <button type="button" className="adm-btn adm-btn-bad" disabled={suspend.isPending || reactivate.isPending} onClick={handleSuspendToggle}>
            {t(user.suspended ? 'reactivate' : 'suspend')}
          </button>
          {user.role !== 'admin' && (
            <button type="button" className="adm-btn adm-btn-bad" disabled={deleteUser.isPending} onClick={handleDelete}>
              {t('delete')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
