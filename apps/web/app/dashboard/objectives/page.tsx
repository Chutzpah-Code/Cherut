'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, TrendingUp, CheckCircle2, Circle, X, Archive, ArchiveRestore, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
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
  Select,
  ThemeIcon,
  Progress,
  Loader,
  Center,
  Badge,
  Grid,
  ActionIcon,
  Divider,
  Accordion,
  Checkbox,
  Paper,
  Tooltip,
  Box,
  ScrollArea,
  NumberInput,
  Menu,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  useObjectives,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useCompleteObjective,
  useCreateKeyResult,
  useUpdateKeyResult,
  useDeleteKeyResult,
  useCompleteKeyResult,
  useBatchUpdateKeyResults,
  useToggleObjectiveCompletion,
  useToggleKeyResultCompletion,
  useArchiveObjective,
  useUnarchiveObjective,
} from '@/hooks/useObjectives';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useQueryClient } from '@tanstack/react-query';
import { CreateObjectiveDto, Objective, KeyResult, CreateKeyResultDto } from '@/lib/api/services/objectives';

interface KeyResultFormData {
  id?: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted?: boolean;
}

export default function ObjectivesPage() {
  console.log('[Objectives Page] Component rendering...');

  const { data: objectives, isLoading, error } = useObjectives();
  const { data: lifeAreas } = useLifeAreas();

  console.log('[Objectives Page] State:', {
    objectives: objectives?.length || 0,
    isLoading,
    error: error?.message || 'none',
    lifeAreas: lifeAreas?.length || 0
  });

  console.log('📊 Current objectives data:', objectives);
  if (objectives && objectives.length > 0) {
    objectives.forEach((obj, index) => {
      console.log(`🎯 Objective ${index}: "${obj.title}" - keyResults:`, obj.keyResults);
    });
  }
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();
  const completeMutation = useCompleteObjective();
  const createKRMutation = useCreateKeyResult();
  const updateKRMutation = useUpdateKeyResult();
  const batchUpdateKRMutation = useBatchUpdateKeyResults();
  const deleteKRMutation = useDeleteKeyResult();
  const completeKRMutation = useCompleteKeyResult();
  const toggleObjectiveCompletionMutation = useToggleObjectiveCompletion();
  const toggleKeyResultCompletionMutation = useToggleKeyResultCompletion();
  const archiveMutation = useArchiveObjective();
  const unarchiveMutation = useUnarchiveObjective();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [isKRModalOpen, setIsKRModalOpen] = useState(false);
  const [editingKR, setEditingKR] = useState<{
    objective: Objective;
    kr: KeyResult;
  } | null>(null);
  const [currentObjective, setCurrentObjective] = useState<string>('');
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [viewFilter, setViewFilter] = useState<'all' | 'active' | 'archived'>('active');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeAreaId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.lifeAreaId) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    try {
      if (editingObjective) {
        // For updates, handle objective and key results separately
        const updateDto = {
          lifeAreaId: formData.lifeAreaId,
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate.toISOString().split('T')[0],
          endDate: formData.endDate.toISOString().split('T')[0],
        };
        await updateMutation.mutateAsync({ id: editingObjective.id, dto: updateDto });

        // Handle Key Results updates (simplified approach)
        console.log('🔄 Processing Key Results updates...');
        console.log('📊 Current keyResults state:', keyResults);
        console.log('📊 Original objective keyResults:', editingObjective.keyResults);

        const existingKRs = editingObjective.keyResults || [];
        const currentKRs = keyResults.filter(kr => kr.title && kr.targetValue && kr.unit);

        // Process operations with error handling but don't stop on failures
        let updateResults = { success: 0, errors: 0 };

        // 1. Update existing Key Results - BATCH OPTIMIZATION
        const existingKRsToUpdate = currentKRs.filter(kr => kr.id);
        if (existingKRsToUpdate.length > 0) {
          console.log(`🚀 Batch updating ${existingKRsToUpdate.length} existing Key Results`);
          try {
            const batchUpdates = existingKRsToUpdate.map(kr => ({
              id: kr.id!,
              dto: {
                title: kr.title,
                description: kr.description || '',
                targetValue: kr.targetValue,
                currentValue: kr.currentValue || 0,
                unit: kr.unit,
              }
            }));

            const batchResult = await batchUpdateKRMutation.mutateAsync({
              objectiveId: editingObjective.id,
              updates: batchUpdates,
            });

            updateResults.success += batchResult.success;
            updateResults.errors += batchResult.errors;
            console.log(`✅ Batch update completed: ${batchResult.success} success, ${batchResult.errors} errors`);
          } catch (error) {
            console.error(`❌ Batch update failed:`, error);
            console.log(`🔄 Falling back to individual updates for ${existingKRsToUpdate.length} Key Results`);

            // Fallback: Update each Key Result individually
            for (const kr of existingKRsToUpdate) {
              try {
                await updateKRMutation.mutateAsync({
                  objectiveId: editingObjective.id,
                  keyResultId: kr.id!,
                  dto: {
                    title: kr.title,
                    description: kr.description || '',
                    targetValue: kr.targetValue,
                    currentValue: kr.currentValue || 0,
                    unit: kr.unit,
                  },
                  skipInvalidation: true,
                });
                updateResults.success++;
                console.log(`✅ Individual update success for KR: ${kr.title}`);
              } catch (individualError) {
                console.error(`❌ Individual update failed for KR ${kr.id}:`, individualError);
                updateResults.errors++;
              }
            }
          }
        }

        // 2. Create new Key Results (those without id) - WITH BATCH OPTIMIZATION
        for (const kr of currentKRs.filter(kr => !kr.id)) {
          console.log(`➕ Creating new KR: ${kr.title}`);
          try {
            await createKRMutation.mutateAsync({
              objectiveId: editingObjective.id,
              dto: {
                title: kr.title,
                description: kr.description || '',
                targetValue: kr.targetValue,
                currentValue: kr.currentValue || 0,
                unit: kr.unit,
              },
              skipInvalidation: true, // Skip individual invalidations
            });
            updateResults.success++;
          } catch (error) {
            console.error(`❌ Error creating KR:`, error);
            updateResults.errors++;
          }
        }

        // 3. Delete removed Key Results
        const currentKRIds = currentKRs.filter(kr => kr.id).map(kr => kr.id);
        for (const existingKR of existingKRs) {
          if (!currentKRIds.includes(existingKR.id)) {
            console.log(`🗑️ Deleting removed KR: ${existingKR.id} - ${existingKR.title}`);
            try {
              await deleteKRMutation.mutateAsync({
                objectiveId: editingObjective.id,
                keyResultId: existingKR.id!,
                skipInvalidation: true, // Skip individual invalidations
              });
              updateResults.success++;
            } catch (error) {
              console.error(`❌ Error deleting KR ${existingKR.id}:`, error);
              updateResults.errors++;
            }
          }
        }

        console.log(`✅ Key Results update completed: ${updateResults.success} success, ${updateResults.errors} errors`);

        // Manually invalidate queries ONCE at the end for better performance
        queryClient.invalidateQueries({ queryKey: ['objectives'] });

        // Show notification based on Key Results update results
        if (updateResults.errors === 0) {
          notifications.show({
            title: 'Success',
            message: 'Objective and all Key Results updated successfully!',
            color: 'green',
          });
        } else if (updateResults.success > 0) {
          notifications.show({
            title: 'Partial Success',
            message: `Objective updated successfully! ${updateResults.success} Key Results updated, ${updateResults.errors} failed.`,
            color: 'yellow',
          });
        } else {
          notifications.show({
            title: 'Warning',
            message: 'Objective updated successfully, but all Key Results failed to update.',
            color: 'orange',
          });
        }
      } else {
        // For creation, include keyResults
        const createDto: CreateObjectiveDto = {
          lifeAreaId: formData.lifeAreaId,
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate.toISOString().split('T')[0],
          endDate: formData.endDate.toISOString().split('T')[0],
          keyResults: keyResults
            .filter((kr) => kr.title && kr.targetValue && kr.unit)
            .map((kr) => ({
              title: kr.title,
              description: kr.description,
              targetValue: kr.targetValue,
              currentValue: kr.currentValue || 0,
              unit: kr.unit,
            })),
        };
        await createMutation.mutateAsync(createDto);

        // For creation, always show success since creation includes KRs
        notifications.show({
          title: 'Success',
          message: 'Objective created successfully!',
          color: 'green',
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving objective:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to save objective';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lifeAreaId: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    setKeyResults([]);
    setEditingObjective(null);
  };

  const handleEditObjective = (objective: Objective) => {
    console.log('🔍 handleEditObjective called with:', objective);
    console.log('🔑 objective.keyResults:', objective.keyResults);

    setEditingObjective(objective);
    setFormData({
      title: objective.title,
      description: objective.description || '',
      lifeAreaId: objective.lifeAreaId,
      startDate: new Date(objective.startDate),
      endDate: new Date(objective.endDate),
    });

    // Convert existing Key Results to form data
    if (objective.keyResults) {
      const krFormData = objective.keyResults.map(kr => ({
        id: kr.id,
        title: kr.title,
        description: kr.description || '',
        targetValue: kr.targetValue,
        currentValue: kr.currentValue,
        unit: kr.unit,
        isCompleted: kr.isCompleted,
      }));
      console.log('✅ Setting keyResults to:', krFormData);
      setKeyResults(krFormData);
    } else {
      console.log('❌ No keyResults found, setting to empty array');
      setKeyResults([]);
    }

    setIsModalOpen(true);
  };

  const handleDeleteObjective = (objective: Objective) => {
    modals.openConfirmModal({
      title: 'Delete Objective',
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
          Are you sure you want to delete "<strong>{objective.title}</strong>"? This action cannot be undone.
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
          await deleteMutation.mutateAsync(objective.id);
          notifications.show({
            title: 'Success',
            message: 'Objective deleted successfully',
            color: 'green',
          });
        } catch (error) {
          console.error('Error deleting objective:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to delete objective',
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
        title: 'Success',
        message: `Key result ${keyResult.isCompleted ? 'marked as incomplete' : 'completed'}`,
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling key result:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update key result',
        color: 'red',
      });
    }
  };

  const handleToggleObjective = async (objective: Objective) => {
    try {
      await toggleObjectiveCompletionMutation.mutateAsync(objective.id);
      notifications.show({
        title: 'Success',
        message: `Objective ${objective.status === 'completed' ? 'marked as active' : 'completed'}`,
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling objective:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update objective',
        color: 'red',
      });
    }
  };

  const handleArchiveObjective = async (objective: Objective) => {
    try {
      await archiveMutation.mutateAsync(objective.id);
      notifications.show({
        title: 'Success',
        message: 'Objective archived successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error archiving objective:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to archive objective',
        color: 'red',
      });
    }
  };

  const handleUnarchiveObjective = async (objective: Objective) => {
    try {
      await unarchiveMutation.mutateAsync(objective.id);
      notifications.show({
        title: 'Success',
        message: 'Objective unarchived successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error unarchiving objective:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to unarchive objective',
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
    resetForm();
    setIsModalOpen(true);
  };

  const addKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        title: '',
        description: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        isCompleted: false,
      },
    ]);
  };

  const removeKeyResult = (index: number) => {
    setKeyResults(keyResults.filter((_, i) => i !== index));
  };

  const updateKeyResult = (index: number, field: keyof KeyResultFormData, value: any) => {
    const updated = [...keyResults];
    updated[index] = { ...updated[index], [field]: value };
    setKeyResults(updated);
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
    <div
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
              fontSize: '32px',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Objectives & Key Results
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
            Define and track your strategic goals using the OKR methodology
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
            Create Objective
          </Button>
        </Box>

        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Button
              variant={viewFilter === 'active' ? 'filled' : 'outline'}
              size="sm"
              onClick={() => setViewFilter('active')}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: viewFilter === 'active' ? '#4686FE' : '#CCCCCC',
                color: viewFilter === 'active' ? 'white' : '#333333',
                background: viewFilter === 'active' ? '#4686FE' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                height: '36px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: viewFilter === 'active' ? 'white' : '#4686FE',
                    background: viewFilter === 'active' ? '#3366E5' : 'rgba(70, 134, 254, 0.08)',
                  },
                },
              }}
            >
              Active
            </Button>
            <Button
              variant={viewFilter === 'archived' ? 'filled' : 'outline'}
              size="sm"
              onClick={() => setViewFilter('archived')}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: viewFilter === 'archived' ? '#4686FE' : '#CCCCCC',
                color: viewFilter === 'archived' ? 'white' : '#333333',
                background: viewFilter === 'archived' ? '#4686FE' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                height: '36px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: viewFilter === 'archived' ? 'white' : '#4686FE',
                    background: viewFilter === 'archived' ? '#3366E5' : 'rgba(70, 134, 254, 0.08)',
                  },
                },
              }}
            >
              Archived
            </Button>
            <Button
              variant={viewFilter === 'all' ? 'filled' : 'outline'}
              size="sm"
              onClick={() => setViewFilter('all')}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: viewFilter === 'all' ? '#4686FE' : '#CCCCCC',
                color: viewFilter === 'all' ? 'white' : '#333333',
                background: viewFilter === 'all' ? '#4686FE' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                height: '36px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: viewFilter === 'all' ? 'white' : '#4686FE',
                    background: viewFilter === 'all' ? '#3366E5' : 'rgba(70, 134, 254, 0.08)',
                  },
                },
              }}
            >
              All
            </Button>
          </Group>
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666666',
            }}
          >
            {filteredObjectives?.length || 0} objective{(filteredObjectives?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </Group>
      </Stack>

      {!filteredObjectives || filteredObjectives.length === 0 ? (
        <Card
          padding="xl"
          mt="lg"
          radius={16}
          style={{
            background: '#F5F5F5',
            border: '1px solid #CCCCCC',
          }}
        >
          <Center>
            <Stack align="center">
              <ThemeIcon
                size={60}
                radius={16}
                style={{
                  background: '#F5F5F5',
                  color: '#4686FE',
                  border: '1px solid #CCCCCC',
                }}
              >
                <Target size={30} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text
                  mb="xs"
                  style={{
                    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#000000',
                  }}
                >
                  {viewFilter === 'archived' ? 'No archived objectives' : viewFilter === 'active' ? 'No active objectives' : 'No objectives yet'}
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
                    ? 'No objectives have been archived yet'
                    : viewFilter === 'active'
                    ? 'All your objectives are archived. Create a new one or unarchive existing ones.'
                    : 'Create your first objective to start tracking your progress towards your goals'
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
                    Create Your First Objective
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
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <Text
                          style={{
                            wordBreak: "break-word",
                            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#000000',
                          }}
                        >
                          {objective.title}
                        </Text>
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
                          {objective.status}
                        </Badge>
                        {objective.isArchived && (
                          <Badge color="gray" variant="outline" size="sm">
                            archived
                          </Badge>
                        )}
                      </Group>
                      {objective.description && (
                        <Text
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
                        {objective.status === 'completed' ? 'Mark as Active' : 'Mark as Completed'}
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<Edit2 size={16} />}
                        onClick={() => handleEditObjective(objective)}
                      >
                        Edit Objective
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item
                        leftSection={objective.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        onClick={() => objective.isArchived ? handleUnarchiveObjective(objective) : handleArchiveObjective(objective)}
                      >
                        {objective.isArchived ? 'Unarchive' : 'Archive'}
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item
                        color="red"
                        leftSection={<Trash2 size={16} />}
                        onClick={() => handleDeleteObjective(objective)}
                      >
                        Delete
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
                      Progress
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
                        Key Results ({objective.keyResults.length})
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
                          style={{
                            border: '1px solid #CCCCCC',
                            background: '#F5F5F5',
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
                                  Progress: {kr.currentValue || 0}/{kr.targetValue || 0} {kr.unit || ''} ({(kr.completionPercentage || 0).toFixed(0)}%)
                                </Text>
                              </Group>
                            </Box>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color={kr.isCompleted ? 'green' : 'gray'}
                              onClick={() => handleToggleKeyResult(objective, kr)}
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
                          +{objective.keyResults.length - 3} more
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

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            {editingObjective ? 'Edit Objective' : 'Create New Objective'}
          </Text>
        }
        size="lg"
        radius={16}
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          body: {
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <TextInput
              label="Title"
              placeholder="Enter objective title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              placeholder="Describe your objective"
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

            <Select
              label="Life Area"
              placeholder="Select a life area"
              required
              data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
              value={formData.lifeAreaId}
              onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
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

            <Stack gap="sm">
              <Grid grow>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label="Start Date"
                    placeholder="Select start date"
                    value={formData.startDate}
                    onChange={(value) => setFormData({ ...formData, startDate: value || new Date() })}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label="End Date"
                    placeholder="Select end date"
                    value={formData.endDate}
                    onChange={(value) => setFormData({ ...formData, endDate: value || new Date() })}
                    required
                  />
                </Grid.Col>
              </Grid>
            </Stack>

            <Divider />

            <div>
              <Group justify="space-between" align="center" mb="md">
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#000000',
                  }}
                >
                  Key Results
                </Text>
                <Button
                  variant="outline"
                  size="compact-sm"
                  onClick={addKeyResult}
                  radius={6}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    borderColor: '#4686FE',
                    color: '#4686FE',
                    fontSize: '14px',
                    fontWeight: 600,
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
                  <Plus size={14} />
                </Button>
              </Group>

              <Stack gap="md">
                {(() => { console.log('🔍 Rendering keyResults in modal:', keyResults); return null; })()}
                {keyResults.map((kr, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Group justify="space-between" align="center" mb="sm">
                      <Text size="sm" fw={500}>
                        Key Result {index + 1}
                      </Text>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => removeKeyResult(index)}
                      >
                        <X size={14} />
                      </ActionIcon>
                    </Group>

                    <Stack gap="sm">
                      <TextInput
                        label="What do you want to achieve?"
                        placeholder="e.g., Increase monthly active users"
                        value={kr.title}
                        onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                        size="sm"
                        required
                        description="A specific, measurable outcome you want to achieve"
                      />
                      <Textarea
                        label="Additional details (optional)"
                        placeholder="e.g., Focus on improving user engagement through new features"
                        value={kr.description}
                        onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                        size="sm"
                        rows={2}
                        description="Any extra context or details about this key result"
                      />

                      <Text size="sm" fw={500} mt="xs" mb="xs">Measurement</Text>
                      <Stack gap="sm">
                        <Grid grow>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              label="Target Goal"
                              placeholder="1000"
                              value={kr.targetValue}
                              onChange={(value) => updateKeyResult(index, 'targetValue', value || 0)}
                              size="sm"
                              min={0}
                              required
                              description="What number do you want to reach?"
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              label="Current Progress"
                              placeholder="250"
                              value={kr.currentValue}
                              onChange={(value) => updateKeyResult(index, 'currentValue', value || 0)}
                              size="sm"
                              min={0}
                              description="Where are you now?"
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                              label="Unit of Measure"
                              placeholder="users"
                              value={kr.unit}
                              onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                              size="sm"
                              required
                              description="How will you measure it? (users, %, $, etc.)"
                            />
                          </Grid.Col>
                        </Grid>
                      </Stack>

                      {kr.targetValue > 0 && kr.currentValue >= 0 && (
                        <Box mt="xs" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                          <Group justify="space-between" align="center" mb="xs">
                            <Text size="xs" c="dimmed">Progress Preview:</Text>
                            {kr.id && (
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color={kr.isCompleted ? 'green' : 'gray'}
                                onClick={() => {
                                  if (editingObjective) {
                                    handleToggleKeyResult(editingObjective, kr as KeyResult);
                                  }
                                }}
                              >
                                {kr.isCompleted ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              </ActionIcon>
                            )}
                          </Group>
                          <Group gap="xs" align="center">
                            <Progress
                              value={Math.min((kr.currentValue / kr.targetValue) * 100, 100)}
                              size="sm"
                              style={{ flex: 1 }}
                            />
                            <Text size="xs" fw={500}>
                              {kr.currentValue} / {kr.targetValue} {kr.unit}
                              ({Math.min(Math.round((kr.currentValue / kr.targetValue) * 100), 100)}%)
                            </Text>
                          </Group>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ))}

                {keyResults.length === 0 && (
                  <Text
                    ta="center"
                    py="md"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#666666',
                    }}
                  >
                    No key results added yet. Click the + button to add some.
                  </Text>
                )}
              </Stack>
            </div>

            <Grid justify="flex-end" align="center" mt="lg">
              <Grid.Col span={{ base: 6, sm: 'content' }}>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  fullWidth
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
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 'content' }}>
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  fullWidth
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
                  {editingObjective ? 'Update' : 'Create'} Objective
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}