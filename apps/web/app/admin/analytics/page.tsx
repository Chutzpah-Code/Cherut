'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { useAdminAnalytics, useAdminFunnel, useAdminModuleUsage } from '@/hooks/useAdmin';
import { downloadCsv } from '../lib/exportCsv';

export default function AdminAnalyticsPage() {
  const t = useTranslations('adminAnalyticsPage');
  const { data: analytics, isLoading } = useAdminAnalytics();
  const { data: funnel } = useAdminFunnel();
  const { data: moduleUsage } = useAdminModuleUsage();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const maxFunnel = Math.max(1, ...(funnel?.stages.map((s) => s.count) ?? [1]));

  function handleExport() {
    if (!funnel) return;
    downloadCsv('cherut-analytics.csv', [
      ...funnel.stages.map((s) => ({ metric: `funnel.${s.key}`, value: s.count })),
      ...(moduleUsage ?? []).map((m) => ({ metric: `course.${m.title}.enrolled`, value: m.enrolled })),
      { metric: 'churnRate', value: analytics?.subscriptions.churnRate ?? '' },
      { metric: 'monthlyActiveUsers', value: analytics?.engagement.monthlyActiveUsers ?? '' },
    ]);
  }

  if (isLoading) return <p className="adm-sub">{t('loading')}</p>;
  if (!analytics) return null;

  const { engagement, subscriptions } = analytics;

  return (
    <div>
      <div className="adm-top">
        <div>
          <div className="adm-crumb adm-mono">{t('crumb')}</div>
          <h1 className="adm-h1">{t('title')}</h1>
          <p className="adm-sub">{t('subtitle')}</p>
        </div>
        <div className="adm-acts">
          <div className="adm-seg">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <button type="button" className="adm-btn adm-btn-l" onClick={handleExport}><Download size={14} />{t('exportCsv')}</button>
        </div>
      </div>

      <div className="adm-kpis">
        <div className="adm-kpi">
          <span>{t('kpis.dailyActive')}</span>
          <b>{engagement.dailyActiveUsers ?? t('notTracked')}</b>
          <small>{engagement.dailyActiveUsers === null ? t('notTrackedNote') : t('kpis.dauMau', { pct: Math.round((engagement.dailyActiveUsers / Math.max(1, engagement.monthlyActiveUsers)) * 100) })}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.weeklyActive')}</span>
          <b>{engagement.weeklyActiveUsers ?? t('notTracked')}</b>
          <small>{engagement.weeklyActiveUsers === null && t('notTrackedNote')}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.avgSession')}</span>
          <b>{engagement.averageSessionDuration === null ? t('notTracked') : `${Math.round(engagement.averageSessionDuration / 60)}m`}</b>
          <small>{engagement.averageSessionDuration === null && t('notTrackedNote')}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.monthlyActive')}</span>
          <b>{engagement.monthlyActiveUsers}</b>
          <small>{t('kpis.churn', { rate: subscriptions.churnRate })}</small>
        </div>
      </div>

      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-card-h">
          <div>
            <h3>{t('funnel.title')}</h3>
            <small>{t('funnel.subtitle')}</small>
          </div>
        </div>
        {!funnel || funnel.stages.every((s) => s.count === 0) ? (
          <p className="adm-empty">{t('funnel.empty')}</p>
        ) : (
          <div className="adm-funnel">
            {funnel.stages.map((s) => (
              <div key={s.key}>
                <span>{t(`funnel.stage.${s.key}`)}</span>
                <div className="adm-bar"><i style={{ width: `${(s.count / maxFunnel) * 100}%` }} /></div>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adm-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-h"><h3>{t('moduleUsage.title')}</h3></div>
          {!moduleUsage || moduleUsage.length === 0 ? (
            <p className="adm-empty">{t('moduleUsage.empty')}</p>
          ) : (
            <div className="adm-leg">
              {moduleUsage.map((m) => (
                <div key={m.id} style={{ gridTemplateColumns: '90px minmax(0,1fr) 44px' }}>
                  <span>{m.title}</span>
                  <div className="adm-bar"><i style={{ width: `${m.averageProgress}%` }} /></div>
                  <b style={{ textAlign: 'right' }}>{m.averageProgress}%</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h"><h3>{t('retention.title')}</h3></div>
          <p className="adm-empty">{t('retention.empty')}</p>
        </div>
      </div>
    </div>
  );
}
