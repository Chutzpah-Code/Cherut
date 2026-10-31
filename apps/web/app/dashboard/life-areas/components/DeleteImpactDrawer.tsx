'use client';

import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Stack, Box, Group, Text, Center, Loader, Button, ActionIcon, ThemeIcon } from '@mantine/core';
import { AlertTriangle, X } from 'lucide-react';
import { useLifeAreaImpact, useDeleteLifeArea } from '@/hooks/useLifeAreas';
import { LifeArea } from '@/lib/api/services/lifeAreas';

interface DeleteImpactDrawerProps {
  area: LifeArea | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteImpactDrawer({ area, onClose, onDeleted }: DeleteImpactDrawerProps) {
  const t = useTranslations('lifeAreas.deleteImpact');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const opened = !!area;
  const { data: impact, isLoading } = useLifeAreaImpact(area?.id ?? '', opened);
  const deleteMutation = useDeleteLifeArea();

  const hasImpact = !!impact && (impact.objectives.count > 0 || impact.habits.count > 0 || impact.tasks.count > 0);

  const handleConfirm = () => {
    if (!area) return;
    deleteMutation.mutate(area.id, {
      onSuccess: () => onDeleted(area.id),
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 440}
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
            <ThemeIcon size={40} radius={8} variant="light" color="red">
              <AlertTriangle size={20} />
            </ThemeIcon>
            <Text size="sm" fw={700} style={{ fontFamily: 'Inter Display, sans-serif' }}>{t('title')}</Text>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={t('cancel')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <Center py="xl">
            <Stack align="center" gap={8}>
              <Loader size="sm" color="red" />
              <Text size="sm" c="dimmed">{t('loading')}</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            <Text size="sm">{t('intro', { name: area?.name ?? '' })}</Text>

            {hasImpact ? (
              <Stack gap="sm">
                {impact!.objectives.count > 0 && (
                  <ImpactSection label={t('objectivesCount', { count: impact!.objectives.count })} items={impact!.objectives.items} />
                )}
                {impact!.habits.count > 0 && (
                  <ImpactSection label={t('habitsCount', { count: impact!.habits.count })} items={impact!.habits.items} />
                )}
                {impact!.tasks.count > 0 && (
                  <ImpactSection label={t('tasksCount', { count: impact!.tasks.count })} items={impact!.tasks.items} />
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">{t('emptyImpact')}</Text>
            )}
          </Stack>
        )}
      </Box>

      <Box
        px="md"
        py="sm"
        style={{ borderTop: '1px solid #E5E7EB', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
            {t('cancel')}
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            loading={deleteMutation.isPending}
            disabled={isLoading}
            radius={8}
            style={{ whiteSpace: 'nowrap' }}
          >
            {t('deleteEverything')}
          </Button>
        </Group>
      </Box>
    </Drawer>
  );
}

function ImpactSection({ label, items }: { label: string; items: { id: string; title: string }[] }) {
  return (
    <Box style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
      <Text size="sm" fw={600} c="red.8" mb={4}>{label}</Text>
      <Stack gap={2}>
        {items.map((item) => (
          <Text key={item.id} size="xs" c="dimmed" truncate>{item.title}</Text>
        ))}
      </Stack>
    </Box>
  );
}
