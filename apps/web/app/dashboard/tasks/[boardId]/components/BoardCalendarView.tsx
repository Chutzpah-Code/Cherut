'use client';

import { useMemo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg } from '@fullcalendar/core';
import { Box, Center, Loader, Text } from '@mantine/core';
import { useBoardKanban } from '@/hooks/useBoards';
import {
  useUpdateTask,
  useDeleteTask,
  useToggleArchive,
  useStartTimeTracking,
  usePauseTimeTracking,
  useStopTimeTracking,
  useToggleChecklistItem,
} from '@/hooks/useTasks';
import { Task, UpdateTaskDto } from '@/lib/api/services/tasks';
import { TaskModal } from '../../components/TaskModal';

interface BoardCalendarViewProps {
  boardId: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#0052CC',
  in_progress: '#E56910',
  done: '#216E4E',
};

export function BoardCalendarView({ boardId }: BoardCalendarViewProps) {
  const t = useTranslations('tasks.calendar');
  const { data: columns, isLoading } = useBoardKanban(boardId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const archiveTask = useToggleArchive();
  const startTracking = useStartTimeTracking();
  const pauseTracking = usePauseTimeTracking();
  const stopTracking = useStopTimeTracking();
  const toggleChecklistItem = useToggleChecklistItem();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const events = useMemo(() => {
    if (!columns) return [];
    return columns
      .flatMap((col) => col.tasks)
      .filter((t) => !!t.dueDate && !t.archived)
      .map((t) => ({
        id: t.id,
        title: t.title,
        // dueDate is a full ISO datetime (see TaskModal's own `.split('T')[0]`
        // for the date picker) — passing it whole made FullCalendar parse it
        // as a UTC instant and bucket it under the previous day in any
        // timezone behind UTC. Stripping the time makes it a plain calendar
        // date with no timezone conversion.
        date: t.dueDate!.split('T')[0],
        allDay: true,
        backgroundColor: STATUS_COLORS[t.status] ?? '#0052CC',
        borderColor: STATUS_COLORS[t.status] ?? '#0052CC',
        textColor: '#ffffff',
      }));
  }, [columns]);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const task = columns?.flatMap((c) => c.tasks).find((t) => t.id === info.event.id);
      if (!task) return;
      setSelectedTask(task);
      setModalOpened(true);
    },
    [columns],
  );

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="sm" color="blue" />
      </Center>
    );
  }

  if (!columns || columns.flatMap((c) => c.tasks).length === 0) {
    return (
      <Center h={400}>
        <Text size="sm" c="dimmed">{t('noTasks')}</Text>
      </Center>
    );
  }

  const tasksWithDates = columns.flatMap((c) => c.tasks).filter((t) => t.dueDate);
  if (tasksWithDates.length === 0) {
    return (
      <Center h={400}>
        <Text size="sm" c="dimmed">{t('noDueDates')}</Text>
      </Center>
    );
  }

  return (
    <Box>
      <style>{`
        .fc { font-family: 'Inter', -apple-system, sans-serif; }
        .fc .fc-toolbar-title { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #0F172A; }
        .fc .fc-button { font-size: 13px; font-weight: 500; border-radius: 8px !important; padding: 6px 12px !important; text-transform: capitalize; }
        .fc .fc-button-primary { background-color: #0F172A !important; border-color: #0F172A !important; }
        .fc .fc-button-primary:hover { background-color: #1E293B !important; border-color: #1E293B !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #0052CC !important; border-color: #0052CC !important; }
        .fc .fc-daygrid-day-number { font-size: 12px; color: #64748B; padding: 4px 6px; }
        .fc .fc-col-header-cell-cushion { font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 0; text-decoration: none; }
        .fc .fc-event { border-radius: 4px; font-size: 12px; padding: 2px 5px; cursor: pointer; }
        .fc .fc-event-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fc .fc-today-button { font-size: 13px; }
        .fc .fc-daygrid-day.fc-day-today { background: rgba(0, 82, 204, 0.04) !important; }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { color: #0052CC; font-weight: 700; }
        .fc .fc-more-link { font-size: 11px; color: #64748B; }
        .fc-toolbar-chunk { display: flex; align-items: center; gap: 6px; }
        .fc .fc-toolbar { margin-bottom: 16px; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #E2E8F0; }
        .fc-theme-standard .fc-scrollgrid { border-color: #E2E8F0; }

        /* Below ~640px the single-row toolbar (prev/next/today, title,
           month/week) has no room and gets visually crushed. Stack it into
           three centered rows instead of letting it compress or overflow. */
        @media (max-width: 640px) {
          .fc .fc-toolbar { flex-direction: column; gap: 10px; }
          .fc-toolbar-chunk { justify-content: center; width: 100%; }
          .fc .fc-toolbar-title { font-size: 16px; text-align: center; }
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        events={events}
        eventClick={handleEventClick}
        // +32px vs. the pre-Surface value, accounting for the page's
        // wrapping Surface (apps/web/components/ui/Surface.tsx) now adding
        // its own 16px top + 16px bottom padding around this view.
        height="calc(100dvh - 232px)"
        dayMaxEvents={4}
        eventDisplay="block"
        firstDay={1}
      />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          columnName={columns?.find((c) => c.tasks.some((t) => t.id === selectedTask.id))?.name}
          opened={modalOpened}
          onClose={() => { setModalOpened(false); setSelectedTask(null); }}
          onSave={(id, dto: UpdateTaskDto) => updateTask.mutate({ id, dto })}
          onDelete={(id) => { deleteTask.mutate(id); setModalOpened(false); setSelectedTask(null); }}
          onArchive={(id) => archiveTask.mutate(id)}
          onStartTimeTracking={(id) => startTracking.mutate(id)}
          onPauseTimeTracking={(id, trackingId) => pauseTracking.mutate({ id, trackingId })}
          onStopTimeTracking={(id, trackingId) => stopTracking.mutate({ id, trackingId })}
          onToggleChecklistItem={(taskId, itemId) => toggleChecklistItem.mutate({ id: taskId, checklistItemId: itemId })}
        />
      )}
    </Box>
  );
}
