'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Shield, Mail, Bell, Database } from 'lucide-react';
import { useAdminSettings, useUpdateAdminSettings, useCleanupInactiveUsers } from '@/hooks/useAdmin';
import { SystemSettings } from '@/lib/api/services/admin';
import { PublicLocaleSwitcher } from '@/i18n/PublicLocaleSwitcher';
import { useAdminToast } from '../components/Toast';
import { Switch } from './components/Switch';

type Tab = 'general' | 'security' | 'email' | 'notifications' | 'maintenance';

export default function AdminSettingsPage() {
  const t = useTranslations('adminSettingsPage');
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const cleanup = useCleanupInactiveUsers();
  const queryClient = useQueryClient();
  const { showToast, toastNode } = useAdminToast();

  const [tab, setTab] = useState<Tab>('general');
  const [form, setForm] = useState<SystemSettings | null>(null);
  const [baseline, setBaseline] = useState<SystemSettings | null>(null);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupConfirmText, setCleanupConfirmText] = useState('');

  useEffect(() => {
    if (settings && !form) {
      setForm(settings);
      setBaseline(settings);
    }
  }, [settings, form]);

  const dirty = form && baseline && JSON.stringify(form) !== JSON.stringify(baseline);

  function update<K extends keyof SystemSettings>(section: K, patch: Partial<SystemSettings[K]>) {
    setForm((prev) => (prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev));
  }

  function handleSave() {
    if (!form) return;
    updateSettings.mutate(form, {
      onSuccess: (saved) => { setBaseline(saved); setForm(saved); showToast(t('toastSaved')); },
    });
  }

  function handleDiscard() {
    setForm(baseline);
  }

  function handleClearCache() {
    queryClient.clear();
    showToast(t('toastCacheCleared'));
  }

  function handleCleanup() {
    cleanup.mutate(undefined, {
      onSuccess: ({ deletedCount }) => {
        setCleanupOpen(false);
        setCleanupConfirmText('');
        showToast(t('toastCleanedUp', { count: deletedCount }));
      },
    });
  }

  if (isLoading || !form) return <p className="adm-sub">{t('loading')}</p>;

  const tabs: { key: Tab; icon: typeof SettingsIcon; label: string }[] = [
    { key: 'general', icon: SettingsIcon, label: t('tabs.general') },
    { key: 'security', icon: Shield, label: t('tabs.security') },
    { key: 'email', icon: Mail, label: t('tabs.email') },
    { key: 'notifications', icon: Bell, label: t('tabs.notifications') },
    { key: 'maintenance', icon: Database, label: t('tabs.maintenance') },
  ];

  return (
    <div>
      <div className="adm-top">
        <div>
          <div className="adm-crumb adm-mono">{t('crumb')}</div>
          <h1 className="adm-h1">{t('title')}</h1>
          <p className="adm-sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="adm-st">
        <nav>
          {tabs.map((tb) => (
            <button key={tb.key} type="button" className={tab === tb.key ? 'on' : ''} onClick={() => setTab(tb.key)}>
              <tb.icon size={16} />{tb.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === 'general' && (
            <div className="adm-sp on">
              <h2>{t('tabs.general')}</h2>
              <p>{t('general.subtitle')}</p>
              <div className="adm-rows">
                <div className="adm-row">
                  <div><b>{t('general.siteName')}</b><small>{t('general.siteNameDesc')}</small></div>
                  <input className="adm-in" value={form.general.appName} onChange={(e) => update('general', { appName: e.target.value })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('general.siteDescription')}</b><small>{t('general.siteDescriptionDesc')}</small></div>
                  <input className="adm-in" value={form.general.description} onChange={(e) => update('general', { description: e.target.value })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('general.supportEmail')}</b><small>{t('general.supportEmailDesc')}</small></div>
                  <input className="adm-in" type="email" value={form.general.supportEmail} onChange={(e) => update('general', { supportEmail: e.target.value })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('general.language')}</b><small>{t('general.languageDesc')}</small></div>
                  <div className="adm-r"><PublicLocaleSwitcher color="var(--adm-ink)" /></div>
                </div>
                <div className="adm-row">
                  <div><b>{t('general.maintenanceMode')}</b><small>{t('general.maintenanceModeDesc')}</small></div>
                  <Switch checked={form.general.maintenanceMode} onChange={(v) => update('general', { maintenanceMode: v })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="adm-sp on">
              <h2>{t('tabs.security')}</h2>
              <p>{t('security.subtitle')}</p>
              <div className="adm-rows">
                <div className="adm-row">
                  <div><b>{t('security.requireVerification')}</b><small>{t('security.requireVerificationDesc')}</small></div>
                  <Switch checked={form.security.requireEmailVerification} onChange={(v) => update('security', { requireEmailVerification: v })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('security.sessionTimeout')}</b><small>{t('security.sessionTimeoutDesc')}</small></div>
                  <input className="adm-in" type="number" min={5} value={form.security.sessionTimeoutMinutes} onChange={(e) => update('security', { sessionTimeoutMinutes: Number(e.target.value) })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('security.maxLoginAttempts')}</b><small>{t('security.maxLoginAttemptsDesc')}</small></div>
                  <input className="adm-in" type="number" min={1} value={form.security.maxLoginAttempts} onChange={(e) => update('security', { maxLoginAttempts: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'email' && (
            <div className="adm-sp on">
              <h2>{t('tabs.email')}</h2>
              <p>{t('email.subtitle')}</p>
              <div className="adm-rows">
                <div className="adm-row">
                  <div><b>{t('email.fromName')}</b><small>{t('email.fromNameDesc')}</small></div>
                  <input className="adm-in" value={form.email.fromName} onChange={(e) => update('email', { fromName: e.target.value })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('email.fromEmail')}</b><small>{t('email.fromEmailDesc')}</small></div>
                  <input className="adm-in" type="email" value={form.email.fromEmail} onChange={(e) => update('email', { fromEmail: e.target.value })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('email.notificationsEnabled')}</b><small>{t('email.notificationsEnabledDesc')}</small></div>
                  <Switch checked={form.email.notificationsEnabled} onChange={(v) => update('email', { notificationsEnabled: v })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="adm-sp on">
              <h2>{t('tabs.notifications')}</h2>
              <p>{t('notifications.subtitle')}</p>
              <div className="adm-rows">
                <div className="adm-row">
                  <div><b>{t('notifications.newUserSignup')}</b><small>{t('notifications.newUserSignupDesc')}</small></div>
                  <Switch checked={form.notifications.newUserSignup} onChange={(v) => update('notifications', { newUserSignup: v })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('notifications.newSubscription')}</b><small>{t('notifications.newSubscriptionDesc')}</small></div>
                  <Switch checked={form.notifications.newSubscription} onChange={(v) => update('notifications', { newSubscription: v })} />
                </div>
                <div className="adm-row">
                  <div><b>{t('notifications.weeklyDigest')}</b><small>{t('notifications.weeklyDigestDesc')}</small></div>
                  <Switch checked={form.notifications.weeklyDigest} onChange={(v) => update('notifications', { weeklyDigest: v })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'maintenance' && (
            <div className="adm-sp on">
              <h2>{t('tabs.maintenance')}</h2>
              <p>{t('maintenance.subtitle')}</p>
              <div className="adm-rows">
                <div className="adm-row">
                  <div><b>{t('maintenance.clearCache')}</b><small>{t('maintenance.clearCacheDesc')}</small></div>
                  <button type="button" className="adm-btn adm-btn-l r" style={{ justifySelf: 'end' }} onClick={handleClearCache}>{t('maintenance.clearCache')}</button>
                </div>
              </div>

              <div className="adm-danger">
                <div className="adm-row">
                  <div><b style={{ color: 'var(--adm-bad)' }}>{t('maintenance.cleanupTitle')}</b><small>{t('maintenance.cleanupDesc')}</small></div>
                  <button type="button" className="adm-btn adm-btn-bad r" style={{ justifySelf: 'end' }} onClick={() => setCleanupOpen(true)}>{t('maintenance.cleanupButton')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`adm-save${dirty ? ' on' : ''}`}>
        <span>{t('unsavedChanges')}</span>
        <button type="button" className="adm-btn adm-btn-l" onClick={handleDiscard}>{t('discard')}</button>
        <button type="button" className="adm-btn adm-btn-acc" disabled={updateSettings.isPending} onClick={handleSave}>{t('saveChanges')}</button>
      </div>

      {cleanupOpen && (
        <div className="adm-modal-ov on" onClick={() => setCleanupOpen(false)}>
          <div className="adm-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t('maintenance.cleanupConfirmTitle')}</h3>
            <p>{t('maintenance.cleanupConfirmBody')}</p>
            <label>
              {t('maintenance.cleanupTypeDelete')}
              <input className="adm-in" value={cleanupConfirmText} onChange={(e) => setCleanupConfirmText(e.target.value)} />
            </label>
            <div className="adm-f">
              <button type="button" className="adm-btn adm-btn-l" onClick={() => setCleanupOpen(false)}>{t('maintenance.cleanupCancel')}</button>
              <button type="button" className="adm-btn adm-btn-bad" disabled={cleanupConfirmText !== 'DELETE' || cleanup.isPending} onClick={handleCleanup}>
                {t('maintenance.cleanupConfirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastNode}
    </div>
  );
}
