// Shared pill-color mapping for the real role/plan/status values this
// app actually has (free/core/pro/elite, active/inactive/cancelled) —
// not the prototype's fictional Core/Method/Mentorship tiers.
import { useTranslations } from 'next-intl';
import { AdminUser } from '@/lib/api/services/admin';

export function RolePill({ role }: { role: AdminUser['role'] }) {
  const t = useTranslations('adminUsersPage.pills');
  const r = role ?? 'user';
  return <span className={`adm-pill${r === 'admin' ? ' bad' : ''}`}>{t.has(`role.${r}`) ? t(`role.${r}`) : r}</span>;
}

export function PlanPill({ plan }: { plan: string }) {
  const t = useTranslations('adminUsersPage.pills');
  const p = plan || 'free';
  const cls = p === 'free' ? '' : p === 'mentorship' || p === 'enterprise' ? 'ink' : 'acc';
  return <span className={`adm-pill${cls ? ' ' + cls : ''}`}>{t.has(`plan.${p}`) ? t(`plan.${p}`) : p}</span>;
}

export function StatusPill({ status }: { status: NonNullable<AdminUser['subscription']>['status'] | undefined }) {
  const t = useTranslations('adminUsersPage.pills');
  const s = status ?? 'inactive';
  const cls = s === 'active' ? 'ok' : s === 'cancelled' ? 'bad' : '';
  return <span className={`adm-pill${cls ? ' ' + cls : ''}`}>{t(`status.${s}`)}</span>;
}
