'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useObjectives } from '@/hooks/useObjectives';
import { RowsSkeleton } from './skeletons';

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function KeyResultsSplitChart() {
  const t = useTranslations('dashboard.keyResultsSplit');
  const { data: objectives = [], isLoading } = useObjectives();

  const { complete, inProgress, notStarted, total, objectivesAverage } = useMemo(() => {
    const active = (objectives as any[]).filter((o) => o.isActive !== false && !o.isArchived && o.status === 'active');
    let c = 0, p = 0, n = 0;
    for (const o of active) {
      for (const kr of o.keyResults ?? []) {
        if (kr.isCompleted) c++;
        else if ((kr.currentValue ?? 0) > 0) p++;
        else n++;
      }
    }
    const avg = active.length > 0 ? active.reduce((s, o) => s + (o.progress ?? 0), 0) / active.length : null;
    return { complete: c, inProgress: p, notStarted: n, total: c + p + n, objectivesAverage: avg };
  }, [objectives]);

  const rows = [
    { label: t('complete'), value: complete, color: '#8FC9A6' },
    { label: t('inProgress'), value: inProgress, color: '#9DB8F2' },
    { label: t('notStarted'), value: notStarted, color: '#EDF1F6' },
  ];

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>{t('title')}</Text>
        <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>{t('objectivesLink')}</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>
        {t('subtitle', { count: total })}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={3} height={16} />
      ) : total === 0 ? (
        <Text size="sm" c="dimmed">{t('empty')}</Text>
      ) : (
        <>
          <Box
            role="img"
            aria-label={t('ariaLabel', { complete, inProgress, notStarted })}
            style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1, marginBottom: 18 }}
          >
            {complete > 0 && <Box style={{ width: `${(complete / total) * 100}%`, background: '#8FC9A6' }} />}
            {inProgress > 0 && <Box style={{ width: `${(inProgress / total) * 100}%`, background: '#9DB8F2' }} />}
            {notStarted > 0 && <Box style={{ width: `${(notStarted / total) * 100}%`, background: '#EDF1F6' }} />}
          </Box>
          <Stack gap={10}>
            {rows.map((row) => (
              <Group key={row.label} gap={9} wrap="nowrap">
                <Box style={{ width: 10, height: 10, borderRadius: 2, background: row.color, flexShrink: 0 }} />
                <Text style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 500 }}>{row.label}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.value}</Text>
              </Group>
            ))}
          </Stack>
          <Group justify="space-between" align="baseline" mt={18} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Text style={{ fontSize: 12.5, color: '#64748B' }}>{t('objectivesAverage')}</Text>
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
              {objectivesAverage != null ? `${objectivesAverage.toFixed(1)}%` : '—'}
            </Text>
          </Group>
        </>
      )}
    </Box>
  );
}
