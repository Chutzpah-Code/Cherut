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
  Box,
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
          Are you sure you want to delete this life area? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
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
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  return (
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
            fontSize: '32px',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.02em',
          }}
        >
          Life Areas
        </Title>
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '24px',
          }}
        >
          Manage the key areas of your life
        </Text>
      </Box>

      {/* Add Button */}
      <Box>
        <Button
          leftSection={<Plus size={20} />}
          onClick={handleNew}
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
          New Life Area
        </Button>
      </Box>

      {/* Life Areas Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {lifeAreas?.map((area) => (
          <Card
            key={area.id}
            shadow="none"
            padding="xl"
            radius={16}
            style={{
              background: 'white',
              border: '1px solid #CCCCCC',
              transition: 'all 0.2s ease',
            }}
            styles={{
              root: {
                '&:hover': {
                  borderColor: '#4686FE',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              },
            }}
          >
            <Group mb="lg" wrap="nowrap">
              <ThemeIcon
                size={48}
                radius={12}
                style={{
                  background: '#F5F5F5',
                  color: '#4686FE',
                  border: 'none',
                }}
              >
                <TrendingUp size={24} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  {area.name}
                </Text>
                {area.description && (
                  <Text
                    lineClamp={2}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '20px',
                    }}
                  >
                    {area.description}
                  </Text>
                )}
              </div>
            </Group>

            <Group gap="sm" mt="lg" pt="lg" style={{ borderTop: '1px solid #CCCCCC' }}>
              <Button
                variant="outline"
                leftSection={<Edit2 size={16} />}
                onClick={() => handleEdit(area)}
                fullWidth
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#CCCCCC',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      color: '#4686FE',
                    },
                  },
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => handleDelete(area.id)}
                fullWidth
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    },
                  },
                }}
              >
                Delete
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {lifeAreas?.length === 0 && (
        <Card
          shadow="none"
          padding="xl"
          radius={16}
          style={{
            background: '#F5F5F5',
            border: '1px solid #CCCCCC',
          }}
        >
          <Stack align="center" gap="lg">
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                color: '#666666',
              }}
            >
              No life areas yet
            </Text>
            <Button
              variant="outline"
              onClick={handleNew}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: '#4686FE',
                color: '#4686FE',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                background: 'white',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(70, 134, 254, 0.08)',
                  },
                },
              }}
            >
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
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            {editingArea ? 'Edit Life Area' : 'New Life Area'}
          </Text>
        }
        size="md"
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <TextInput
              label="Name"
              placeholder="e.g., Health & Fitness"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              withAsterisk
              size="md"
              radius={8}
              styles={{
                label: {
                  fontFamily: 'Inter, sans-serif',
                  color: '#000000',
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: '14px',
                },
                input: {
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: 'white',
                  border: '1px solid #CCCCCC',
                  color: '#000000',
                  height: '48px',
                  fontSize: '16px',
                  '&::placeholder': {
                    color: '#999999',
                  },
                  '&:focus': {
                    borderColor: '#4686FE',
                    boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                  },
                },
              }}
            />

            <Textarea
              label="Description"
              placeholder="Describe this life area..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              radius={8}
              styles={{
                label: {
                  fontFamily: 'Inter, sans-serif',
                  color: '#000000',
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: '14px',
                },
                input: {
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: 'white',
                  border: '1px solid #CCCCCC',
                  color: '#000000',
                  fontSize: '16px',
                  '&::placeholder': {
                    color: '#999999',
                  },
                  '&:focus': {
                    borderColor: '#4686FE',
                    boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                  },
                },
              }}
            />

            <Group justify="flex-end" mt="lg">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingArea(null);
                }}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#CCCCCC',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      color: '#4686FE',
                    },
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#4686FE',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  height: '48px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#3366E5',
                    },
                  },
                }}
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
