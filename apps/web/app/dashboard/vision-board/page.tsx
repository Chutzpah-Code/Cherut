'use client';

import React, { useState } from 'react';
import { Title, Text, Button, Stack, Box, SimpleGrid, Loader, Center, Alert, Group } from '@mantine/core';
import { Plus, Sparkles } from 'lucide-react';
import { modals } from '@mantine/modals';
import {
  useVisionBoardItems,
  useCreateVisionBoardItem,
  useUpdateVisionBoardItem,
  useDeleteVisionBoardItem,
  useUploadImage,
  useReorderVisionBoard,
} from '@/hooks/useVisionBoard';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { VisionBoardCard } from './components/VisionBoardCard';
import { VisionBoardModal } from './components/VisionBoardModal';
import { CreateVisionBoardModal } from './components/CreateVisionBoardModal';

export default function VisionBoardPage() {
  const { data: items, isLoading } = useVisionBoardItems();
  const createMutation = useCreateVisionBoardItem();
  const updateMutation = useUpdateVisionBoardItem();
  const deleteMutation = useDeleteVisionBoardItem();
  const uploadMutation = useUploadImage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  // Handler para deletar
  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Vision Board Item',
      children: (
        <Text size="sm">
          Are you sure you want to delete this item? This action cannot be undone and the image will
          be permanently deleted.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
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
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} size="h2" mb="xs">
          <Group gap="sm" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Sparkles size={32} />
            My Vision Board
          </Group>
        </Title>
        <Text c="dimmed" size="sm">
          Drag and drop to organize your goals
        </Text>
      </Box>

      {/* Add Button */}
      <Box>
        <Button
          leftSection={<Plus size={20} />}
          onClick={() => setIsCreateModalOpen(true)}
          size="md"
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
        >
          Add Goal
        </Button>
      </Box>

      {/* Grid de Itens */}
      {!items || items.length === 0 ? (
        <Alert
          variant="light"
          color="blue"
          title="Start Your Vision Board"
          icon={<Sparkles size={20} />}
        >
          <Text size="sm" mb="md">
            Create a visual representation of your dreams and goals. Add images that inspire you and
            track your progress towards achieving them!
          </Text>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
          >
            Add Your First Goal
          </Button>
        </Alert>
      ) : (
        <SimpleGrid
          cols={{
            base: 1, // Mobile: 1 coluna
            xs: 2, // Small tablets: 2 colunas
            sm: 2, // Tablets: 2 colunas
            md: 3, // Desktop: 3 colunas
            lg: 4, // Large desktop: 4 colunas
          }}
          spacing="lg"
        >
          {items.map((item) => (
            <VisionBoardCard key={item.id} item={item} onClick={() => handleEdit(item)} />
          ))}
        </SimpleGrid>
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
    </Stack>
  );
}
