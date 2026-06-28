'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Progress, Box, Group, Stack, Text, Title, Loader } from '@mantine/core';
import { CheckCircle2, Circle, ArrowUpCircle, ArrowDownCircle, PenLine } from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useHabits, useLogHabit } from '@/hooks/useHabits';
import { useFinanceOverview } from '@/hooks/useFinance';
import { useJournalEntries } from '@/hooks/useJournal';
import { useLifeAreas } from '@/hooks/useLifeAreas';
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
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
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
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
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

      <Box mt="auto" pt={14}>
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

      <Box mt="auto" pt={14}>
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
  const { data: overview, isLoading } = useFinanceOverview(undefined, currency);

  const hasData = overview && Object.keys(overview.balanceByCurrency ?? {}).length > 0;
  const net = (overview?.totalIncomeConverted ?? 0) - (overview?.totalExpensesConverted ?? 0);
  const displayCurrency = overview?.displayCurrency ?? currency;

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
              Consolidated total · {displayCurrency}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#0052CC', lineHeight: 1 }}>
              {fmtCurrency(overview?.totalBalanceConverted ?? 0, displayCurrency)}
            </Text>
          </Box>

          <Group gap={6} align="center">
            {net >= 0
              ? <ArrowUpCircle size={14} color="#2e7d32" />
              : <ArrowDownCircle size={14} color="#c62828" />
            }
            <Text style={{ fontSize: 13, fontWeight: 600, color: net >= 0 ? '#2e7d32' : '#c62828' }}>
              {net >= 0 ? '+' : ''}{fmtCurrency(net, displayCurrency)}
            </Text>
            <Text size="xs" c="dimmed">this month</Text>
          </Group>
        </Stack>
      )}

      <Box mt="auto" pt={14}>
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

      <Box mt="auto" pt={14}>
        <NavLink onClick={() => router.push('/dashboard/objectives')}>View all objectives</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Key Results ─────────────────────────────────────────────────────

function KeyResultsPanel() {
  const router = useRouter();
  const { data: objectives = [], isLoading } = useObjectives();

  const keyResults = useMemo(() => {
    return (objectives as any[])
      .filter(o => o.status === 'active')
      .flatMap(o => (o.keyResults ?? []).map((kr: any) => ({ ...kr, objectiveTitle: o.title })));
  }, [objectives]);

  return (
    <Panel>
      <div style={LABEL}>Key Results</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : keyResults.length === 0 ? (
        <Text size="sm" c="dimmed">No key results yet.</Text>
      ) : (
        <Stack gap={14}>
          {keyResults.map((kr: any) => {
            const pct = kr.targetValue > 0
              ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
              : 0;
            const done = kr.completedAt != null;
            return (
              <Box key={kr.id}>
                <Group justify="space-between" mb={4} wrap="nowrap">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={500}
                      style={{
                        color: done ? '#94A3B8' : '#0F172A',
                        textDecoration: done ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {kr.title}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {kr.objectiveTitle}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: done ? '#2e7d32' : '#64748B', flexShrink: 0, marginLeft: 8 }}>
                    {kr.currentValue}/{kr.targetValue}
                  </Text>
                </Group>
                <Progress value={pct} size={5} color={done ? 'green' : '#4686FE'} radius={3} />
              </Box>
            );
          })}
        </Stack>
      )}

      <Box mt="auto" pt={14}>
        <NavLink onClick={() => router.push('/dashboard/objectives')}>View objectives</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Journal ─────────────────────────────────────────────────────────

function JournalPanel() {
  const router = useRouter();
  const today = localDateStr();
  const { data: entries = [], isLoading } = useJournalEntries();

  const latest = (entries as any[])[0];
  const wroteToday = latest?.createdAt?.slice(0, 10) === today;

  const daysSince = latest && !wroteToday
    ? Math.round((Date.now() - new Date(latest.createdAt).getTime()) / 86_400_000)
    : null;

  return (
    <Panel>
      <div style={LABEL}>Journal</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : !latest ? (
        <Stack gap={10}>
          <Text size="sm" c="dimmed">No entries yet. Start reflecting today.</Text>
          <button
            onClick={() => router.push('/dashboard/journal')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#4686FE', color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', width: 'fit-content',
            }}
          >
            <PenLine size={14} /> Write first entry
          </button>
        </Stack>
      ) : (
        <Stack gap={10}>
          {wroteToday ? (
            <Box style={{ padding: '12px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <Group gap={6} mb={4}>
                <CheckCircle2 size={14} color="#2e7d32" />
                <Text size="xs" fw={600} style={{ color: '#2e7d32' }}>Written today</Text>
              </Group>
              <Text
                size="sm"
                fw={500}
                style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {latest.title}
              </Text>
              {latest.content && (
                <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                  {latest.content.replace(/<[^>]+>/g, '')}
                </Text>
              )}
            </Box>
          ) : (
            <Box>
              <Text size="xs" c="dimmed" mb={6}>
                Last entry: {daysSince === 1 ? 'yesterday' : daysSince === 0 ? 'today' : `${daysSince} days ago`}
              </Text>
              <Text
                size="sm"
                fw={500}
                style={{ color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}
              >
                {latest.title}
              </Text>
              <button
                onClick={() => router.push('/dashboard/journal')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#4686FE', color: 'white', border: 'none',
                  borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <PenLine size={14} /> Write today
              </button>
            </Box>
          )}
        </Stack>
      )}

      <Box mt="auto" pt={14}>
        <NavLink onClick={() => router.push('/dashboard/journal')}>View all entries</NavLink>
      </Box>
    </Panel>
  );
}

// ─── Section: Life Areas ──────────────────────────────────────────────────────

function LifeAreasPanel() {
  const router = useRouter();
  const { data: areas = [], isLoading } = useLifeAreas();

  return (
    <Panel>
      <div style={LABEL}>Life Areas</div>

      {isLoading ? (
        <Group justify="center" py="sm"><Loader size="xs" color="#4686FE" /></Group>
      ) : (areas as any[]).length === 0 ? (
        <Text size="sm" c="dimmed">No life areas defined yet.</Text>
      ) : (
        <Box>
          <Text size="xs" c="dimmed" mb={12}>{(areas as any[]).length} area{(areas as any[]).length !== 1 ? 's' : ''} defined</Text>
          <Group gap={8} wrap="wrap">
            {(areas as any[]).map((area: any) => (
              <span
                key={area.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  fontSize: 13, fontWeight: 500,
                  background: area.color ? `${area.color}18` : '#F1F5F9',
                  color: area.color ?? '#64748B',
                  border: `1px solid ${area.color ? `${area.color}30` : '#E2E8F0'}`,
                }}
              >
                {area.icon && <span style={{ fontSize: 14 }}>{area.icon}</span>}
                {area.name}
              </span>
            ))}
          </Group>
        </Box>
      )}

      <Box mt="auto" pt={14}>
        <NavLink onClick={() => router.push('/dashboard/life-areas')}>Manage life areas</NavLink>
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

      {/* Row 1 — Today + Goals */}
      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Stack gap="lg" style={{ flex: 1 }}>
            <HabitsToday />
            <TasksDue />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Stack gap="lg" style={{ flex: 1 }}>
            <FinanceSnapshot />
            <ObjectivesProgress />
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Row 2 — Key Results · Journal · Life Areas */}
      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <KeyResultsPanel />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <JournalPanel />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 12, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <LifeAreasPanel />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
