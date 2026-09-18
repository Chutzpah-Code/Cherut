'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Box, Group, TextInput, Select, ActionIcon, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayMove } from '@dnd-kit/sortable';
import { modals } from '@mantine/modals';
import { useUpdateColumn, useDeleteColumn } from '@/hooks/useBoards';
import { KanbanColumn } from '@/lib/api/services/boards';
import { Task, tasksApi } from '@/lib/api/services/tasks';

interface ManageBoardModalProps {
  boardId: string;
  columns: KanbanColumn[];
  opened: boolean;
  onClose: () => void;
}

function computeMidpointOrder<T extends { order: number }>(reordered: T[], newIndex: number): number {
  const prevOrder = newIndex > 0 ? reordered[newIndex - 1].order : undefined;
  const nextOrder = newIndex < reordered.length - 1 ? reordered[newIndex + 1].order : undefined;
  if (prevOrder !== undefined && nextOrder !== undefined) return (prevOrder + nextOrder) / 2;
  if (prevOrder !== undefined) return prevOrder + 1;
  if (nextOrder !== undefined) return nextOrder - 1;
  return 0;
}

function ColumnNameInput({ name, onCommit }: { name: string; onCommit: (newName: string) => void }) {
  const [value, setValue] = useState(name);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onCommit(trimmed);
    else setValue(name);
  };

  return (
    <TextInput
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setValue(name); e.currentTarget.blur(); }
      }}
      size="sm"
      style={{ flex: 1 }}
    />
  );
}

export function ManageBoardModal({ boardId, columns, opened, onClose }: ManageBoardModalProps) {
  const t = useTranslations('tasks.manageBoard');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const queryClient = useQueryClient();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  const updateOrderMutation = useMutation({
    mutationFn: ({ taskId, newOrder, newColumnId }: { taskId: string; newOrder: number; newColumnId: string }) =>
      tasksApi.updateOrder(taskId, { newOrder, newColumnId }),
    onMutate: async ({ taskId, newOrder, newColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'kanban'] });
      const previous = queryClient.getQueryData(['boards', boardId, 'kanban']);

      queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
        if (!old) return old;
        let taskToMove: any = null;
        const newCols = old.map((col: any) => {
          const idx = col.tasks.findIndex((t: any) => t.id === taskId);
          if (idx === -1) return col;
          taskToMove = { ...col.tasks[idx], order: newOrder };
          return { ...col, tasks: col.tasks.filter((_: any, i: number) => i !== idx) };
        });
        if (!taskToMove) return old;
        return newCols.map((col: any) => {
          if (col.id !== newColumnId) return col;
          const updated = [...col.tasks, taskToMove].sort((a: any, b: any) => a.order - b.order);
          return { ...col, tasks: updated };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['boards', boardId, 'kanban'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'], refetchType: 'none' });
    },
  });

  const handleRenameColumn = (columnId: string, name: string) => {
    updateColumn.mutate({ boardId, columnId, dto: { name } });
  };

  const handleMoveColumn = (columnId: string, newIndex: number) => {
    const oldIndex = columns.findIndex((c) => c.id === columnId);
    if (oldIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(columns, oldIndex, newIndex);
    const newOrder = computeMidpointOrder(reordered, newIndex);

    queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
      if (!old) return old;
      const oi = old.findIndex((c: any) => c.id === columnId);
      if (oi === -1) return old;
      const moved = arrayMove(old, oi, newIndex);
      return moved.map((c: any) => (c.id === columnId ? { ...c, order: newOrder } : c));
    });

    updateColumn.mutate({ boardId, columnId, dto: { order: newOrder } });
  };

  const handleDeleteColumn = (columnId: string, columnName: string, taskCount: number) => {
    modals.openConfirmModal({
      title: t('deleteList'),
      children: (
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '20px',
          }}
        >
          {taskCount > 0
            ? t('deleteConfirmWithTasks', { name: columnName, count: taskCount })
            : t('deleteConfirmSimple', { name: columnName })}
        </Text>
      ),
      labels: { confirm: t('confirm'), cancel: t('cancel') },
      confirmProps: {
        color: 'red',
        style: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
      },
      onConfirm: () => deleteColumn.mutate({ boardId, columnId }),
    });
  };

  const handleMoveTaskToColumn = (task: Task, currentColumnId: string, newColumnId: string) => {
    if (newColumnId === currentColumnId) return;
    const targetCol = columns.find((c) => c.id === newColumnId);
    if (!targetCol) return;
    const maxOrder = targetCol.tasks.length ? Math.max(...targetCol.tasks.map((t) => t.order ?? 0)) + 1 : 0;
    updateOrderMutation.mutate({ taskId: task.id, newOrder: maxOrder, newColumnId });
  };

  const handleMoveTaskPosition = (task: Task, columnId: string, newIndex: number) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;
    const oldIndex = col.tasks.findIndex((t) => t.id === task.id);
    if (oldIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(col.tasks, oldIndex, newIndex);
    const newOrder = computeMidpointOrder(reordered, newIndex);
    updateOrderMutation.mutate({ taskId: task.id, newOrder, newColumnId: columnId });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} style={{ fontFamily: 'Inter Display, sans-serif' }}>{t('title')}</Text>}
      size="xl"
      radius={isMobile ? 0 : 'lg'}
      fullScreen={isMobile}
    >
      <Stack gap="lg">
        {columns.map((col, index) => (
          <Box key={col.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
              <Box style={{ flex: isMobile ? '1 1 100%' : 1, minWidth: 140 }}>
                <ColumnNameInput name={col.name} onCommit={(name) => handleRenameColumn(col.id, name)} />
              </Box>
              <Group gap="xs" wrap="nowrap" style={{ flex: isMobile ? '1 1 100%' : undefined }}>
                <Select
                  data={columns.map((_, i) => ({ value: String(i), label: t('position', { n: i + 1 }) }))}
                  value={String(index)}
                  onChange={(v) => v !== null && handleMoveColumn(col.id, Number(v))}
                  size="sm"
                  style={{ width: isMobile ? undefined : 130, flex: isMobile ? 1 : undefined }}
                  allowDeselect={false}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  disabled={columns.length <= 1}
                  onClick={() => handleDeleteColumn(col.id, col.name, col.tasks.length)}
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Group>
            </Group>

            <Stack gap={6}>
              {col.tasks.length === 0 ? (
                <Text size="xs" c="dimmed">{t('noTasks')}</Text>
              ) : (
                col.tasks.map((task, taskIndex) => (
                  <Group key={task.id} justify="space-between" wrap="wrap" gap="xs">
                    <Text size="sm" style={{ flex: '1 1 100%' }} lineClamp={1}>
                      {task.title}
                    </Text>
                    <Select
                      data={columns.map((c) => ({ value: c.id, label: c.name }))}
                      value={col.id}
                      onChange={(v) => v !== null && handleMoveTaskToColumn(task, col.id, v)}
                      size="xs"
                      style={{ flex: isMobile ? '1 1 auto' : undefined, width: isMobile ? undefined : 150 }}
                      allowDeselect={false}
                    />
                    <Select
                      data={col.tasks.map((_, i) => ({ value: String(i), label: `#${i + 1}` }))}
                      value={String(taskIndex)}
                      onChange={(v) => v !== null && handleMoveTaskPosition(task, col.id, Number(v))}
                      size="xs"
                      style={{ width: 80, flexShrink: 0 }}
                      allowDeselect={false}
                    />
                  </Group>
                ))
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
}
