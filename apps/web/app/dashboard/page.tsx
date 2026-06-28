'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Progress, Box, Group, Stack, Text, Title, Loader } from '@mantine/core';
import { CheckCircle2, Circle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useHabits, useLogHabit } from '@/hooks/useHabits';
import { useFinanceOverview } from '@/hooks/useFinance';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtCurrency(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B', marginBottom: 14,
};

function Panel({ children, accent = false, style }: {
  children: React.ReactNode; accent?: boolean; style?: React.CSSProperties;
}) {
  return (
    <Box style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderLeft: accent ? '3px solid #0052CC' : '1px solid #E2E8F0',
      borderRadius: 12,
      padding: '20px 22px',
      ...style,
    }}>
      {children}
    </Box>
  );
}

function NavLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      fontSize: 13, fontWeight: 500, color: '#0052CC', display: 'inline-flex',
      alignItems: 'center', gap: 4,
    }}>
      {children} →
    </button>
  );
}

// ─── Section: Habits today ────────────────────────────────────────────────────

function HabitsToday() {
  const router = useRouter();
  const today = localDateStr();
  const { data: habits = [], isLoading } = useHabits(undefined, false);
  const logMutation = useLogHabit();
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());

  const isLogged = (id: string, lastCompletedAt?: string) =>
    loggedIds.has(id) || lastCompletedAt?.slice(0, 10) === today;

  const visible = habits.filter(h => h.isActive).slice(0, 5);
  const unloggedCount = visible.filter(h => !isLogged(h.id, h.lastCompletedAt)).length;

  const handleLog = (habitId: string) => {
    if (loggedIds.has(habitId)) return;
    logMutation.mutate(
      { habitId, date: today, completed: true },
      { onSuccess: () => setLoggedIds(prev => new Set([...prev, habitId])) },
    );
  };

  return (
    <Panel>
      <div style={LABEL}>Today — Habits</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : visible.length === 0 ? (
        <Text size="sm" c="dimmed" mb="sm">No active habits.</Text>
      ) : (
        <Stack gap={0}>
          {visible.map((habit, i) => {
            const done = isLogged(habit.id, habit.lastCompletedAt);
            const pending = logMutation.isPending;
            return (
              <Group
                key={habit.id}
                justify="space-between"
                style={{
                  padding: '10px 0',
                  borderBottom: i < visible.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Group gap={10} style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleLog(habit.id)}
                    disabled={done || pending}
                    style={{
                      background: 'none', border: 'none', cursor: done ? 'default' : 'pointer',
                      padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center',
                    }}
                    aria-label={done ? 'Logged' : 'Log habit'}
                  >
                    {done
                      ? <CheckCircle2 size={22} color="#2e7d32" strokeWidth={1.8} />
                      : <Circle size={22} color="#CBD5E1" strokeWidth={1.8} />
                    }
                  </button>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color: done ? '#94A3B8' : '#0F172A',
                      textDecoration: done ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {habit.title}
                  </Text>
                </Group>
                {habit.streak > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#64748B',
                    background: '#F1F5F9', borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                  }}>
                    {habit.streak}d
                  </span>
                )}
              </Group>
            );
          })}
        </Stack>
      )}

      <Box mt={14}>
        {unloggedCount > 0 && (
          <Text size="xs" c="dimmed" mb={6}>{unloggedCount} to log today</Text>
        )}
        <NavLink onClick={() => router.push('/dashboard/habits')}>View all habits</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Tasks due ───────────────────────────────────────────────────────

function TasksDue() {
  const router = useRouter();
  const today = localDateStr();
  const { data: tasks = [], isLoading } = useTasks();

  const due = useMemo(() => {
    return (tasks as any[])
      .filter(t => t.dueDate && t.dueDate <= today && t.status !== 'done' && !t.archived)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
      .slice(0, 5);
  }, [tasks, today]);

  const totalDue = (tasks as any[]).filter(
    t => t.dueDate && t.dueDate <= today && t.status !== 'done' && !t.archived
  ).length;

  return (
    <Panel>
      <div style={LABEL}>Tasks Due</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : due.length === 0 ? (
        <Text size="sm" c="dimmed">No tasks due today.</Text>
      ) : (
        <Stack gap={0}>
          {due.map((task, i) => {
            const overdue = task.dueDate < today;
            return (
              <Group
                key={task.id}
                justify="space-between"
                style={{
                  padding: '10px 0',
                  borderBottom: i < due.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: '#0F172A', flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {task.title}
                </Text>
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 7px',
                  flexShrink: 0, marginLeft: 8,
                  background: overdue ? '#FEF2F2' : '#EFF6FF',
                  color: overdue ? '#c62828' : '#0052CC',
                }}>
                  {overdue ? 'Overdue' : 'Today'}
                </span>
              </Group>
            );
          })}
        </Stack>
      )}

      <Box mt={14}>
        {totalDue > 5 && (
          <Text size="xs" c="dimmed" mb={6}>+{totalDue - 5} more</Text>
        )}
        <NavLink onClick={() => router.push('/dashboard/tasks')}>View all tasks</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Finance snapshot ────────────────────────────────────────────────

function FinanceSnapshot() {
  const router = useRouter();
  const [currency] = useState<string>(() => {
    try { return localStorage.getItem('finance_display_currency') ?? 'USD'; } catch { return 'USD'; }
  });
  const { data, isLoading } = useFinanceOverview(undefined, currency);

  const net = (data?.totalIncomeConverted ?? 0) - (data?.totalExpensesConverted ?? 0);
  const hasData = !!data && (data.totalBalanceConverted !== undefined);

  return (
    <Panel accent>
      <div style={LABEL}>Finance</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : !hasData ? (
        <Text size="sm" c="dimmed">Set up Finance to start tracking your money.</Text>
      ) : (
        <Stack gap={8}>
          <Box>
            <Text style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>
              Total balance
            </Text>
            <Text style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#0052CC', lineHeight: 1 }}>
              {fmtCurrency(data.totalBalanceConverted, currency)}
            </Text>
          </Box>

          <Group gap={6} align="center">
            {net >= 0
              ? <ArrowUpCircle size={14} color="#2e7d32" />
              : <ArrowDownCircle size={14} color="#c62828" />
            }
            <Text style={{ fontSize: 13, fontWeight: 600, color: net >= 0 ? '#2e7d32' : '#c62828' }}>
              {net >= 0 ? '+' : ''}{fmtCurrency(net, currency)}
            </Text>
            <Text size="xs" c="dimmed">this month</Text>
          </Group>
        </Stack>
      )}

      <Box mt={14}>
        <NavLink onClick={() => router.push('/dashboard/finance')}>View Finance</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Objectives progress ─────────────────────────────────────────────

function ObjectivesProgress() {
  const router = useRouter();
  const { data: objectives = [], isLoading } = useObjectives();

  const top = useMemo(() => {
    return (objectives as any[])
      .filter(o => o.status === 'active')
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [objectives]);

  return (
    <Panel>
      <div style={LABEL}>Objectives</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : top.length === 0 ? (
        <Text size="sm" c="dimmed">No active objectives.</Text>
      ) : (
        <Stack gap={14}>
          {top.map(obj => (
            <Box key={obj.id}>
              <Group justify="space-between" mb={6}>
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: '#0F172A', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {obj.title}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748B', flexShrink: 0, marginLeft: 8 }}>
                  {Math.round(obj.progress)}%
                </Text>
              </Group>
              <Progress value={obj.progress} size={6} color="#0052CC" radius={3} />
            </Box>
          ))}
        </Stack>
      )}

      <Box mt={14}>
        <NavLink onClick={() => router.push('/dashboard/objectives')}>View all objectives</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: habits = [] } = useHabits(undefined, false);
  const { data: tasks = [] } = useTasks();
  const today = localDateStr();

  const habitsToLogCount = (habits as any[]).filter(
    h => h.isActive && h.lastCompletedAt?.slice(0, 10) !== today
  ).length;

  const tasksDueCount = (tasks as any[]).filter(
    t => t.dueDate && t.dueDate <= today && t.status !== 'done' && !t.archived
  ).length;

  const firstName = profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? '';

  const subtitle = [
    habitsToLogCount > 0 && `${habitsToLogCount} habit${habitsToLogCount !== 1 ? 's' : ''} to log`,
    tasksDueCount > 0 && `${tasksDueCount} task${tasksDueCount !== 1 ? 's' : ''} due`,
  ].filter(Boolean).join(' · ') || 'Everything is up to date.';

  return (
    <Stack gap="lg">
      {/* Hero greeting */}
      <Panel accent>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Box>
            <Title
              order={1}
              style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A', lineHeight: 1.2 }}
            >
              {greeting()}{firstName ? `, ${firstName}` : ''}
            </Title>
            <Text size="sm" c="dimmed" mt={4}>{subtitle}</Text>
          </Box>
          <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
            {fmtDate()}
          </Text>
        </Group>
      </Panel>

      {/* Two-column grid */}
      <Grid gutter="lg">
        {/* Left — Today */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg">
            <HabitsToday />
            <TasksDue />
          </Stack>
        </Grid.Col>

        {/* Right — Overview */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="lg">
            <FinanceSnapshot />
            <ObjectivesProgress />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
