'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Title, Text, Button, Stack, Box, SimpleGrid, Loader, Center, Card, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Plus, Images } from 'lucide-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  useVisionBoardItems,
  useCreateVisionBoardItem,
  useUpdateVisionBoardItem,
  useDeleteVisionBoardItem,
  useUploadImage,
  useReorderVisionBoard,
  useToggleArchiveVisionBoard,
} from '@/hooks/useVisionBoard';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { VisionBoardCard } from './components/VisionBoardCard';
import { Surface } from '@/components/ui/Surface';
import { VisionBoardModal } from './components/VisionBoardModal';
import { CreateVisionBoardModal } from './components/CreateVisionBoardModal';
import { ArchivedVisionBoardGrid } from './components/ArchivedVisionBoardGrid';
import { VisionBoardLightbox } from './components/VisionBoardLightbox';

type VisionBoardFilterType = 'active' | 'archived';

export default function VisionBoardPage() {
  const t = useTranslations('visionBoard.page');
  const tLightbox = useTranslations('visionBoard.lightbox');
  const [currentFilter, setCurrentFilter] = useState<VisionBoardFilterType>('active');

  const { data: activeItems, isLoading: activeLoading } = useVisionBoardItems(false);
  // Lazy-load archived items — only fetch when the user switches to the archived tab
  const { data: archivedItems, isLoading: archivedLoading } = useVisionBoardItems(true, currentFilter === 'archived');
  const createMutation = useCreateVisionBoardItem();
  const updateMutation = useUpdateVisionBoardItem();
  const deleteMutation = useDeleteVisionBoardItem();
  const uploadMutation = useUploadImage();
  const toggleArchiveMutation = useToggleArchiveVisionBoard();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Choose the right data source based on current filter
  const items = currentFilter === 'active' ? activeItems : archivedItems;
  const isLoading = currentFilter === 'active' ? activeLoading : archivedLoading;

  // Handler para upload de imagem
  const handleUploadImage = async (file: File) => {
    const result = await uploadMutation.mutateAsync(file);
    return result;
  };

  // Handler para criar item
  const handleCreate = async (data: {
    title: string;
    description?: string;
    fullDescription?: string;
    imageUrl: string;
    dueDate?: string;
  }) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        order: items?.length || 0,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating vision board item:', error);
      // Don't close modal on error - let user fix the issue
      throw error;
    }
  };

  // Handler para abrir modal de edição
  const handleEdit = (item: VisionBoardItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  // Handler para salvar edição
  const handleSave = async (
    id: string,
    updates: {
      title: string;
      description?: string;
      fullDescription?: string;
      dueDate?: string;
      imageUrl?: string;
      completed?: boolean;
    },
  ) => {
    try {
      await updateMutation.mutateAsync({ id, dto: updates });
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating vision board item:', error);
      // Don't close modal on error - let user fix the issue
      throw error;
    }
  };

  // Handler para arquivar/desarquivar
  const handleArchive = async (item: VisionBoardItem) => {
    try {
      await toggleArchiveMutation.mutateAsync(item.id);
      notifications.show({
        title: t('success'),
        message: t('itemArchived', { title: item.title }),
        color: 'green',
      });
    } catch (error) {
      console.error('Error archiving vision board item:', error);
      notifications.show({
        title: t('error'),
        message: t('archiveFailed'),
        color: 'red',
      });
    }
  };

  // Handler para desarquivar
  const handleUnarchive = async (item: VisionBoardItem) => {
    try {
      await toggleArchiveMutation.mutateAsync(item.id);
      notifications.show({
        title: t('success'),
        message: t('itemRestored', { title: item.title }),
        color: 'green',
      });
    } catch (error) {
      console.error('Error unarchiving vision board item:', error);
      notifications.show({
        title: t('error'),
        message: t('restoreFailed'),
        color: 'red',
      });
    }
  };

  // Handler para deletar
  const handleDelete = (id: string) => {
    const title = currentFilter === 'archived' ? t('deletePermanentlyTitle') : t('deleteTitle');
    const message = currentFilter === 'archived'
      ? t('deleteBodyPermanent')
      : t('deleteBody');

    modals.openConfirmModal({
      title,
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
          {message}
        </Text>
      ),
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: {
        color: 'red',
        style: {
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        },
      },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          setEditModalOpen(false);
          setEditingItem(null);
        } catch (error) {
          console.error('Error deleting vision board item:', error);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  return (
    <Surface p={{ base: 'md', sm: 'xl' }}>
    <Stack
      gap="xl"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      {/* Header */}
      <Box>
        <Title
          order={1}
          mb="xs"
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </Title>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '24px',
            marginBottom: '24px',
          }}
        >
          {currentFilter === 'active' ? t('subtitleActive') : t('subtitleArchived')}
        </Text>

        <Group mb="lg" gap="sm">
          <Button
            leftSection={<Plus size={20} />}
            onClick={() => setIsCreateModalOpen(true)}
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              background: '#4686FE',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              height: '48px',
              padding: '0 24px',
            }}
            styles={{
              root: {
                '&:hover': {
                  background: '#3366E5',
                },
              },
            }}
          >
            {t('addGoal')}
          </Button>
          {!!items?.length && (
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
          <Group
            gap={0}
            style={{
              background: '#EEEEEE',
              borderRadius: '40px',
              height: '48px',
              padding: '4px',
              flexShrink: 0,
            }}
          >
            <Button
              onClick={() => setCurrentFilter('active')}
              radius={40}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                height: '40px',
                padding: '0 20px',
                border: 'none',
                ...(currentFilter === 'active' ? {
                  background: '#4686FE',
                  color: 'white',
                } : {
                  background: 'transparent',
                  color: '#6D6D6D',
                }),
              }}
              styles={{
                root: {
                  '&:hover': {
                    ...(currentFilter === 'active' ? {} : {
                      background: 'rgba(70, 134, 254, 0.1)',
                    }),
                  },
                },
              }}
            >
              {t('active')}
            </Button>
            <Button
              onClick={() => setCurrentFilter('archived')}
              radius={40}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                height: '40px',
                padding: '0 20px',
                border: 'none',
                ...(currentFilter === 'archived' ? {
                  background: '#4686FE',
                  color: 'white',
                } : {
                  background: 'transparent',
                  color: '#6D6D6D',
                }),
              }}
              styles={{
                root: {
                  '&:hover': {
                    ...(currentFilter === 'archived' ? {} : {
                      background: 'rgba(70, 134, 254, 0.1)',
                    }),
                  },
                },
              }}
            >
              {t('archived')}
            </Button>
          </Group>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#6D6D6D',
            }}
          >
            {currentFilter === 'active'
              ? t('activeCount', { count: activeItems?.length || 0 })
              : t('archivedCount', { count: archivedItems?.length || 0 })
            }
          </Text>
        </Group>
      </Box>

      {/* Content based on filter */}
      {currentFilter === 'active' ? (
        // Active Items View
        !activeItems || activeItems.length === 0 ? (
          <Card
            padding="xl"
            radius={16}
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <Center>
              <Stack align="center" gap="md">
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#6B7280',
                  }}
                >
                  {t('emptyTitle')}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#6B7280',
                    lineHeight: '20px',
                    maxWidth: 400,
                  }}
                >
                  {t('emptyHint')}
                </Text>
                <Button
                  leftSection={<Plus size={16} />}
                  onClick={() => setIsCreateModalOpen(true)}
                  radius={8}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: '#4686FE',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                    height: '48px',
                    padding: '0 24px',
                  }}
                >
                  {t('addFirstGoal')}
                </Button>
              </Stack>
            </Center>
          </Card>
        ) : (
          <SimpleGrid
            cols={{
              base: 1, // Mobile: 1 coluna
              xs: 2, // Small tablets: 2 colunas
              sm: 2, // Tablets: 2 colunas
              md: 3, // Desktop: 3 colunas
              lg: 4, // Large desktop: 4 colunas
            }}
            spacing="xl"
          >
            {activeItems.map((item) => (
              <VisionBoardCard
                key={item.id}
                item={item}
                onClick={() => handleEdit(item)}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </SimpleGrid>
        )
      ) : (
        // Archived Items View
        <ArchivedVisionBoardGrid
          items={archivedItems || []}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
          onView={handleEdit}
        />
      )}

      {/* Create Modal */}
      <CreateVisionBoardModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        onUploadImage={handleUploadImage}
        isCreating={createMutation.isPending}
      />

      {/* Edit Modal */}
      {editingItem && (
        <VisionBoardModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingItem(null);
          }}
          item={editingItem}
          onSave={handleSave}
          onDelete={handleDelete}
          onUploadImage={handleUploadImage}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* Fullscreen gallery */}
      <VisionBoardLightbox
        items={items ?? []}
        initialIndex={0}
        opened={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </Stack>
    </Surface>
  );
}
