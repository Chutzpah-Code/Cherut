'use client';

import { Modal, Stack, Box, Group, Text, Center, Loader, Button } from '@mantine/core';
import { Archive, AlertCircle } from 'lucide-react';
import { useArchivedTasksByBoard } from '@/hooks/useTasks';
import { Task } from '@/lib/api/services/tasks';

interface ArchivedTasksModalProps {
  boardId: string;
  opened: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ArchivedTasksModal({ boardId, opened, onClose, onSelectTask }: ArchivedTasksModalProps) {
  const { data: tasks, isLoading, isError, error, refetch, isFetching } = useArchivedTasksByBoard(boardId, opened);
  const sorted = [...(tasks ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} style={{ fontFamily: 'Inter Display, sans-serif' }}>Archived tasks</Text>}
      size="lg"
      radius="lg"
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" color="#4686FE" />
        </Center>
      ) : isError ? (
        <Center py="xl">
          <Stack align="center" gap={4}>
            <AlertCircle size={28} color="#B91C1C" />
            <Text size="sm" fw={500} c="red">Couldn't load archived tasks</Text>
            <Text size="xs" c="dimmed" ta="center" maw={320}>
              {(error as any)?.response?.status
                ? `Server responded with ${(error as any).response.status}.`
                : (error as any)?.message || 'Something went wrong.'}
            </Text>
            <Button size="xs" variant="light" mt={6} loading={isFetching} onClick={() => refetch()}>
              Try again
            </Button>
          </Stack>
        </Center>
      ) : sorted.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap={4}>
            <Archive size={28} color="#94A3B8" />
            <Text size="sm" c="dimmed">No archived tasks</Text>
            <Text size="xs" c="dimmed">Tasks you archive from this board will show up here.</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={6}>
          {sorted.map((task) => (
            <Box
              key={task.id}
              onClick={() => onSelectTask(task)}
              style={{
                border: '1px solid #E2E5EB',
                borderRadius: 8,
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
                  {task.title}
                </Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {formatUpdatedAt(task.updatedAt)}
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
