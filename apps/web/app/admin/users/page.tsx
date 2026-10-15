'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MoreHorizontal } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { AdminUser } from '@/lib/api/services/admin';
import { useAdminToast } from '../components/Toast';
import { RolePill, PlanPill, StatusPill } from './components/pills';
import { UserDrawer } from './components/UserDrawer';
import { PromoteUserModal } from './components/PromoteUserModal';
import { CreateAdminModal } from './components/CreateAdminModal';

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  return base.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export default function AdminUsersPage() {
  const t = useTranslations('adminUsersPage');
  const { data, isLoading } = useAdminUsers({ limit: '200' });
  const { showToast, toastNode } = useAdminToast();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modal, setModal] = useState<'promote' | 'create' | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data?.users ?? []).filter((u) => {
      if (q && !`${u.displayName ?? ''}${u.email}${u.uid}`.toLowerCase().includes(q)) return false;
      if (role && u.role !== role) return false;
      if (plan && (u.subscription?.plan ?? 'free') !== plan) return false;
      return true;
    });
  }, [data, search, role, plan]);

  return (
    <div>
      <div className="adm-top">
        <div>
          <div className="adm-crumb adm-mono">{t('crumb')}</div>
          <h1 className="adm-h1">{t('title')}</h1>
          <p className="adm-sub">{t('subtitle')}</p>
        </div>
        <div className="adm-acts">
          <button type="button" className="adm-btn adm-btn-l" onClick={() => setModal('promote')}>{t('promoteUser')}</button>
          <button type="button" className="adm-btn adm-btn-acc" onClick={() => setModal('create')}>{t('createAdmin')}</button>
        </div>
      </div>

      <div className="adm-tools">
        <label className="adm-search">
          <Search size={15} />
          <input placeholder={t('searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{t('filters.allRoles')}</option>
          <option value="user">{t('pills.role.user')}</option>
          <option value="admin">{t('pills.role.admin')}</option>
        </select>
        <select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">{t('filters.allPlans')}</option>
          <option value="free">{t('pills.plan.free')}</option>
          <option value="core">{t('pills.plan.core')}</option>
          <option value="pro">{t('pills.plan.pro')}</option>
          <option value="elite">{t('pills.plan.elite')}</option>
        </select>
        <span className="adm-cnt">{t('count', { shown: filtered.length, total: data?.users.length ?? 0 })}</span>
      </div>

      {isLoading ? (
        <p className="adm-sub">{t('loading')}</p>
      ) : (
        <div className="adm-tbl">
          <table>
            <thead>
              <tr>
                <th>{t('table.user')}</th>
                <th>{t('table.role')}</th>
                <th>{t('table.plan')}</th>
                <th>{t('table.status')}</th>
                <th>{t('table.joined')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} onClick={() => setSelectedUser(u)}>
                  <td>
                    <div className="adm-u">
                      <span className="adm-av">{initials(u.displayName || u.email)}</span>
                      <div><b>{u.displayName || u.email}</b><small>{u.email}</small></div>
                    </div>
                  </td>
                  <td><RolePill role={u.role} /></td>
                  <td><PlanPill plan={u.subscription?.plan ?? 'free'} /></td>
                  <td><StatusPill status={u.subscription?.status} /></td>
                  <td className="adm-num">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td onClick={(e) => e.stopPropagation()}><button type="button" className="adm-ia" aria-label={t('more')}><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="adm-empty">{t('empty')}</p>}
        </div>
      )}

      {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onToast={showToast} />}
      {modal === 'promote' && <PromoteUserModal onClose={() => setModal(null)} onToast={showToast} />}
      {modal === 'create' && <CreateAdminModal onClose={() => setModal(null)} onToast={showToast} />}
      {toastNode}
    </div>
  );
}
