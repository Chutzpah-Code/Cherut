'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Button, Group, Center, Loader, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Plus, Settings2, Archive } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { KanbanList } from '../../components/KanbanList';
import { TaskModal } from '../../components/TaskModal';
import { ManageBoardModal } from './ManageBoardModal';
import { ArchivedTasksModal } from './ArchivedTasksModal';
import { Task, UpdateTaskDto } from '@/lib/api/services/tasks';
import {
  useUpdateTask,
  useDeleteTask,
  useToggleArchive,
  useStartTimeTracking,
  usePauseTimeTracking,
  useStopTimeTracking,
  useToggleChecklistItem,
  useCreateTask,
} from '@/hooks/useTasks';
import { useBoardKanban, useCreateColumn } from '@/hooks/useBoards';

interface BoardKanbanViewProps {
  boardId: string;
}

export function BoardKanbanView({ boardId }: BoardKanbanViewProps) {
  const t = useTranslations('tasks.kanbanView');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [manageOpened, setManageOpened] = useState(false);
  const [archivedOpened, setArchivedOpened] = useState(false);

  const queryClient = useQueryClient();
  const { data: kanbanColumns, isLoading } = useBoardKanban(boardId);

  const createTask = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const archiveMutation = useToggleArchive();
  const startTrackingMutation = useStartTimeTracking();
  const pauseTrackingMutation = usePauseTimeTracking();
  const stopTrackingMutation = useStopTimeTracking();
  const toggleChecklistMutation = useToggleChecklistItem();
  const createColumn = useCreateColumn();

  const handleAddTask = useCallback(
    (columnId: string, title: string) => {
      const col = kanbanColumns?.find((c) => c.id === columnId);
      const maxOrder = col?.tasks?.length
        ? Math.max(...col.tasks.map((t) => t.order ?? 0)) + 1
        : 0;
      createTask.mutate({ title, boardId, columnId, status: 'todo', priority: 'medium', order: maxOrder });
    },
    [boardId, createTask, kanbanColumns]
  );

  const handleAddColumn = () => {
    const nextOrder = kanbanColumns ? kanbanColumns.length : 0;
    createColumn.mutate({
      boardId,
      dto: { name: 'New List', order: nextOrder },
    });
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" color="#4686FE" />
      </Center>
    );
  }

  if (!kanbanColumns || kanbanColumns.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed" size="sm">{t('noLists')}</Text>
          <Button
            leftSection={<Plus size={16} />}
            onClick={handleAddColumn}
            loading={createColumn.isPending}
            radius={10}
            style={{ backgroundColor: '#4686FE' }}
          >
            {t('addList')}
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <style>{`
        .board-scroll::-webkit-scrollbar { height: 8px; }
        .board-scroll::-webkit-scrollbar-track { background: transparent; }
        .board-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        .board-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>

      <Group gap={isMobile ? 6 : 'sm'} mb="sm" wrap="nowrap">
        <Button
          variant="light"
          leftSection={<Settings2 size={14} />}
          onClick={() => setManageOpened(true)}
          radius={8}
          size={isMobile ? 'xs' : 'sm'}
          px={isMobile ? 8 : undefined}
          style={{ color: '#42526E', backgroundColor: '#F4F5F7', fontWeight: 500 }}
        >
          {isMobile ? t('manageBoardShort') : t('manageBoard')}
        </Button>
        <Button
          variant="subtle"
          leftSection={<Plus size={14} />}
          onClick={handleAddColumn}
          loading={createColumn.isPending}
          radius={8}
          size={isMobile ? 'xs' : 'sm'}
          px={isMobile ? 8 : undefined}
          style={{ color: '#6B778C', fontWeight: 500 }}
        >
          {isMobile ? t('addAnotherListShort') : t('addAnotherList')}
        </Button>
        <Button
          variant="subtle"
          leftSection={<Archive size={14} />}
          onClick={() => setArchivedOpened(true)}
          radius={8}
          size={isMobile ? 'xs' : 'sm'}
          px={isMobile ? 8 : undefined}
          style={{ color: '#6B778C', fontWeight: 500 }}
        >
          {isMobile ? t('archivedTasksLinkShort') : t('archivedTasksLink')}
        </Button>
      </Group>

      <Box
        className="board-scroll"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          // +32px vs. the pre-Surface values, accounting for the page's
          // wrapping Surface (apps/web/components/ui/Surface.tsx) now adding
          // its own 16px top + 16px bottom padding around this view, and the
          // toolbar row above the columns.
          height: isMobile ? 'calc(100dvh - 249px)' : 'calc(100dvh - 274px)',
          paddingBottom: 16,
          marginLeft: isMobile ? -4 : 0,
          marginRight: isMobile ? -4 : 0,
        }}
      >
        <Group
          align="flex-start"
          wrap="nowrap"
          gap="md"
          style={{ minWidth: 'max-content', height: '100%', padding: '4px 2px 16px' }}
        >
          {kanbanColumns.map((col) => (
            <Box key={col.id} style={{ width: isMobile ? 260 : 272, flexShrink: 0, height: '100%' }}>
              <KanbanList
                id={col.id}
                title={col.name}
                tasks={col.tasks}
                onTaskClick={(task) => { setSelectedTask(task); setModalOpened(true); }}
                onAddTask={handleAddTask}
                onToggleComplete={(taskId) => {
                  const task = kanbanColumns.flatMap((c) => c.tasks).find((t) => t.id === taskId);
                  if (!task) return;
                  const newStatus = task.status === 'done' ? 'todo' : 'done';

                  queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
                    if (!old) return old;
                    return old.map((col: any) => ({
                      ...col,
                      tasks: col.tasks.map((t: any) =>
                        t.id === taskId ? { ...t, status: newStatus } : t
                      ),
                    }));
                  });

                  updateMutation.mutate(
                    { id: taskId, dto: { status: newStatus } },
                    {
                      onError: () => {
                        queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
                      },
                    }
                  );
                }}
                onEditTask={(task) => { setSelectedTask(task); setModalOpened(true); }}
              />
            </Box>
          ))}
        </Group>
      </Box>

      <ManageBoardModal
        boardId={boardId}
        columns={kanbanColumns}
        opened={manageOpened}
        onClose={() => setManageOpened(false)}
      />

      <ArchivedTasksModal
        boardId={boardId}
        opened={archivedOpened}
        onClose={() => setArchivedOpened(false)}
        onSelectTask={(task) => {
          setArchivedOpened(false);
          setSelectedTask(task);
          setModalOpened(true);
        }}
      />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          columnName={kanbanColumns.find((c) => c.tasks.some((t) => t.id === selectedTask.id))?.name}
          opened={modalOpened}
          onClose={() => { setModalOpened(false); setSelectedTask(null); }}
          onSave={(id, dto: UpdateTaskDto) => updateMutation.mutate({ id, dto })}
          onDelete={(id) => { deleteMutation.mutate(id); setModalOpened(false); setSelectedTask(null); }}
          onArchive={(id) => archiveMutation.mutate(id)}
          onStartTimeTracking={(id) => startTrackingMutation.mutate(id)}
          onPauseTimeTracking={(id, trackingId) => pauseTrackingMutation.mutate({ id, trackingId })}
          onStopTimeTracking={(id, trackingId) => stopTrackingMutation.mutate({ id, trackingId })}
          onToggleChecklistItem={(taskId, itemId) => toggleChecklistMutation.mutate({ id: taskId, checklistItemId: itemId })}
        />
      )}
    </>
  );
}
