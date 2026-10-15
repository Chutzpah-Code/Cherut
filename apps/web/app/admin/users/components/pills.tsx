// Shared pill-color mapping for the real role/plan/status values this
// app actually has (free/core/pro/elite, active/inactive/cancelled) —
// not the prototype's fictional Core/Method/Mentorship tiers.
import { useTranslations } from 'next-intl';
import { AdminUser } from '@/lib/api/services/admin';

export function RolePill({ role }: { role: AdminUser['role'] }) {
  const t = useTranslations('adminUsersPage.pills');
  return <span className={`adm-pill${role === 'admin' ? ' bad' : ''}`}>{t(`role.${role}`)}</span>;
}

export function PlanPill({ plan }: { plan: 'free' | 'core' | 'pro' | 'elite' }) {
  const t = useTranslations('adminUsersPage.pills');
  const cls = plan === 'free' ? '' : plan === 'elite' ? 'ink' : 'acc';
  return <span className={`adm-pill${cls ? ' ' + cls : ''}`}>{t(`plan.${plan}`)}</span>;
}

export function StatusPill({ status }: { status: NonNullable<AdminUser['subscription']>['status'] | undefined }) {
  const t = useTranslations('adminUsersPage.pills');
  const s = status ?? 'inactive';
  const cls = s === 'active' ? 'ok' : s === 'cancelled' ? 'bad' : '';
  return <span className={`adm-pill${cls ? ' ' + cls : ''}`}>{t(`status.${s}`)}</span>;
}
