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
  Box,
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
          Are you sure you want to delete this value? This action cannot be undone.
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
            You have unsaved changes. Are you sure you want to cancel?
          </Text>
        ),
        labels: { confirm: 'Discard', cancel: 'Keep Editing' },
        confirmProps: {
          color: 'red',
          style: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          },
        },
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
          Values
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
          Define and align with your core personal values
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
          New Value
        </Button>
      </Box>

      {/* Values Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {values?.map((value) => {
          const IconComponent = getIconForValue(value.title);
          return (
          <Card
            key={value.id}
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
                <IconComponent size={24} />
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
                  {value.title}
                </Text>
                {value.shortDescription && (
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
                    {value.shortDescription}
                  </Text>
                )}
              </div>
            </Group>

            {value.behaviors && (
              <div style={{ marginBottom: '16px' }}>
                <Text
                  mb="xs"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                  }}
                >
                  Reinforcing Behaviors:
                </Text>
                <Text
                  lineClamp={3}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  {value.behaviors}
                </Text>
              </div>
            )}

            <Stack gap="sm" mt="lg" pt="lg" style={{ borderTop: '1px solid #CCCCCC' }}>
              <Group gap="sm" grow>
                <Button
                  variant="outline"
                  leftSection={<Edit2 size={16} />}
                  onClick={() => handleEdit(value)}
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
                  onClick={() => handleDelete(value.id)}
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
            </Stack>
          </Card>
        );
      })}
      </SimpleGrid>

      {values?.length === 0 && (
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
              No values defined yet
            </Text>
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666666',
                lineHeight: '20px',
              }}
            >
              Start defining your core values to guide your decisions and actions
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
              Create your first value
            </Button>
          </Stack>
        </Card>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCancel}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            {editingValue ? 'Edit Value' : 'New Value'}
          </Text>
        }
        size="md"
        fullScreen={false}
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
              label="Title"
              placeholder="e.g., Honesty, Growth, Family"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              withAsterisk
              error={!formData.title.trim() && formData.title !== '' ? 'Title is required' : null}
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
                error: {
                  fontFamily: 'Inter, sans-serif',
                  color: '#dc2626',
                },
              }}
            />

            <TextInput
              label="Short Description"
              placeholder="Brief description of this value..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
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
              label="Reinforcing Behaviors"
              placeholder="Describe specific behaviors, actions, or practices that reinforce this value..."
              value={formData.behaviors}
              onChange={(e) => setFormData({ ...formData, behaviors: e.target.value })}
              rows={4}
              autosize
              maxRows={8}
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
                onClick={handleCancel}
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
                {editingValue ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}