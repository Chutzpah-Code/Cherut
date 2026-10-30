'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Edit2, Trash2, Plus, TrendingUp, CheckCircle2, Circle, Archive, ArchiveRestore, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Modal,
  Progress,
  Loader,
  Center,
  Badge,
  ActionIcon,
  Paper,
  Box,
  Menu,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  useObjectives,
  useDeleteObjective,
  useToggleObjectiveCompletion,
  useToggleKeyResultCompletion,
  useArchiveObjective,
  useUnarchiveObjective,
} from '@/hooks/useObjectives';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { Surface } from '@/components/ui/Surface';
import { Objective, KeyResult } from '@/lib/api/services/objectives';
import { EditDrawer } from './components/EditDrawer';

export default function ObjectivesPage() {
  const t = useTranslations('objectives');
  const tn = useTranslations('objectives.notifications');

  const { data: objectives, isLoading } = useObjectives();
  const { data: lifeAreas } = useLifeAreas();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const deleteMutation = useDeleteObjective();
  const toggleObjectiveCompletionMutation = useToggleObjectiveCompletion();
  const toggleKeyResultCompletionMutation = useToggleKeyResultCompletion();
  const archiveMutation = useArchiveObjective();
  const unarchiveMutation = useUnarchiveObjective();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'objective' | 'keyResults'>('objective');
  const [drawerInitialKrId, setDrawerInitialKrId] = useState<string | undefined>(undefined);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [viewFilter, setViewFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [descModal, setDescModal] = useState<Objective | null>(null);

  // Keeps the drawer reading live, cache-backed data (so KR/objective mutations
  // fired from inside it — and the board cards — stay in sync in real time)
  // instead of a stale snapshot taken when the drawer was opened.
  const liveEditingObjective = useMemo(
    () => (editingObjective ? objectives?.find((o) => o.id === editingObjective.id) ?? editingObjective : null),
    [objectives, editingObjective],
  );

  const handleEditObjective = (objective: Objective, tab: 'objective' | 'keyResults' = 'objective', krId?: string) => {
    setEditingObjective(objective);
    setDrawerInitialTab(tab);
    setDrawerInitialKrId(krId);
    setDrawerOpen(true);
  };

  const handleDeleteObjective = (objective: Objective) => {
    modals.openConfirmModal({
      title: t('deleteObjectiveTitle'),
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
          {t('deleteObjectiveBody', { title: objective.title })}
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
          await deleteMutation.mutateAsync(objective.id);
          notifications.show({
            title: tn('success'),
            message: tn('objectiveDeleted'),
            color: 'green',
          });
        } catch (error) {
          console.error('Error deleting objective:', error);
          notifications.show({
            title: tn('error'),
            message: tn('deleteFailed'),
            color: 'red',
          });
        }
      },
    });
  };

  const handleToggleKeyResult = async (objective: Objective, keyResult: KeyResult) => {
    try {
      await toggleKeyResultCompletionMutation.mutateAsync({
        objectiveId: objective.id,
        keyResultId: keyResult.id,
      });
      notifications.show({
        title: tn('success'),
        message: keyResult.isCompleted ? tn('krMarkedIncomplete') : tn('krMarkedCompleted'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling key result:', error);
      notifications.show({
        title: tn('error'),
        message: tn('krUpdateFailed'),
        color: 'red',
      });
    }
  };

  const handleToggleObjective = async (objective: Objective) => {
    try {
      await toggleObjectiveCompletionMutation.mutateAsync(objective.id);
      notifications.show({
        title: tn('success'),
        message: objective.status === 'completed' ? tn('objectiveMarkedActive') : tn('objectiveMarkedCompleted'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling objective:', error);
      notifications.show({
        title: tn('error'),
        message: tn('objectiveUpdateFailed'),
        color: 'red',
      });
    }
  };

  const handleArchiveObjective = async (objective: Objective) => {
    try {
      await archiveMutation.mutateAsync(objective.id);
      notifications.show({
        title: tn('success'),
        message: tn('objectiveArchived'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error archiving objective:', error);
      notifications.show({
        title: tn('error'),
        message: tn('archiveFailed'),
        color: 'red',
      });
    }
  };

  const handleUnarchiveObjective = async (objective: Objective) => {
    try {
      await unarchiveMutation.mutateAsync(objective.id);
      notifications.show({
        title: tn('success'),
        message: tn('objectiveUnarchived'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error unarchiving objective:', error);
      notifications.show({
        title: tn('error'),
        message: tn('unarchiveFailed'),
        color: 'red',
      });
    }
  };

  const toggleExpanded = (objectiveId: string) => {
    setExpandedObjectives(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(objectiveId)) {
        newExpanded.delete(objectiveId);
      } else {
        newExpanded.add(objectiveId);
      }
      return newExpanded;
    });
  };

  const handleCreateNew = () => {
    setEditingObjective(null);
    setDrawerInitialTab('objective');
    setDrawerInitialKrId(undefined);
    setDrawerOpen(true);
  };

  const handleObjectiveCreated = (objective: Objective) => {
    // Keeps the drawer open, now in edit mode, for the objective just created.
    setEditingObjective(objective);
  };

  // Filter objectives based on archive status
  const filteredObjectives = objectives?.filter(objective => {
    switch (viewFilter) {
      case 'active':
        return !objective.isArchived;
      case 'archived':
        return objective.isArchived;
      case 'all':
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  return (
    <Surface
      p={{ base: 'md', sm: 'xl' }}
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingRight: drawerOpen && isDesktop ? 500 : undefined,
        transition: 'padding-right 0.2s ease',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Stack mb="xl" gap="xl">
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
            onClick={handleCreateNew}
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
            {t('createObjective')}
          </Button>
        </Box>

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
              onClick={() => setViewFilter('active')}
              radius={40}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                height: '40px',
                padding: '0 20px',
                border: 'none',
                ...(viewFilter === 'active' ? {
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
                    ...(viewFilter === 'active' ? {} : {
                      background: 'rgba(70, 134, 254, 0.1)',
                    }),
                  },
                },
              }}
            >
              {t('active')}
            </Button>
            <Button
              onClick={() => setViewFilter('archived')}
              radius={40}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                height: '40px',
                padding: '0 20px',
                border: 'none',
                ...(viewFilter === 'archived' ? {
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
                    ...(viewFilter === 'archived' ? {} : {
                      background: 'rgba(70, 134, 254, 0.1)',
                    }),
                  },
                },
              }}
            >
              {t('archived')}
            </Button>
            <Button
              onClick={() => setViewFilter('all')}
              radius={40}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                height: '40px',
                padding: '0 20px',
                border: 'none',
                ...(viewFilter === 'all' ? {
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
                    ...(viewFilter === 'all' ? {} : {
                      background: 'rgba(70, 134, 254, 0.1)',
                    }),
                  },
                },
              }}
            >
              {t('all')}
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
            {t('objectiveCount', { count: filteredObjectives?.length || 0 })}
          </Text>
        </Group>
      </Stack>

      {!filteredObjectives || filteredObjectives.length === 0 ? (
        <Card
          padding="xl"
          mt="lg"
          radius={16}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
          }}
        >
          <Center>
            <Stack align="center">
              <div style={{ textAlign: 'center' }}>
                <Text
                  mb="xs"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#6B7280',
                  }}
                >
                  {viewFilter === 'archived' ? t('noArchivedObjectives') : viewFilter === 'active' ? t('noActiveObjectives') : t('noObjectivesYet')}
                </Text>
                <Text
                  mb="md"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  {viewFilter === 'archived'
                    ? t('noArchivedHint')
                    : viewFilter === 'active'
                    ? t('noActiveHint')
                    : t('emptyHint')
                  }
                </Text>
                {viewFilter !== 'archived' && (
                  <Button
                    leftSection={<Plus size={16} />}
                    onClick={handleCreateNew}
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
                    {t('createFirstObjective')}
                  </Button>
                )}
              </div>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing="xl">
          {filteredObjectives.map((objective) => (
            <Card
              key={objective.id}
              padding="xl"
              radius={16}
              style={{
                opacity: objective.isArchived ? 0.7 : 1,
                filter: objective.isArchived ? 'grayscale(0.3)' : 'none',
                background: 'white',
                border: drawerOpen && editingObjective?.id === objective.id ? '1px solid #4686FE' : '1px solid #CCCCCC',
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
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <button
                          onClick={() => handleEditObjective(objective, 'objective')}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                            wordBreak: "break-word",
                            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#000000',
                          }}
                        >
                          {objective.title}
                        </button>
                        <Badge
                          color={
                            objective.status === 'completed'
                              ? 'green'
                              : objective.status === 'active'
                              ? 'blue'
                              : 'gray'
                          }
                          size="sm"
                        >
                          {objective.status === 'completed' ? t('statusCompleted') : objective.status === 'cancelled' ? t('statusCancelled') : t('statusActive')}
                        </Badge>
                        {objective.isArchived && (
                          <Badge color="gray" variant="outline" size="sm">
                            {t('archived')}
                          </Badge>
                        )}
                      </Group>
                      {objective.description && (
                        <Box>
                          <Text
                            lineClamp={2}
                            style={{
                              wordBreak: "break-word",
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              color: '#666666',
                              lineHeight: '20px',
                            }}
                          >
                            {objective.description}
                          </Text>
                          {objective.description.length > 100 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDescModal(objective); }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                fontSize: 12, fontWeight: 500, color: '#4686FE', marginTop: 2,
                              }}
                            >
                              {t('seeMore')}
                            </button>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </div>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="light" color="gray" size="sm">
                        <MoreVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={objective.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        onClick={() => handleToggleObjective(objective)}
                      >
                        {objective.status === 'completed' ? t('markAsActive') : t('markAsCompleted')}
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<Edit2 size={16} />}
                        onClick={() => handleEditObjective(objective)}
                      >
                        {t('editObjective')}
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item
                        leftSection={objective.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        onClick={() => objective.isArchived ? handleUnarchiveObjective(objective) : handleArchiveObjective(objective)}
                      >
                        {objective.isArchived ? t('unarchive') : t('archive')}
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item
                        color="red"
                        leftSection={<Trash2 size={16} />}
                        onClick={() => handleDeleteObjective(objective)}
                      >
                        {t('delete')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                <Box>
                  <Group justify="space-between" align="center" mb="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      {t('progress')}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      {objective.progress}%
                    </Text>
                  </Group>
                  <Progress value={objective.progress} size="sm" radius={8} color="#4686FE" />
                </Box>

                {objective.keyResults && objective.keyResults.length > 0 && (
                  <div>
                    <Group justify="space-between" align="center" mb="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333333',
                        }}
                      >
                        {t('keyResultsCount', { count: objective.keyResults.length })}
                      </Text>
                      {objective.keyResults.length > 3 && (
                        <ActionIcon
                          size="md"
                          variant="light"
                          color="gray"
                          onClick={() => toggleExpanded(objective.id)}
                          style={{ border: '1px solid #e0e0e0' }}
                        >
                          {expandedObjectives.has(objective.id) ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </ActionIcon>
                      )}
                    </Group>
                    <Stack gap="xs">
                      {(expandedObjectives.has(objective.id)
                        ? objective.keyResults
                        : objective.keyResults.slice(0, 3)
                      ).map((kr) => (
                        <Paper
                          key={kr.id}
                          p="sm"
                          radius={8}
                          onClick={() => handleEditObjective(objective, 'keyResults', kr.id)}
                          style={{
                            border: '1px solid #CCCCCC',
                            background: '#F5F5F5',
                            cursor: 'pointer',
                          }}
                        >
                          <Group justify="space-between" align="center">
                            <Box style={{ flex: 1 }}>
                              <Text
                                lineClamp={1}
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#000000',
                                }}
                              >
                                {kr.title}
                              </Text>
                              <Group gap="xs" mt={4}>
                                <TrendingUp size={12} color="#4686FE" />
                                <Text
                                  style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    color: '#666666',
                                  }}
                                >
                                  {t('keyResultProgress', { current: kr.currentValue || 0, target: kr.targetValue || 0, unit: kr.unit || '', pct: (kr.completionPercentage || 0).toFixed(0) })}
                                </Text>
                              </Group>
                            </Box>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color={kr.isCompleted ? 'green' : 'gray'}
                              onClick={(e) => { e.stopPropagation(); handleToggleKeyResult(objective, kr); }}
                            >
                              {kr.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                            </ActionIcon>
                          </Group>
                        </Paper>
                      ))}
                      {!expandedObjectives.has(objective.id) && objective.keyResults.length > 3 && (
                        <Text
                          ta="center"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: '#666666',
                          }}
                        >
                          {t('moreCount', { count: objective.keyResults.length - 3 })}
                        </Text>
                      )}
                    </Stack>
                  </div>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <EditDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        objective={liveEditingObjective}
        lifeAreas={lifeAreas || []}
        initialTab={drawerInitialTab}
        initialExpandedKrId={drawerInitialKrId}
        onCreated={handleObjectiveCreated}
      />

      {/* Description read modal */}
      <Modal
        opened={!!descModal}
        onClose={() => setDescModal(null)}
        title={
          <Text fw={600} size="lg" style={{ color: '#0F172A' }}>
            {descModal?.title}
          </Text>
        }
        size="md"
        radius={12}
      >
        <Text style={{ fontSize: 14, color: '#374151', lineHeight: '22px', whiteSpace: 'pre-wrap' }}>
          {descModal?.description}
        </Text>
      </Modal>
    </Surface>
  );
}