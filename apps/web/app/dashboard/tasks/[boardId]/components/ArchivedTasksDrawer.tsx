'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Stack, Box, Group, Text, Center, Loader, Button, ActionIcon, ThemeIcon } from '@mantine/core';
import { Archive, AlertCircle, X } from 'lucide-react';
import { useArchivedTasksByBoard } from '@/hooks/useTasks';
import { Task } from '@/lib/api/services/tasks';

interface ArchivedTasksDrawerProps {
  boardId: string;
  opened: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

function formatUpdatedAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ArchivedTasksDrawer({ boardId, opened, onClose, onSelectTask }: ArchivedTasksDrawerProps) {
  const t = useTranslations('tasks.archivedTasks');
  const locale = useLocale();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');
  const { data: tasks, isLoading, isError, error, refetch, isFetching } = useArchivedTasksByBoard(boardId, opened);
  const sorted = [...(tasks ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 420}
      withOverlay={!isDesktop}
      closeOnClickOutside={!isDesktop}
      withCloseButton={false}
      padding={0}
      styles={{
        content: {
          maxWidth: '100vw',
          height: isFullScreen ? '100dvh' : undefined,
          display: 'flex',
          flexDirection: 'column',
        },
        body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box px="md" py="sm" style={{ borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon size={40} radius={8} variant="light" color="gray">
              <Archive size={20} />
            </ThemeIcon>
            <Text size="sm" fw={700} style={{ fontFamily: 'Inter Display, sans-serif' }}>{t('title')}</Text>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={t('close')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" color="#4686FE" />
          </Center>
        ) : isError ? (
          <Center py="xl">
            <Stack align="center" gap={4}>
              <AlertCircle size={28} color="#B91C1C" />
              <Text size="sm" fw={500} c="red">{t('loadError')}</Text>
              <Text size="xs" c="dimmed" ta="center" maw={320}>
                {(error as any)?.response?.status
                  ? t('serverError', { status: (error as any).response.status })
                  : (error as any)?.message || t('genericError')}
              </Text>
              <Button size="xs" variant="light" mt={6} loading={isFetching} onClick={() => refetch()}>
                {t('tryAgain')}
              </Button>
            </Stack>
          </Center>
        ) : sorted.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap={4}>
              <Archive size={28} color="#94A3B8" />
              <Text size="sm" c="dimmed">{t('empty')}</Text>
              <Text size="xs" c="dimmed">{t('emptyHint')}</Text>
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
                    {formatUpdatedAt(task.updatedAt, locale)}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
