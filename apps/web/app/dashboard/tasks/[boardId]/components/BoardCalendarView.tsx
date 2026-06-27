'use client';

import { useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventDropArg } from '@fullcalendar/interaction';
import { Box, Center, Loader, Text } from '@mantine/core';
import { useBoardKanban } from '@/hooks/useBoards';
import { useUpdateTask } from '@/hooks/useTasks';

interface BoardCalendarViewProps {
  boardId: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#0052CC',
  in_progress: '#E56910',
  done: '#216E4E',
};

export function BoardCalendarView({ boardId }: BoardCalendarViewProps) {
  const { data: columns, isLoading } = useBoardKanban(boardId);
  const updateTask = useUpdateTask();

  const events = useMemo(() => {
    if (!columns) return [];
    return columns
      .flatMap((col) => col.tasks)
      .filter((t) => !!t.dueDate && !t.archived)
      .map((t) => ({
        id: t.id,
        title: t.title,
        date: t.dueDate,
        allDay: true,
        backgroundColor: STATUS_COLORS[t.status] ?? '#0052CC',
        borderColor: STATUS_COLORS[t.status] ?? '#0052CC',
        textColor: '#ffffff',
      }));
  }, [columns]);

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      const newDate = info.event.startStr;
      updateTask.mutate(
        { id: info.event.id, dto: { dueDate: newDate } },
        { onError: () => info.revert() },
      );
    },
    [updateTask],
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
        <Text size="sm" c="dimmed">No tasks in this board yet.</Text>
      </Center>
    );
  }

  const tasksWithDates = columns.flatMap((c) => c.tasks).filter((t) => t.dueDate);
  if (tasksWithDates.length === 0) {
    return (
      <Center h={400}>
        <Text size="sm" c="dimmed">No tasks have a due date yet. Add a due date to a task to see it here.</Text>
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
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        events={events}
        editable
        eventDrop={handleEventDrop}
        height="calc(100dvh - 200px)"
        dayMaxEvents={4}
        eventDisplay="block"
        firstDay={1}
      />
    </Box>
  );
}
