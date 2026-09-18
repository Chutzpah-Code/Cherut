'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
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
  Loader,
  Center,
  Box,
  ActionIcon,
  Menu,
  Transition,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from '@/hooks/useValues';
import { Surface } from '@/components/ui/Surface';
import { CreateValueDto, Value } from '@/lib/api/services/values';


export default function ValuesPage() {
  const t = useTranslations('values');
  const { data: values, isLoading } = useValues();
  const createMutation = useCreateValue();
  const updateMutation = useUpdateValue();
  const deleteMutation = useDeleteValue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [expandedBehaviors, setExpandedBehaviors] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CreateValueDto>({
    title: '',
    shortDescription: '',
    behaviors: '',
  });

  // Helper function to truncate text by character count
  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return { text, isTruncated: false };
    return { text: text.substring(0, limit), isTruncated: true };
  };

  // Toggle expanded state for descriptions
  const toggleDescription = (valueId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(valueId)) {
        newSet.delete(valueId);
      } else {
        newSet.add(valueId);
      }
      return newSet;
    });
  };

  // Toggle expanded state for behaviors
  const toggleBehaviors = (valueId: string) => {
    setExpandedBehaviors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(valueId)) {
        newSet.delete(valueId);
      } else {
        newSet.add(valueId);
      }
      return newSet;
    });
  };

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
        title: t('titleRequiredToastTitle'),
        message: t('titleRequiredToastMessage'),
        color: 'red',
      });
      return;
    }

    try {
      if (editingValue) {
        await updateMutation.mutateAsync({ id: editingValue.id, dto: formData });
        notifications.show({
          title: t('valueUpdatedTitle'),
          message: t('valueUpdatedMessage'),
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync(formData);
        notifications.show({
          title: t('valueCreatedTitle'),
          message: t('valueCreatedMessage'),
          color: 'green',
        });
      }

      setIsModalOpen(false);
      setEditingValue(null);
      resetForm();
    } catch (error) {
      console.error('Error saving value:', error);
      notifications.show({
        title: t('error'),
        message: t('saveFailed'),
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
      title: t('deleteTitle'),
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
          {t('deleteBody')}
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
          notifications.show({
            title: t('valueDeletedTitle'),
            message: t('valueDeletedMessage'),
            color: 'green',
          });
        } catch (error) {
          console.error('Error deleting value:', error);
          notifications.show({
            title: t('error'),
            message: t('deleteFailed'),
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
        title: t('discardChangesTitle'),
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
            {t('discardChangesBody')}
          </Text>
        ),
        labels: { confirm: t('discard'), cancel: t('keepEditing') },
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
          }}
        >
          {t('subtitle')}
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
          {t('newValue')}
        </Button>
      </Box>

      {/* Values Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {values?.map((value) => (
          <Card
            key={value.id}
            shadow="none"
            padding="xl"
            radius={16}
            onMouseEnter={() => setHoveredCard(value.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease',
              position: 'relative',
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
            <Group mb="lg" wrap="nowrap" justify="space-between" align="flex-start">
              <div style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '6px',
                    lineHeight: '24px',
                  }}
                >
                  {value.title}
                </Text>
                {value.shortDescription && (() => {
                  const isExpanded = expandedDescriptions.has(value.id);
                  const { text: truncatedText, isTruncated } = truncateText(value.shortDescription, 120);
                  const displayText = isExpanded ? value.shortDescription : truncatedText;

                  return (
                    <div>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#6B7280',
                          lineHeight: '20px',
                        }}
                      >
                        {displayText}{!isExpanded && isTruncated && '...'}
                      </Text>
                      {isTruncated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(value.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4686FE',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '4px',
                            textDecoration: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {isExpanded ? t('showLess') : t('showMore')}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <Menu shadow="md" width={140} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size={32}
                    radius={8}
                    style={{
                      color: hoveredCard === value.id ? '#4B5563' : '#D1D5DB',
                      transition: 'color 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Edit2 size={14} />}
                    onClick={() => handleEdit(value)}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {t('edit')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<Trash2 size={14} />}
                    color="red"
                    onClick={() => handleDelete(value.id)}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {t('delete')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            {value.behaviors && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                <Text
                  mb="sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('reinforcingBehaviors')}
                </Text>
                {(() => {
                  const isExpanded = expandedBehaviors.has(value.id);
                  const { text: truncatedText, isTruncated } = truncateText(value.behaviors, 200);
                  const displayText = isExpanded ? value.behaviors : truncatedText;

                  return (
                    <div>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#6B7280',
                          lineHeight: '20px',
                        }}
                      >
                        {displayText}{!isExpanded && isTruncated && '...'}
                      </Text>
                      {isTruncated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBehaviors(value.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4686FE',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '6px',
                            textDecoration: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {isExpanded ? t('showLess') : t('showMore')}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </Card>
        ))}
      </SimpleGrid>

      {values?.length === 0 && (
        <Card
          shadow="none"
          padding="xl"
          radius={16}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
          }}
        >
          <Stack align="center" gap="lg">
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
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '20px',
              }}
            >
              {t('emptyHint')}
            </Text>
            <Button
              leftSection={<Plus size={16} />}
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
            >
              {t('createFirst')}
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
            {editingValue ? t('editValue') : t('newValue')}
          </Text>
        }
        size="md"
        fullScreen={false}
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85dvh',
            overflow: 'hidden',
          },
          body: {
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
          },
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <Stack gap="lg" py="xs">
              <TextInput
                label={t('titleLabel')}
                placeholder={t('titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                withAsterisk
                error={!formData.title.trim() && formData.title !== '' ? t('titleRequired') : null}
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
                label={t('shortDescription')}
                placeholder={t('shortDescriptionPlaceholder')}
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
                label={t('reinforcingBehaviors')}
                placeholder={t('behaviorsPlaceholder')}
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
            </Stack>
          </Box>
          <Box
            px="md"
            py="sm"
            style={{
              borderTop: '1px solid #E2E8F0',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              flexShrink: 0,
            }}
          >
            <Group justify="flex-end">
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
                {t('cancel')}
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
                {editingValue ? t('update') : t('create')}
              </Button>
            </Group>
          </Box>
        </form>
      </Modal>
    </Stack>
    </Surface>
  );
}