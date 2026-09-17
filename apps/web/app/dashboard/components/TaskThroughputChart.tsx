'use client';

import Link from 'next/link';
import { Box, Group, Text } from '@mantine/core';
import { useTaskThroughput } from '@/hooks/useTasks';
import { ChartSkeleton } from './skeletons';

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };

export function TaskThroughputChart() {
  const { data, isLoading } = useTaskThroughput(8);
  const weeks = data?.weeks ?? [];
  const hasData = weeks.some((w) => w.onTime + w.late > 0);
  const maxValue = Math.max(1, ...weeks.map((w) => w.onTime + w.late));

  return (
    <Box style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Task throughput</Text>
        <Link href="/dashboard/tasks" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>Tasks</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 18px' }}>From task completion dates · last 8 weeks</Text>

      {isLoading ? (
        <ChartSkeleton />
      ) : !hasData ? (
        <Text size="sm" c="dimmed">No tasks completed in the last 8 weeks.</Text>
      ) : (
        <>
          <Box
            role="img"
            aria-label={`Task throughput over the last 8 weeks, weekly average ${data?.weeklyAvg ?? 0}`}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 104, paddingBottom: 8, borderBottom: '1px solid #E2E5EB' }}
          >
            {weeks.map((w, i) => {
              const total = w.onTime + w.late;
              const onTimePct = total > 0 ? (w.onTime / maxValue) * 100 : 0;
              const latePct = total > 0 ? (w.late / maxValue) * 100 : 0;
              const isLast = i === weeks.length - 1;
              return (
                <Box key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2, height: '100%' }}>
                  <Box style={{ height: `${latePct}%`, background: '#F0A8A2', borderRadius: '2px 2px 0 0' }} />
                  <Box style={{ height: `${onTimePct}%`, background: isLast ? '#9DB8F2' : '#C2D2F6' }} />
                </Box>
              );
            })}
          </Box>
          <Group justify="space-between" mt={8}>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>8 weeks ago</Text>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>This week</Text>
          </Group>
          <Group gap={16} mt={16} pt={14} style={{ borderTop: '1px solid #EFF1F5' }}>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: '#C2D2F6' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>On time</Text>
            </Group>
            <Group gap={7}>
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: '#F0A8A2' }} />
              <Text style={{ fontSize: 12.5, color: '#64748B' }}>Closed late</Text>
            </Group>
            <Box style={{ flex: 1 }} />
            <Text style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
              {data?.weeklyAvg ?? 0} / wk avg
            </Text>
          </Group>
        </>
      )}
    </Box>
  );
}
