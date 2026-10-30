'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Title, Text, Button, Stack, Box, SimpleGrid, Loader, Center, Card, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Plus, Images, Play } from 'lucide-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  useVisionBoardItems,
  useDeleteVisionBoardItem,
  useToggleArchiveVisionBoard,
  usePracticeSummary,
} from '@/hooks/useVisionBoard';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { VisionBoardCard } from './components/VisionBoardCard';
import { Surface } from '@/components/ui/Surface';
import { EditDrawer } from './components/EditDrawer';
import { ArchivedVisionBoardGrid } from './components/ArchivedVisionBoardGrid';
import { VisionBoardLightbox } from './components/VisionBoardLightbox';
import { SessionSelectBar } from './components/SessionSelectBar';
import { SessionPlayer } from './components/SessionPlayer';

type VisionBoardFilterType = 'active' | 'completed' | 'archived';

export default function VisionBoardPage() {
  const t = useTranslations('visionBoard.page');
  const tLightbox = useTranslations('visionBoard.lightbox');
  const [currentFilter, setCurrentFilter] = useState<VisionBoardFilterType>('active');

  const { data: nonArchivedItems, isLoading: nonArchivedLoading } = useVisionBoardItems(false);
  // Lazy-load archived items — only fetch when the user switches to the archived tab
  const { data: archivedItems, isLoading: archivedLoading } = useVisionBoardItems(true, currentFilter === 'archived');
  const { data: practiceSummary } = usePracticeSummary();
  const deleteMutation = useDeleteVisionBoardItem();
  const toggleArchiveMutation = useToggleArchiveVisionBoard();

  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState<'meta' | 'visualization'>('meta');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sessionItems, setSessionItems] = useState<VisionBoardItem[] | null>(null);

  const activeItems = useMemo(() => (nonArchivedItems ?? []).filter((i) => !i.completed), [nonArchivedItems]);
  const completedItems = useMemo(() => (nonArchivedItems ?? []).filter((i) => !!i.completed), [nonArchivedItems]);

  const isLoading = currentFilter === 'archived' ? archivedLoading : nonArchivedLoading;

  const handleCreateNew = () => {
    setEditingItem(null);
    setEditInitialTab('meta');
    setEditDrawerOpen(true);
  };

  const handleItemCreated = (item: VisionBoardItem) => {
    // Keeps the drawer open, now in edit mode, for the item just created.
    setEditingItem(item);
  };

  const handleEdit = (item: VisionBoardItem, tab: 'meta' | 'visualization' = 'meta') => {
    setEditingItem(item);
    setEditInitialTab(tab);
    setEditDrawerOpen(true);
  };

  const handleVisualize = (item: VisionBoardItem) => {
    setSessionItems([item]);
  };

  const handleArchive = async (item: VisionBoardItem) => {
    try {
      await toggleArchiveMutation.mutateAsync(item.id);
      notifications.show({ title: t('success'), message: t('itemArchived', { title: item.title }), color: 'green' });
    } catch (error) {
      console.error('Error archiving vision board item:', error);
      notifications.show({ title: t('error'), message: t('archiveFailed'), color: 'red' });
    }
  };

  const handleUnarchive = async (item: VisionBoardItem) => {
    try {
      await toggleArchiveMutation.mutateAsync(item.id);
      notifications.show({ title: t('success'), message: t('itemRestored', { title: item.title }), color: 'green' });
    } catch (error) {
      console.error('Error unarchiving vision board item:', error);
      notifications.show({ title: t('error'), message: t('restoreFailed'), color: 'red' });
    }
  };

  const handleDelete = (id: string) => {
    const title = currentFilter === 'archived' ? t('deletePermanentlyTitle') : t('deleteTitle');
    const message = currentFilter === 'archived' ? t('deleteBodyPermanent') : t('deleteBody');

    modals.openConfirmModal({
      title,
      children: <Text size="sm" c="dimmed">{message}</Text>,
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          setEditDrawerOpen(false);
          setEditingItem(null);
        } catch (error) {
          console.error('Error deleting vision board item:', error);
        }
      },
    });
  };

  const toggleSelect = (item: VisionBoardItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(activeItems.map((i) => i.id)));
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const beginSession = () => {
    const items = activeItems.filter((i) => selectedIds.has(i.id));
    if (items.length === 0) return;
    setSessionItems(items);
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const estimatedMinutes = useMemo(
    () => activeItems.filter((i) => selectedIds.has(i.id)).reduce((sum, i) => sum + (i.plannedPracticeDurationMinutes ?? 10), 0),
    [activeItems, selectedIds],
  );

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  const listForFilter = currentFilter === 'active' ? activeItems : currentFilter === 'completed' ? completedItems : archivedItems ?? [];

  return (
    <Surface p={{ base: 'md', sm: 'xl' }}>
    <Stack gap="xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Box>
        <Title order={1} mb="xs" style={{ fontFamily: 'Inter Display, sans-serif', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 700, color: '#000000', letterSpacing: '-0.02em' }}>
          {t('title')}
        </Title>
        <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#666666', lineHeight: '24px', marginBottom: '24px' }}>
          {currentFilter === 'active' ? t('subtitleActive') : currentFilter === 'completed' ? t('subtitleCompleted') : t('subtitleArchived')}
        </Text>

        <Group mb="lg" gap="sm">
          <Button
            leftSection={<Plus size={20} />}
            onClick={handleCreateNew}
            radius={8}
            style={{ fontFamily: 'Inter, sans-serif', background: '#4686FE', border: 'none', fontSize: '16px', fontWeight: 600, color: 'white', height: '48px', padding: '0 24px' }}
          >
            {t('addGoal')}
          </Button>
          <Button
            leftSection={<Play size={18} />}
            variant="outline"
            onClick={() => setSelectionMode(true)}
            disabled={selectionMode || activeItems.length === 0}
            radius={8}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, height: '48px', whiteSpace: 'nowrap' }}
          >
            {t('startSession')}
          </Button>
          {!!nonArchivedItems?.length && (
            <Tooltip label={tLightbox('openGallery')}>
              <ActionIcon
                aria-label={tLightbox('openGallery')}
                onClick={() => setLightboxOpen(true)}
                radius={8}
                variant="default"
                style={{ width: 48, height: 48, border: '1px solid #E0E0E0' }}
              >
                <Images size={20} color="#666666" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap={0} style={{ background: '#EEEEEE', borderRadius: '40px', height: '48px', padding: '4px', flexShrink: 0 }}>
            {(['active', 'completed', 'archived'] as const).map((f) => (
              <Button
                key={f}
                onClick={() => setCurrentFilter(f)}
                radius={40}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  height: '40px',
                  padding: '0 20px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  ...(currentFilter === f ? { background: '#4686FE', color: 'white' } : { background: 'transparent', color: '#6D6D6D' }),
                }}
              >
                {t(f)}
              </Button>
            ))}
          </Group>
          <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6D6D6D' }}>
            {currentFilter === 'active'
              ? t('activeCount', { count: activeItems.length })
              : currentFilter === 'completed'
                ? t('completedCount', { count: completedItems.length })
                : t('archivedCount', { count: archivedItems?.length || 0 })}
          </Text>
        </Group>
      </Box>

      {currentFilter === 'archived' ? (
        <ArchivedVisionBoardGrid
          items={archivedItems || []}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
          onView={(item) => handleEdit(item, 'meta')}
        />
      ) : listForFilter.length === 0 ? (
        <Card padding="xl" radius={16} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <Center>
            <Stack align="center" gap="md">
              <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>
                {currentFilter === 'completed' ? t('emptyCompletedTitle') : t('emptyTitle')}
              </Text>
              {currentFilter === 'active' && (
                <>
                  <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280', lineHeight: '20px', maxWidth: 400 }}>
                    {t('emptyHint')}
                  </Text>
                  <Button
                    leftSection={<Plus size={16} />}
                    onClick={handleCreateNew}
                    radius={8}
                    style={{ fontFamily: 'Inter, sans-serif', background: '#4686FE', border: 'none', fontSize: '16px', fontWeight: 600, color: 'white', height: '48px', padding: '0 24px' }}
                  >
                    {t('addFirstGoal')}
                  </Button>
                </>
              )}
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }} spacing="xl">
          {listForFilter.map((item) => (
            <VisionBoardCard
              key={item.id}
              item={item}
              practiceSummary={practiceSummary?.[item.id]}
              onVisualize={handleVisualize}
              onEdit={handleEdit}
              onArchive={currentFilter === 'active' ? handleArchive : undefined}
              onDelete={handleDelete}
              selectionMode={selectionMode}
              selected={selectedIds.has(item.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </SimpleGrid>
      )}

      <EditDrawer
        opened={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditingItem(null); }}
        item={editingItem}
        initialTab={editInitialTab}
        onDelete={handleDelete}
        onVisualizeNow={(item) => { setEditDrawerOpen(false); handleVisualize(item); }}
        onCreated={handleItemCreated}
      />

      <VisionBoardLightbox items={listForFilter} initialIndex={0} opened={lightboxOpen} onClose={() => setLightboxOpen(false)} />

      {selectionMode && (
        <SessionSelectBar
          selectedCount={selectedIds.size}
          estimatedMinutes={estimatedMinutes}
          onSelectAll={selectAll}
          onCancel={cancelSelection}
          onBeginSession={beginSession}
        />
      )}

      <SessionPlayer
        opened={!!sessionItems}
        onClose={() => setSessionItems(null)}
        items={sessionItems ?? []}
      />
    </Stack>
    </Surface>
  );
}
