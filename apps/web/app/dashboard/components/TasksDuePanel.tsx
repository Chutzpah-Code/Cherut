'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Checkbox, Group, Stack, Text, Menu, ActionIcon, TextInput, Button } from '@mantine/core';
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { RowsSkeleton } from './skeletons';
import { useUndoableDelete } from './useUndoableDelete';
import { useRowKeyNav } from './useRowKeyNav';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

export function TasksDuePanel() {
  const today = localToday();
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const undoableDelete = useUndoableDelete<string>((id) => deleteTask.mutate(id), { label: 'Task' });
  const { containerRef, onKeyDown } = useRowKeyNav<HTMLDivElement>();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const due = useMemo(() => {
    const startOfToday = new Date(`${today}T00:00:00`).getTime();
    return (tasks as any[])
      .filter((t) => t.dueDate && t.status !== 'done' && !t.archived && t.dueDate <= today && !undoableDelete.isPending(t.id))
      .map((t) => {
        const dueMs = new Date(`${t.dueDate}T00:00:00`).getTime();
        const daysOverdue = Math.floor((startOfToday - dueMs) / 86_400_000);
        return { ...t, daysOverdue };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [tasks, today, undoableDelete]);

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate ?? '');
  };

  const saveEdit = (id: string) => {
    updateTask.mutate({ id, dto: { title: editTitle.trim() || undefined, dueDate: editDueDate || undefined } });
    setEditingId(null);
  };

  return (
    <Box id="tasks-due" style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={2}>
        <Text style={LABEL}>Tasks due</Text>
        <Link href="/dashboard/tasks" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
          View all tasks →
        </Link>
      </Group>
      <Text size="xs" c="dimmed" mb={12}>Sorted by how late they are</Text>

      {isLoading ? (
        <RowsSkeleton rows={3} />
      ) : due.length === 0 ? (
        <Text size="sm" c="dimmed">Nothing due. Clear day.</Text>
      ) : (
        <Stack gap={4} ref={containerRef} onKeyDown={onKeyDown}>
          {due.map((task) => {
            const overdue = task.daysOverdue > 0;
            const editing = editingId === task.id;
            return (
              <Box key={task.id}>
                <Group
                  wrap="nowrap"
                  align="flex-start"
                  gap={10}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 6,
                    background: overdue ? '#FEF2F2' : 'transparent',
                  }}
                >
                  <Checkbox
                    size="sm"
                    mt={2}
                    data-row-nav
                    disabled={updateTask.isPending}
                    onChange={() => updateTask.mutate({ id: task.id, dto: { status: 'done' } })}
                    aria-label={`Mark "${task.title}" as done`}
                  />
                  <Text
                    style={{
                      fontSize: 12, fontWeight: 700, flexShrink: 0, width: 22, marginTop: 2,
                      color: overdue ? '#B91C1C' : '#94A3B8', fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {overdue ? `${task.daysOverdue}d` : '—'}
                  </Text>

                  {editing ? (
                    <Group gap={6} wrap="wrap" style={{ flex: 1 }}>
                      <TextInput
                        size="xs"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 140 }}
                      />
                      <TextInput
                        type="date"
                        size="xs"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.currentTarget.value)}
                        style={{ width: 140 }}
                      />
                      <Button size="xs" onClick={() => saveEdit(task.id)}>Save</Button>
                      <Button size="xs" variant="default" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <>
                      <Text
                        size="sm"
                        fw={500}
                        style={{ color: '#0F172A', flex: 1, minWidth: 0, textWrap: 'pretty' as any }}
                      >
                        {task.title}
                      </Text>
                      <span style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 7px',
                        flexShrink: 0, letterSpacing: '0.03em', whiteSpace: 'nowrap',
                        background: overdue ? '#FEE2E2' : '#EFF6FF',
                        color: overdue ? '#B91C1C' : '#0052CC',
                      }}>
                        {overdue ? 'OVERDUE' : 'TODAY'}
                      </span>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm" aria-label={`Actions for "${task.title}"`}>
                            <MoreHorizontal size={16} color="#64748B" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<Pencil size={14} />} onClick={() => startEdit(task)}>
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            href={task.boardId ? `/dashboard/tasks/${task.boardId}` : '/dashboard/tasks'}
                            leftSection={<ExternalLink size={14} />}
                          >
                            Open
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<Trash2 size={14} />}
                            onClick={() => undoableDelete.remove(task.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </>
                  )}
                </Group>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
