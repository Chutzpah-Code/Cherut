'use client';

import { useState, Suspense } from 'react';
import { Title, Text, Stack, Box, Alert } from '@mantine/core';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { KanbanView } from './components/KanbanView';
import { ViewSwitcher, TaskView } from './components/ViewSwitcher';
import { OptimizedLoader } from '@/components/ui/OptimizedLoader';
import { TaskFilter as TaskFilterType } from './components/TaskFilter';

export default function TasksPage() {
  const [currentView, setCurrentView] = useState<TaskView>('kanban');
  const [currentFilter, setCurrentFilter] = useState<TaskFilterType>('active');

  return (
    <Stack
      gap="xl"
      style={{
        position: 'relative',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <Box>
        <Title
          order={1}
          mb="xs"
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.02em',
          }}
        >
          Tasks
        </Title>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '24px',
          }}
        >
          Manage your tasks with drag & drop Kanban board, calendar and time tracking
        </Text>
      </Box>

      {/* Content based on view */}
      {currentView === 'kanban' && (
        <Suspense fallback={<OptimizedLoader text="Loading tasks..." variant="skeleton" lines={4} />}>
          <KanbanView
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />
        </Suspense>
      )}

      {currentView === 'calendar' && (
        <Alert
          icon={<CalendarIcon size={20} />}
          radius={16}
          style={{
            backgroundColor: 'rgba(70, 134, 254, 0.08)',
            border: '1px solid rgba(70, 134, 254, 0.2)',
          }}
          styles={{
            icon: {
              color: '#4686FE',
            },
            wrapper: {
              alignItems: 'flex-start',
            },
          }}
        >
          <Text
            mb="xs"
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Calendar View - Coming Soon!
          </Text>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666666',
              lineHeight: '20px',
            }}
          >
            View your tasks organized by due date in a calendar format. Track deadlines and plan your
            schedule effectively.
          </Text>
        </Alert>
      )}

      {currentView === 'timetracker' && (
        <Alert
          icon={<Clock size={20} />}
          radius={16}
          style={{
            backgroundColor: 'rgba(70, 134, 254, 0.08)',
            border: '1px solid rgba(70, 134, 254, 0.2)',
          }}
          styles={{
            icon: {
              color: '#4686FE',
            },
            wrapper: {
              alignItems: 'flex-start',
            },
          }}
        >
          <Text
            mb="xs"
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Time Tracker View - Coming Soon!
          </Text>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666666',
              lineHeight: '20px',
            }}
          >
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
