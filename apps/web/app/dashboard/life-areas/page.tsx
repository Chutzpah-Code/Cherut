'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Modal,
  TextInput,
  Textarea,
  ThemeIcon,
  Loader,
  Center,
  ActionIcon,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useLifeAreas, useCreateLifeArea, useUpdateLifeArea, useDeleteLifeArea } from '@/hooks/useLifeAreas';
import { CreateLifeAreaDto, LifeArea } from '@/lib/api/services/lifeAreas';

export default function LifeAreasPage() {
  const { data: lifeAreas, isLoading } = useLifeAreas();
  const createMutation = useCreateLifeArea();
  const updateMutation = useUpdateLifeArea();
  const deleteMutation = useDeleteLifeArea();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [formData, setFormData] = useState<CreateLifeAreaDto>({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingArea) {
        await updateMutation.mutateAsync({ id: editingArea.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingArea(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving life area:', error);
    }
  };

  const handleEdit = (area: LifeArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Life Area',
      children: <Text size="sm">Are you sure you want to delete this life area? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch (error) {
          console.error('Error deleting life area:', error);
        }
      },
    });
  };

  const handleNew = () => {
    setEditingArea(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1} size="h2" mb="xs">Life Areas</Title>
          <Text c="dimmed" size="sm">Manage the key areas of your life</Text>
        </div>
        <Button leftSection={<Plus size={20} />} onClick={handleNew}>
          New Life Area
        </Button>
      </Group>

      {/* Life Areas Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {lifeAreas?.map((area) => (
          <Card key={area.id} shadow="sm" padding="lg" withBorder>
            <Group mb="md" wrap="nowrap">
              <ThemeIcon size="xl" radius="md" color="violet" variant="light">
                <TrendingUp size={24} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text fw={600} size="lg">{area.name}</Text>
                {area.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>{area.description}</Text>
                )}
              </div>
            </Group>

            <Group gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              <Button
                variant="light"
                leftSection={<Edit2 size={16} />}
                onClick={() => handleEdit(area)}
                fullWidth
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => handleDelete(area.id)}
                fullWidth
                size="sm"
              >
                Delete
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {lifeAreas?.length === 0 && (
        <Card shadow="sm" padding="xl" withBorder>
          <Stack align="center" gap="md">
            <Text c="dimmed">No life areas yet</Text>
            <Button variant="light" onClick={handleNew}>
              Create your first life area
            </Button>
          </Stack>
        </Card>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingArea(null);
        }}
        title={editingArea ? 'Edit Life Area' : 'New Life Area'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="e.g., Health & Fitness"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              withAsterisk
            />

            <Textarea
              label="Description"
              placeholder="Describe this life area..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingArea(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingArea ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
