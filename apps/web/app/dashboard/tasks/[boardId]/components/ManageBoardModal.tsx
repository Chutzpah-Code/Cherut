'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Modal,
  Stack,
  Box,
  Group,
  TextInput,
  Select,
  ActionIcon,
  Text,
  Avatar,
  Button,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Trash2, UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayMove } from '@dnd-kit/sortable';
import { modals } from '@mantine/modals';
import { useAuth } from '@/contexts/AuthContext';
import {
  useUpdateColumn,
  useDeleteColumn,
  useBoard,
  useAddBoardMember,
  useRemoveBoardMember,
  useUpdateBoardMemberRole,
  useTransferBoardOwnership,
} from '@/hooks/useBoards';
import { useArchivedTasksByBoard } from '@/hooks/useTasks';
import { KanbanColumn, BoardRole } from '@/lib/api/services/boards';
import { Task, tasksApi } from '@/lib/api/services/tasks';

const ROLE_ORDER: Record<BoardRole, number> = { owner: 0, editor: 1, collaborator: 2 };

function MembersSection({ boardId, isMobile }: { boardId: string; isMobile: boolean }) {
  const t = useTranslations('tasks.manageBoard');
  const { user } = useAuth();
  const { data: board } = useBoard(boardId);
  const addMember = useAddBoardMember();
  const removeMember = useRemoveBoardMember();
  const updateRole = useUpdateBoardMemberRole();
  const transferOwnership = useTransferBoardOwnership();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'collaborator'>('collaborator');
  const [inviteError, setInviteError] = useState<string | null>(null);

  if (!board) return null;

  const myRole: BoardRole =
    board.userId === user?.uid
      ? 'owner'
      : (board.members.find((m) => m.uid === user?.uid)?.role ?? 'collaborator');

  const canInvite = myRole === 'owner' || myRole === 'editor';
  const canManage = myRole === 'owner';

  const sortedMembers = [...board.members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);

  const roleLabel = (role: BoardRole) =>
    role === 'owner' ? t('roleOwner') : role === 'editor' ? t('roleEditor') : t('roleCollaborator');

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteError(null);
    addMember.mutate(
      { boardId, email, role: inviteRole },
      {
        onSuccess: () => setInviteEmail(''),
        onError: (err: any) => {
          const status = err?.response?.status;
          if (status === 404) setInviteError(t('inviteErrorNotFound'));
          else if (status === 400 && err?.response?.data?.message?.includes('already')) {
            setInviteError(t('inviteErrorDuplicate'));
          } else {
            setInviteError(t('inviteErrorGeneric'));
          }
        },
      },
    );
  };

  const handleRemove = (email: string) => {
    modals.openConfirmModal({
      title: t('removeMemberConfirmTitle'),
      children: <Text size="sm" c="dimmed">{t('removeMemberConfirmBody', { email })}</Text>,
      labels: { confirm: t('confirm'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => removeMember.mutate({ boardId, email }),
    });
  };

  const handleRoleChange = (uid: string, role: 'editor' | 'collaborator') => {
    updateRole.mutate({ boardId, uid, role });
  };

  const handleTransfer = (uid: string, email: string) => {
    modals.openConfirmModal({
      title: t('transferOwnershipConfirmTitle'),
      children: <Text size="sm" c="dimmed">{t('transferOwnershipConfirmBody', { email })}</Text>,
      labels: { confirm: t('transferOwnershipConfirmButton'), cancel: t('cancel') },
      onConfirm: () => transferOwnership.mutate({ boardId, newOwnerUid: uid }),
    });
  };

  return (
    <Box>
      <Text fw={600} size="sm" mb="xs">{t('membersTitle')}</Text>

      <Stack gap="xs" mb={canInvite ? 'sm' : 0}>
        {sortedMembers.map((member) => {
          const isOwnerRow = member.uid === board.userId;
          const editable = canManage && !isOwnerRow;

          return (
            <Group key={member.uid} justify="space-between" wrap={isMobile ? 'wrap' : 'nowrap'} gap="xs">
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: isMobile ? '1 1 100%' : 1 }}>
                <Avatar size="sm" radius="xl" color="blue">
                  {member.email.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" truncate style={{ flexShrink: 1, minWidth: 0 }}>
                  {member.email}
                  {member.uid === user?.uid && t('youSuffix')}
                </Text>
                {editable && (
                  <Tooltip label={t('removeMemberTooltip')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemove(member.email)}
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              {/* The role indicator is always the same Select component, at
                  the same size, whether it's editable (owner managing
                  someone else) or a read-only display (the owner's own row,
                  or any row seen by a non-owner) — this is what keeps every
                  row's role rectangle the same size and column-aligned with
                  the role/invite selects below, instead of a plain Text
                  next to a bordered Select looking mismatched. */}
              {editable ? (
                <Select
                  data={[
                    { value: 'editor', label: t('roleEditor') },
                    { value: 'collaborator', label: t('roleCollaborator') },
                    { value: 'owner', label: t('roleOwner') },
                  ]}
                  value={member.role}
                  onChange={(v) => {
                    if (v === 'owner') handleTransfer(member.uid, member.email);
                    else if (v === 'editor' || v === 'collaborator') handleRoleChange(member.uid, v);
                  }}
                  size="sm"
                  style={{ width: isMobile ? undefined : 288, flex: isMobile ? 1 : undefined }}
                  comboboxProps={{ width: 200 }}
                  allowDeselect={false}
                />
              ) : (
                <Select
                  data={[{ value: member.role, label: roleLabel(member.role) }]}
                  value={member.role}
                  disabled
                  size="sm"
                  style={{ width: isMobile ? undefined : 288, flex: isMobile ? 1 : undefined }}
                  allowDeselect={false}
                />
              )}
            </Group>
          );
        })}
      </Stack>

      {canInvite && (
        <Group gap="xs" wrap={isMobile ? 'wrap' : 'nowrap'} align="flex-start">
          <Stack gap={4} style={{ flex: isMobile ? '1 1 100%' : 1 }}>
            <TextInput
              placeholder={t('inviteEmailPlaceholder')}
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.currentTarget.value); setInviteError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              size="sm"
            />
            {inviteError && <Text size="xs" c="red">{inviteError}</Text>}
          </Stack>
          <Select
            data={[
              { value: 'editor', label: t('roleEditor') },
              { value: 'collaborator', label: t('roleCollaborator') },
            ]}
            value={inviteRole}
            onChange={(v) => v && (v === 'editor' || v === 'collaborator') && setInviteRole(v)}
            size="sm"
            style={{ width: isMobile ? undefined : 150, flex: isMobile ? 1 : undefined }}
            comboboxProps={{ width: 160 }}
            allowDeselect={false}
          />
          <Button
            leftSection={<UserPlus size={14} />}
            onClick={handleInvite}
            loading={addMember.isPending}
            disabled={!inviteEmail.trim()}
            size="sm"
            style={{ backgroundColor: '#4686FE', flexShrink: 0 }}
          >
            {t('inviteButton')}
          </Button>
        </Group>
      )}
    </Box>
  );
}

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

  // Deleting a column only cascade-deletes its active tasks — archived ones
  // are spared (see boards.service.ts's deleteColumn) so they can be
  // restored later. The confirmation dialog below tells the user both
  // things separately: how many active tasks are about to be permanently
  // deleted, and how many archived tasks in the list will be kept.
  const { data: archivedTasks } = useArchivedTasksByBoard(boardId, opened);
  const archivedCountByColumn = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of archivedTasks ?? []) {
      if (!task.columnId) continue;
      counts[task.columnId] = (counts[task.columnId] ?? 0) + 1;
    }
    return counts;
  }, [archivedTasks]);

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

  const handleDeleteColumn = (columnId: string, columnName: string, taskCount: number, archivedCount: number) => {
    modals.openConfirmModal({
      title: t('deleteList'),
      children: (
        <Stack gap={6}>
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
          {archivedCount > 0 && (
            <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666666', lineHeight: '18px' }}>
              {t('deleteConfirmArchivedPreserved', { count: archivedCount })}
            </Text>
          )}
        </Stack>
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
        <MembersSection boardId={boardId} isMobile={!!isMobile} />

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
                  onClick={() => handleDeleteColumn(col.id, col.name, col.tasks.length, archivedCountByColumn[col.id] ?? 0)}
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
