'use client';

import { useMemo } from 'react';
import { Box, Center, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useBoardKanban } from '@/hooks/useBoards';
import { Task } from '@/lib/api/services/tasks';

interface BoardTimeLogViewProps {
  boardId: string;
}

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function SummaryCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 24px' }}>
      <Group gap={10} mb={12}>
        <Box style={{ width: 32, height: 32, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="#0052CC" />
        </Box>
        <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</Text>
      </Group>
      <Text fw={700} size="xl" style={{ letterSpacing: '-0.02em', color: '#0F172A' }}>{value}</Text>
      {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
    </Box>
  );
}

interface DayBucket {
  date: string;
  seconds: number;
}

export function BoardTimeLogView({ boardId }: BoardTimeLogViewProps) {
  const { data: columns, isLoading } = useBoardKanban(boardId);

  const tasks: Task[] = useMemo(
    () => columns?.flatMap((c) => c.tasks).filter((t) => !t.archived) ?? [],
    [columns],
  );

  const trackedTasks = useMemo(
    () => tasks.filter((t) => (t.totalTimeTracked ?? 0) > 0),
    [tasks],
  );

  const totalSeconds = useMemo(
    () => trackedTasks.reduce((sum, t) => sum + (t.totalTimeTracked ?? 0), 0),
    [trackedTasks],
  );

  const sessionCount = useMemo(
    () =>
      tasks.reduce(
        (sum, t) =>
          sum + (t.timeTracking?.filter((e) => e.status === 'completed').length ?? 0),
        0,
      ),
    [tasks],
  );

  const topTask = useMemo(
    () =>
      trackedTasks.length > 0
        ? trackedTasks.reduce((a, b) =>
            (a.totalTimeTracked ?? 0) >= (b.totalTimeTracked ?? 0) ? a : b,
          )
        : null,
    [trackedTasks],
  );

  const byDay: DayBucket[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      for (const entry of t.timeTracking ?? []) {
        if (entry.status !== 'completed' || !entry.duration || !entry.startTime) continue;
        const day = entry.startTime.slice(0, 10);
        map.set(day, (map.get(day) ?? 0) + entry.duration);
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, seconds]) => ({ date: date.slice(5), seconds }));
  }, [tasks]);

  const sortedTasks = useMemo(
    () => [...trackedTasks].sort((a, b) => (b.totalTimeTracked ?? 0) - (a.totalTimeTracked ?? 0)),
    [trackedTasks],
  );

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="sm" color="blue" />
      </Center>
    );
  }

  if (trackedTasks.length === 0) {
    return (
      <Center h={400}>
        <Stack align="center" gap={8}>
          <Clock size={32} color="#94A3B8" />
          <Text size="sm" c="dimmed">No time tracked yet in this board.</Text>
          <Text size="xs" c="dimmed">Start a timer on any task to see your logs here.</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="xl" py="md">
      {/* Summary cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <SummaryCard icon={Clock} label="Total time" value={fmtDuration(totalSeconds)} />
        <SummaryCard icon={CheckCircle2} label="Tasks tracked" value={String(trackedTasks.length)} sub={`of ${tasks.length} total`} />
        <SummaryCard icon={Activity} label="Sessions" value={String(sessionCount)} sub="completed" />
        <SummaryCard
          icon={TrendingUp}
          label="Most tracked"
          value={topTask ? fmtDuration(topTask.totalTimeTracked ?? 0) : '—'}
          sub={topTask?.title}
        />
      </SimpleGrid>

      {/* Time by day chart */}
      {byDay.length > 0 && (
        <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px' }}>
          <Text fw={600} size="sm" mb="md" style={{ color: '#0F172A' }}>Time tracked per day (last 14 days)</Text>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDay} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => fmtDuration(v)}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: number) => [fmtDuration(val), 'Time']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="seconds" fill="#0052CC" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Task breakdown */}
      <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
        <Box style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <Text fw={600} size="sm" style={{ color: '#0F172A' }}>Task breakdown</Text>
        </Box>
        {sortedTasks.map((t, i) => {
          const pct = totalSeconds > 0 ? ((t.totalTimeTracked ?? 0) / totalSeconds) * 100 : 0;
          const statusColor = t.status === 'done' ? '#216E4E' : t.status === 'in_progress' ? '#E56910' : '#0052CC';
          return (
            <Box
              key={t.id}
              style={{
                padding: '14px 24px',
                borderBottom: i < sortedTasks.length - 1 ? '1px solid #F1F5F9' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</Text>
                <Box style={{ marginTop: 6, height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <Box style={{ width: `${pct}%`, height: '100%', background: statusColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                </Box>
              </Box>
              <Text size="sm" fw={600} style={{ color: '#0F172A', flexShrink: 0, minWidth: 56, textAlign: 'right' }}>
                {fmtDuration(t.totalTimeTracked ?? 0)}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
