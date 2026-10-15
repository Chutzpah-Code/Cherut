'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { useAdminOverview, useAdminSales, useAdminAnalytics, useAdminActivity, useAdminServicesStatus } from '@/hooks/useAdmin';
import { ServiceStatus } from '@/lib/api/services/admin';
import { downloadCsv } from './lib/exportCsv';

const PLAN_COLORS: Record<string, string> = { free: '#D7DAE4', core: '#8FA6FF', pro: '#3B5BF6', elite: '#14141C' };

function StatusDot({ status }: { status: ServiceStatus }) {
  const t = useTranslations('adminDashboardPage.system');
  const cls = status === 'online' ? '' : status === 'degraded' ? 'w' : status === 'down' ? 'b' : 'n';
  return <span className={`adm-dot ${cls}`}>{t(`status.${status}`)}</span>;
}

export default function AdminOverviewPage() {
  const t = useTranslations('adminDashboardPage');
  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: sales } = useAdminSales();
  const { data: analytics } = useAdminAnalytics();
  const { data: activity } = useAdminActivity();
  const { data: health } = useAdminServicesStatus();

  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [series, setSeries] = useState<'users' | 'revenue'>('users');

  const months = series === 'users' ? analytics?.userGrowth.monthly ?? [] : analytics?.revenue.monthly ?? [];
  const maxValue = Math.max(1, ...months.map((m) => ('users' in m ? m.users : m.amount)));

  const planEntries = useMemo(() => {
    if (!overview) return [];
    const total = Object.values(overview.planDistribution).reduce((a, b) => a + b, 0) || 1;
    return (Object.entries(overview.planDistribution) as [keyof typeof overview.planDistribution, number][]).map(([plan, count]) => ({
      plan,
      count,
      pct: Math.round((count / total) * 100),
      color: PLAN_COLORS[plan],
    }));
  }, [overview]);

  function handleExport() {
    downloadCsv('cherut-overview.csv', [
      { metric: 'totalUsers', value: overview!.overview.totalUsers },
      { metric: 'totalAdmins', value: overview!.overview.totalAdmins },
      { metric: 'activeSubscriptions', value: overview!.overview.activeSubscriptions },
      { metric: 'newUsersLast30Days', value: overview!.overview.newUsersLast30Days },
      { metric: 'onboardingCompletionRate', value: overview!.overview.onboardingCompletionRate },
      ...(sales ? [
        { metric: 'monthlyRevenue', value: sales.monthlyRevenue },
        { metric: 'totalPaidUsers', value: sales.totalPaidUsers },
        { metric: 'conversionRate', value: sales.conversionRate },
      ] : []),
    ]);
  }

  if (loadingOverview) return <p className="adm-sub">{t('loading')}</p>;
  if (!overview) return null;

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
          <button type="button" className="adm-btn adm-btn-l" onClick={handleExport}><Download size={14} />{t('export')}</button>
        </div>
      </div>

      <div className="adm-kpis">
        <div className="adm-kpi">
          <span>{t('kpis.totalUsers')}</span>
          <b>{overview.overview.totalUsers.toLocaleString()}</b>
          <small>{t('kpis.newInLast30', { count: overview.overview.newUsersLast30Days })}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.activeUsers')}</span>
          <b>{overview.overview.activeSubscriptions.toLocaleString()}</b>
          <small>{t('kpis.onboardingRate', { rate: overview.overview.onboardingCompletionRate })}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.monthlyRevenue')}</span>
          <b>${sales?.monthlyRevenue.toLocaleString() ?? '—'}</b>
          <small>{sales && t('kpis.arpu', { amount: sales.averageRevenuePerUser.toFixed(2) })}</small>
        </div>
        <div className="adm-kpi">
          <span>{t('kpis.paidConversion')}</span>
          <b>{sales ? `${sales.conversionRate}%` : '—'}</b>
          <small>{sales && t('kpis.payingUsers', { count: sales.totalPaidUsers })}</small>
        </div>
      </div>

      <div className="adm-grid2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 20 }}>
        <div className="adm-card">
          <div className="adm-card-h">
            <div>
              <h3>{series === 'users' ? t('chart.newUsers') : t('chart.revenue')}</h3>
              <small>{series === 'users' ? t('chart.signupsPerMonth') : t('chart.mrrPerMonth')}</small>
            </div>
            <div className="adm-seg">
              <button type="button" className={series === 'users' ? 'on' : ''} onClick={() => setSeries('users')}>{t('chart.users')}</button>
              <button type="button" className={series === 'revenue' ? 'on' : ''} onClick={() => setSeries('revenue')}>{t('chart.revenue')}</button>
            </div>
          </div>
          {months.length === 0 ? (
            <p className="adm-empty">{t('chart.empty')}</p>
          ) : (
            <>
              <div className="adm-chart" style={{ gridTemplateColumns: `repeat(${months.length},minmax(0,1fr))` }}>
                {months.map((m, i) => {
                  const value = 'users' in m ? m.users : m.amount;
                  return (
                    <div key={m.month + i} className={i === months.length - 1 ? 'cur' : ''}>
                      <i style={{ height: `${(value / maxValue) * 88}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="adm-xl" style={{ gridTemplateColumns: `repeat(${months.length},minmax(0,1fr))` }}>
                {months.map((m, i) => <span key={m.month + i}>{m.month}</span>)}
              </div>
            </>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h"><h3>{t('plans.title')}</h3></div>
          <div className="adm-dist">
            {planEntries.map((p) => <i key={p.plan} style={{ flex: p.count || 0.001, background: p.color }} />)}
          </div>
          <div className="adm-leg">
            {planEntries.map((p) => (
              <div key={p.plan}>
                <em style={{ background: p.color }} />
                <span>{t(`plans.${p.plan}`)}</span>
                <b>{p.count}</b>
                <small>{p.pct}%</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-grid2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-h"><h3>{t('activity.title')}</h3></div>
          {!activity || activity.length === 0 ? (
            <p className="adm-empty">{t('activity.empty')}</p>
          ) : (
            <div className="adm-feed">
              {activity.map((e, i) => (
                <div key={i}>
                  <span className="adm-av">{e.name.slice(0, 2).toUpperCase()}</span>
                  <p><b>{e.name}</b> {e.type === 'signup' ? t('activity.signedUp') : t('activity.completedLesson')}</p>
                  <small>{new Date(e.at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h"><h3>{t('system.title')}</h3></div>
          {!health ? (
            <p className="adm-empty">{t('system.loading')}</p>
          ) : (
            <div className="adm-health">
              {health.services.map((s) => (
                <div key={s.name}>
                  <span>{t(`system.service.${s.name}`)}</span>
                  <StatusDot status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
