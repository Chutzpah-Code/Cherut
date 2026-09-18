'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Box, Group, Stack, Text } from '@mantine/core';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { useProjection } from '@/hooks/useFinance';
import { useFinanceCurrency } from '../../currency-context';
import { fmtCurrency, fmtShortDate } from './billUtils';
import { ChartSkeleton } from '../../components/skeletons';

const BAR_COUNT = 12;

export function BalanceProjectionChart({ horizon }: { horizon: number }) {
  const t = useTranslations('finance.balanceProjection');
  const locale = useLocale();
  const { displayCurrency } = useFinanceCurrency();
  const { data, isLoading } = useProjection(horizon, displayCurrency);

  if (isLoading) return <ChartSkeleton />;
  if (!data || data.points.length === 0) return null;

  const points = data.points;
  const sampleCount = Math.min(BAR_COUNT, points.length);
  const sampled = Array.from({ length: sampleCount }, (_, i) => {
    const idx = sampleCount === 1 ? 0 : Math.round((i * (points.length - 1)) / (sampleCount - 1));
    return points[idx];
  });

  const isRisk = data.lowestPoint.total < 0;

  return (
    <Box>
      <Text style={{ fontSize: 15, fontWeight: 700 }}>{t('title')}</Text>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 20px' }}>
        {t('subtitle', { horizon })}
      </Text>

      <Box style={{ height: 150, borderBottom: '1px solid #E2E5EB', paddingBottom: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampled} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="total" radius={[3, 3, 0, 0]}>
              {sampled.map((p, i) => (
                <Cell key={i} fill={i === 0 ? '#9DB8F2' : p.total < 0 ? '#F0A8A2' : '#E7EDFB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Group justify="space-between" mt={8}>
        <Text style={{ fontSize: 11.5, color: '#64748B' }}>{fmtShortDate(sampled[0].date, locale)}</Text>
        <Text style={{ fontSize: 11.5, color: '#64748B' }}>{fmtShortDate(sampled[sampled.length - 1].date, locale)}</Text>
      </Group>

      <Group gap={26} mt={18} pt={16} style={{ borderTop: '1px solid #EFF1F5' }} wrap="wrap">
        <Stack gap={3}>
          <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' }}>
            {t('lowestPoint')}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: 600 }}>
            {fmtCurrency(data.lowestPoint.total, locale, displayCurrency)}{' '}
            <Text span style={{ fontSize: 12.5, fontWeight: 500, color: isRisk ? '#B91C1C' : '#64748B' }}>
              · {fmtShortDate(data.lowestPoint.date, locale)}{isRisk ? ` · ${t('atRisk')}` : ''}
            </Text>
          </Text>
        </Stack>
        <Stack gap={3}>
          <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' }}>
            {t('endOfHorizon')}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: 600 }}>{fmtCurrency(data.endOfHorizon.total, locale, displayCurrency)}</Text>
        </Stack>
      </Group>
    </Box>
  );
}
