'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Loader,
  Center,
  ActionIcon,
  Box,
  Menu,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useLifeAreas, useDeleteLifeArea } from '@/hooks/useLifeAreas';
import { Surface } from '@/components/ui/Surface';
import { LifeArea } from '@/lib/api/services/lifeAreas';
import { EditDrawer } from './components/EditDrawer';

export default function LifeAreasPage() {
  const t = useTranslations('lifeAreas');
  const { data: lifeAreas, isLoading } = useLifeAreas();
  const deleteMutation = useDeleteLifeArea();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  // Helper function to truncate text by character count
  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return { text, isTruncated: false };
    return { text: text.substring(0, limit), isTruncated: true };
  };

  // Toggle expanded state for descriptions
  const toggleDescription = (areaId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
      }
      return newSet;
    });
  };

  const handleAreaCreated = (area: LifeArea) => {
    // Keeps the drawer open, now in edit mode, for the life area just created.
    setEditingArea(area);
  };

  const handleEdit = (area: LifeArea) => {
    setEditingArea(area);
    setDrawerOpen(true);
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
        } catch (error) {
          console.error('Error deleting life area:', error);
        }
      },
    });
  };

  const handleNew = () => {
    setEditingArea(null);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  return (
    <Surface p={{ base: 'md', sm: 'xl' }} style={{ paddingRight: drawerOpen && isDesktop ? 460 : undefined, transition: 'padding-right 0.2s ease' }}>
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
          {t('newLifeArea')}
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
            onMouseEnter={() => setHoveredCard(area.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'white',
              border: drawerOpen && editingArea?.id === area.id ? '1px solid #4686FE' : '1px solid #E5E7EB',
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
                  {area.name}
                </Text>
                {area.description && (() => {
                  const isExpanded = expandedDescriptions.has(area.id);
                  const { text: truncatedText, isTruncated } = truncateText(area.description, 120);
                  const displayText = isExpanded ? area.description : truncatedText;

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
                            toggleDescription(area.id);
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
                      color: hoveredCard === area.id ? '#4B5563' : '#D1D5DB',
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
                    onClick={() => handleEdit(area)}
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
                    onClick={() => handleDelete(area.id)}
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
          </Card>
        ))}
      </SimpleGrid>

      {lifeAreas?.length === 0 && (
        <Card
          shadow="none"
          padding="xl"
          radius={16}
          style={{
            background: '#F8FAFC',
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
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: '8px',
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

      <EditDrawer
        opened={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingArea(null); }}
        area={editingArea}
        onCreated={handleAreaCreated}
      />
    </Stack>
    </Surface>
  );
}
