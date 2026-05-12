'use client';

import { useRouter } from 'next/navigation';
import { Target, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, Title, Text, Button, Group, Stack, SimpleGrid, Loader, ThemeIcon } from '@mantine/core';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useHabits } from '@/hooks/useHabits';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function DashboardPage() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: objectives, isLoading: objectivesLoading } = useObjectives();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: lifeAreas, isLoading: lifeAreasLoading } = useLifeAreas();
  const { data: habits, isLoading: habitsLoading } = useHabits(undefined, false);

  // Calculate stats
  const activeObjectives = objectives?.filter((obj) => obj.status !== 'completed').length || 0;
  const openTasks = tasks?.filter((task) => task.status !== 'done').length || 0;
  const lifeAreasCount = lifeAreas?.length || 0;
  const activeHabits = habits?.filter((habit) => habit.isActive).length || 0;

  const stats = [
    { name: 'Active Objectives', value: activeObjectives, icon: Target },
    { name: 'Open Tasks', value: openTasks, icon: CheckSquare },
    { name: 'Life Areas', value: lifeAreasCount, icon: TrendingUp },
    { name: 'Active Habits', value: activeHabits, icon: Calendar },
  ];

  // Get recent activity from all sources
  const getRecentActivity = () => {
    const activities: Array<{ type: string; title: string; time: string }> = [];

    // Add recent objectives
    objectives?.slice(0, 3).forEach((obj) => {
      activities.push({
        type: 'Objective',
        title: obj.title,
        time: new Date(obj.createdAt).toLocaleDateString(),
      });
    });

    // Add recent tasks
    tasks?.slice(0, 3).forEach((task) => {
      activities.push({
        type: 'Task',
        title: task.title,
        time: new Date(task.createdAt).toLocaleDateString(),
      });
    });

    // Add recent habits
    habits?.slice(0, 3).forEach((habit) => {
      activities.push({
        type: 'Habit',
        title: habit.title,
        time: new Date(habit.createdAt).toLocaleDateString(),
      });
    });

    // Sort by creation date and take top 5
    return activities.slice(0, 5);
  };

  const recentActivity = getRecentActivity();
  const isLoading = objectivesLoading || tasksLoading || lifeAreasLoading || habitsLoading;

  return (
    <Stack
      gap="xl"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div>
        <Title
          order={1}
          mb="xs"
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: '-0.02em',
          }}
        >
          Dashboard
        </Title>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: colors.text.secondary,
            lineHeight: '24px',
          }}
        >
          Overview of your personal excellence journey
        </Text>
      </div>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              padding="xl"
              radius={16}
              style={{
                background: colors.surfaceElevated,
                border: `1px solid ${colors.border}`,
                boxShadow: 'none',
                transition: 'all 200ms ease',
              }}
            >
              <Group justify="space-between" mb="lg">
                <ThemeIcon
                  size={48}
                  radius={12}
                  style={{
                    background: colors.surface,
                    color: colors.primary,
                    border: 'none',
                  }}
                >
                  <Icon size={24} />
                </ThemeIcon>
              </Group>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                }}
              >
                {stat.name}
              </Text>
              <Title
                order={2}
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                {isLoading ? <Loader size="sm" color={colors.primary} /> : stat.value}
              </Title>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card
        padding="xl"
        radius={16}
        style={{
          background: colors.surfaceElevated,
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        }}
      >
        <Title
          order={3}
          mb="lg"
          style={{
            fontFamily: 'Inter Display, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          Quick Actions
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Button
            leftSection={<Target size={20} />}
            onClick={() => router.push('/dashboard/objectives')}
            fullWidth
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              background: colors.primary,
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              height: '48px',
            }}
            styles={{
              root: {
                '&:hover': {
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            New Objective
          </Button>
          <Button
            leftSection={<CheckSquare size={20} />}
            onClick={() => router.push('/dashboard/tasks')}
            fullWidth
            radius={8}
            variant="outline"
            style={{
              fontFamily: 'Inter, sans-serif',
              borderColor: colors.border,
              color: colors.text.primary,
              fontSize: '16px',
              fontWeight: 600,
              height: '48px',
              background: colors.surfaceElevated,
            }}
            styles={{
              root: {
                '&:hover': {
                  borderColor: colors.primary,
                  color: colors.primary,
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            Add Task
          </Button>
          <Button
            leftSection={<Calendar size={20} />}
            onClick={() => router.push('/dashboard/habits')}
            fullWidth
            radius={8}
            variant="outline"
            style={{
              fontFamily: 'Inter, sans-serif',
              borderColor: colors.border,
              color: colors.text.primary,
              fontSize: '16px',
              fontWeight: 600,
              height: '48px',
              background: colors.surfaceElevated,
            }}
            styles={{
              root: {
                '&:hover': {
                  borderColor: colors.primary,
                  color: colors.primary,
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            Track Habit
          </Button>
        </SimpleGrid>
      </Card>

      {/* Recent Activity */}
      <Card
        padding="xl"
        radius={16}
        style={{
          background: colors.surfaceElevated,
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        }}
      >
        <Title
          order={3}
          mb="lg"
          style={{
            fontFamily: 'Inter Display, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          Recent Activity
        </Title>
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader color={colors.primary} />
          </Group>
        ) : recentActivity.length > 0 ? (
          <Stack gap="lg">
            {recentActivity.map((activity, index) => (
              <Card
                key={index}
                padding="lg"
                radius={12}
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: colors.primary,
                      background: colors.hover,
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                <Group gap="lg" wrap="nowrap">
                  <ThemeIcon
                    size="lg"
                    radius={8}
                    style={{
                      background: colors.surfaceElevated,
                      color: colors.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Clock size={20} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: colors.primary,
                        }}
                      >
                        {activity.type}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          color: colors.text.tertiary,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          color: colors.text.tertiary,
                        }}
                      >
                        {activity.time}
                      </Text>
                    </Group>
                    <Text
                      mt={4}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: colors.text.primary,
                        lineHeight: '20px',
                      }}
                    >
                      {activity.title}
                    </Text>
                  </div>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Stack align="center" py="xl">
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                color: colors.text.secondary,
              }}
            >
              No recent activity yet
            </Text>
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: colors.text.tertiary,
              }}
            >
              Start by creating your first objective or task
            </Text>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}