'use client';

import { useRouter } from 'next/navigation';
import { Target, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, Title, Text, Button, Group, Stack, SimpleGrid, Loader, ThemeIcon } from '@mantine/core';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useHabits } from '@/hooks/useHabits';

export default function DashboardPage() {
  const router = useRouter();
  const { data: objectives, isLoading: objectivesLoading } = useObjectives();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: lifeAreas, isLoading: lifeAreasLoading } = useLifeAreas();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  // Calculate stats
  const activeObjectives = objectives?.filter((obj) => obj.status !== 'completed').length || 0;
  const openTasks = tasks?.filter((task) => task.status !== 'done').length || 0;
  const lifeAreasCount = lifeAreas?.length || 0;
  const activeHabits = habits?.filter((habit) => habit.isActive).length || 0;

  const stats = [
    { name: 'Active Objectives', value: activeObjectives, icon: Target, color: 'blue' },
    { name: 'Open Tasks', value: openTasks, icon: CheckSquare, color: 'green' },
    { name: 'Life Areas', value: lifeAreasCount, icon: TrendingUp, color: 'violet' },
    { name: 'Active Habits', value: activeHabits, icon: Calendar, color: 'orange' },
  ];

  // Get recent activity from all sources
  const getRecentActivity = () => {
    const activities: Array<{ type: string; title: string; time: string; color: string }> = [];

    // Add recent objectives
    objectives?.slice(0, 3).forEach((obj) => {
      activities.push({
        type: 'Objective',
        title: obj.title,
        time: new Date(obj.createdAt).toLocaleDateString(),
        color: 'text-blue-400',
      });
    });

    // Add recent tasks
    tasks?.slice(0, 3).forEach((task) => {
      activities.push({
        type: 'Task',
        title: task.title,
        time: new Date(task.createdAt).toLocaleDateString(),
        color: 'text-green-400',
      });
    });

    // Add recent habits
    habits?.slice(0, 3).forEach((habit) => {
      activities.push({
        type: 'Habit',
        title: habit.title,
        time: new Date(habit.createdAt).toLocaleDateString(),
        color: 'text-orange-400',
      });
    });

    // Sort by creation date and take top 5
    return activities.slice(0, 5);
  };

  const recentActivity = getRecentActivity();
  const isLoading = objectivesLoading || tasksLoading || lifeAreasLoading || habitsLoading;

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2" mb="xs">Dashboard</Title>
        <Text c="dimmed" size="sm">Overview of your personal excellence journey</Text>
      </div>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} shadow="sm" padding="lg" withBorder>
              <Group justify="space-between" mb="md">
                <ThemeIcon size="xl" radius="md" color={stat.color}>
                  <Icon size={24} />
                </ThemeIcon>
              </Group>
              <Text size="sm" c="dimmed" fw={500}>{stat.name}</Text>
              <Title order={2} mt="xs">
                {isLoading ? <Loader size="sm" /> : stat.value}
              </Title>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card shadow="sm" padding="lg" withBorder>
        <Title order={3} size="h4" mb="md">Quick Actions</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Button
            leftSection={<Target size={20} />}
            onClick={() => router.push('/dashboard/objectives')}
            fullWidth
          >
            New Objective
          </Button>
          <Button
            leftSection={<CheckSquare size={20} />}
            onClick={() => router.push('/dashboard/tasks')}
            variant="light"
            fullWidth
          >
            Add Task
          </Button>
          <Button
            leftSection={<Calendar size={20} />}
            onClick={() => router.push('/dashboard/habits')}
            variant="light"
            fullWidth
          >
            Track Habit
          </Button>
        </SimpleGrid>
      </Card>

      {/* Recent Activity */}
      <Card shadow="sm" padding="lg" withBorder>
        <Title order={3} size="h4" mb="md">Recent Activity</Title>
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : recentActivity.length > 0 ? (
          <Stack gap="md">
            {recentActivity.map((activity, index) => (
              <Card key={index} padding="md" withBorder style={{ cursor: 'pointer' }}>
                <Group gap="md" wrap="nowrap">
                  <ThemeIcon variant="light" size="lg" color="gray">
                    <Clock size={20} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text size="sm" fw={500} c={activity.color.replace('text-', '').replace('-400', '')}>
                        {activity.type}
                      </Text>
                      <Text size="xs" c="dimmed">•</Text>
                      <Text size="xs" c="dimmed">{activity.time}</Text>
                    </Group>
                    <Text size="sm" mt={4}>{activity.title}</Text>
                  </div>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Stack align="center" py="xl">
            <Text c="dimmed">No recent activity yet</Text>
            <Text size="sm" c="dimmed">Start by creating your first objective or task</Text>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
