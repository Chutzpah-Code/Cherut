'use client';

import { useState, Suspense } from 'react';
import { Title, Text, Stack, Box, Alert } from '@mantine/core';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { KanbanView } from './components/KanbanView';
import { ViewSwitcher, TaskView } from './components/ViewSwitcher';
import { OptimizedLoader } from '@/components/ui/OptimizedLoader';

export default function TasksPage() {
  const [currentView, setCurrentView] = useState<TaskView>('kanban');

  return (
    <Stack gap="lg" style={{ position: 'relative' }}>
      {/* Header */}
      <Box>
        <Title order={1} size="h2" mb="xs">
          Tasks
        </Title>
        <Text c="dimmed" size="sm">
          Manage your tasks with drag & drop Kanban board, calendar and time tracking
        </Text>
      </Box>

      {/* Content based on view */}
      {currentView === 'kanban' && (
        <Suspense fallback={<OptimizedLoader text="Loading tasks..." variant="skeleton" lines={4} />}>
          <KanbanView />
        </Suspense>
      )}

      {currentView === 'calendar' && (
        <Alert icon={<CalendarIcon size={20} />} color="blue" variant="light">
          <Text fw={600} mb="xs">
            Calendar View - Coming Soon!
          </Text>
          <Text size="sm">
            View your tasks organized by due date in a calendar format. Track deadlines and plan your
            schedule effectively.
          </Text>
        </Alert>
      )}

      {currentView === 'timetracker' && (
        <Alert icon={<Clock size={20} />} color="violet" variant="light">
          <Text fw={600} mb="xs">
            Time Tracker View - Coming Soon!
          </Text>
          <Text size="sm">
            View and analyze your time tracking data. See how much time you&apos;ve spent on each task and
            optimize your productivity.
          </Text>
        </Alert>
      )}

      {/* Floating View Switcher */}
      <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
    </Stack>
  );
}
