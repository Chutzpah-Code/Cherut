'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useHabitConsistency, useTodayHabits } from '@/hooks/useHabits';
import { RowsSkeleton } from './skeletons';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function HabitConsistencyChart() {
  const t = useTranslations('dashboard.habitConsistency');
  const { data, isLoading } = useHabitConsistency(13);
  const { data: todayHabits = [] } = useTodayHabits(localToday());
  const habits = data?.habits ?? [];
  const loggedToday = todayHabits.filter((h) => h.loggedToday).length;

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>{t('title')}</Text>
        <Link href="/dashboard/habits" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>{t('habitsLink')}</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>
        {data?.overallPct != null ? t('subtitleOverall', { pct: data.overallPct }) : t('subtitle')}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={4} height={22} />
      ) : habits.length === 0 ? (
        <Text size="sm" c="dimmed">{t('empty')}</Text>
      ) : (
        <>
          <Stack gap={13}>
            {habits.map((habit) => (
              <Box
                key={habit.habitId}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 44px', alignItems: 'center', gap: 14 }}
              >
                <Text
                  style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {habit.title}
                </Text>
                <Group
                  gap={3}
                  role="img"
                  aria-label={habit.pct != null ? t('ariaLabelLogged', { habit: habit.title, pct: habit.pct }) : t('ariaLabelUnscheduled', { habit: habit.title })}
                >
                  {habit.days.map((logged, i) => (
                    <Box
                      key={i}
                      style={{
                        width: 11, height: 11, borderRadius: 3,
                        background: logged === null ? 'transparent' : logged ? '#9DB8F2' : '#EDF1F6',
                      }}
                    />
                  ))}
                </Group>
                <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {habit.pct != null ? `${habit.pct}%` : '—'}
                </Text>
              </Box>
            ))}
          </Stack>
          <Group align="center" gap={16} mt={18} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#9DB8F2' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>{t('logged')}</Text>
            </Group>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#EDF1F6' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>{t('missed')}</Text>
            </Group>
            <Box style={{ flex: 1 }} />
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>
              {t('loggedToday', { logged: loggedToday, total: todayHabits.length })}
            </Text>
          </Group>
        </>
      )}
    </Box>
  );
}
