'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Heart, Star, Shield, Compass, Lightbulb, Target, Zap, Gem, Crown } from 'lucide-react';
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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from '@/hooks/useValues';
import { CreateValueDto, Value } from '@/lib/api/services/values';

const valueIcons = [Heart, Star, Shield, Compass, Lightbulb, Target, Zap, Gem, Crown];

const getIconForValue = (title: string) => {
  // Simple hash function to consistently assign icons based on title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % valueIcons.length;
  return valueIcons[index];
};

export default function ValuesPage() {
  const { data: values, isLoading } = useValues();
  const createMutation = useCreateValue();
  const updateMutation = useUpdateValue();
  const deleteMutation = useDeleteValue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [formData, setFormData] = useState<CreateValueDto>({
    title: '',
    shortDescription: '',
    behaviors: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      behaviors: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required title
    if (!formData.title.trim()) {
      notifications.show({
        title: 'Title Required',
        message: 'Please provide a title for your value or cancel.',
        color: 'red',
      });
      return;
    }

    try {
      if (editingValue) {
        await updateMutation.mutateAsync({ id: editingValue.id, dto: formData });
        notifications.show({
          title: 'Value Updated',
          message: 'Your value has been successfully updated.',
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync(formData);
        notifications.show({
          title: 'Value Created',
          message: 'Your value has been successfully created.',
          color: 'green',
        });
      }

      setIsModalOpen(false);
      setEditingValue(null);
      resetForm();
    } catch (error) {
      console.error('Error saving value:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save value. Please try again.',
        color: 'red',
      });
    }
  };

  const handleEdit = (value: Value) => {
    setEditingValue(value);
    setFormData({
      title: value.title,
      shortDescription: value.shortDescription || '',
      behaviors: value.behaviors || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Value',
      children: <Text size="sm">Are you sure you want to delete this value? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          notifications.show({
            title: 'Value Deleted',
            message: 'Your value has been successfully deleted.',
            color: 'green',
          });
        } catch (error) {
          console.error('Error deleting value:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to delete value. Please try again.',
            color: 'red',
          });
        }
      },
    });
  };

  const handleNew = () => {
    setEditingValue(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    if (formData.title.trim() && !editingValue) {
      modals.openConfirmModal({
        title: 'Discard Changes',
        children: <Text size="sm">You have unsaved changes. Are you sure you want to cancel?</Text>,
        labels: { confirm: 'Discard', cancel: 'Keep Editing' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          setIsModalOpen(false);
          setEditingValue(null);
          resetForm();
        },
      });
    } else {
      setIsModalOpen(false);
      setEditingValue(null);
      resetForm();
    }
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
      <Stack gap="md">
        <div>
          <Title order={1} size="h2" mb="xs">Values</Title>
          <Text c="dimmed" size="sm">Define and align with your core personal values</Text>
        </div>
        <Group justify={{ base: "center", sm: "flex-end" }}>
          <Button
            leftSection={<Plus size={20} />}
            onClick={handleNew}
            fullWidth={{ base: true, sm: false }}
          >
            New Value
          </Button>
        </Group>
      </Stack>

      {/* Values Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {values?.map((value) => {
          const IconComponent = getIconForValue(value.title);
          return (
          <Card key={value.id} shadow="sm" padding="lg" withBorder>
            <Group mb="md" wrap="nowrap">
              <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                <IconComponent size={24} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text fw={600} size="lg">{value.title}</Text>
                {value.shortDescription && (
                  <Text size="sm" c="dimmed" lineClamp={2}>{value.shortDescription}</Text>
                )}
              </div>
            </Group>

            {value.behaviors && (
              <div style={{ marginBottom: '16px' }}>
                <Text size="sm" fw={500} mb="xs">Reinforcing Behaviors:</Text>
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {value.behaviors}
                </Text>
              </div>
            )}

            <Stack gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              <Group gap="xs" grow>
                <Button
                  variant="light"
                  leftSection={<Edit2 size={16} />}
                  onClick={() => handleEdit(value)}
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => handleDelete(value.id)}
                  size="sm"
                >
                  Delete
                </Button>
              </Group>
            </Stack>
          </Card>
          );
        })}
      </SimpleGrid>

      {values?.length === 0 && (
        <Card shadow="sm" padding="xl" withBorder>
          <Stack align="center" gap="md">
            <Text c="dimmed">No values defined yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              Start defining your core values to guide your decisions and actions
            </Text>
            <Button variant="light" onClick={handleNew}>
              Create your first value
            </Button>
          </Stack>
        </Card>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCancel}
        title={editingValue ? 'Edit Value' : 'New Value'}
        size={{ base: 'full', sm: 'md' }}
        fullScreen={{ base: true, sm: false }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="e.g., Honesty, Growth, Family"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              withAsterisk
              error={!formData.title.trim() && formData.title !== '' ? 'Title is required' : null}
            />

            <TextInput
              label="Short Description"
              placeholder="Brief description of this value..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />

            <Textarea
              label="Reinforcing Behaviors"
              placeholder="Describe specific behaviors, actions, or practices that reinforce this value..."
              value={formData.behaviors}
              onChange={(e) => setFormData({ ...formData, behaviors: e.target.value })}
              rows={4}
              autosize
              maxRows={8}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingValue ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}