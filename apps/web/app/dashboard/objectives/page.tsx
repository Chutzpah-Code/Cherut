'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp, CheckCircle2, Circle, X, Archive } from 'lucide-react';
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
  useToggleObjectiveCompletion,
  useToggleKeyResultCompletion,
  useArchiveObjective,
} from '@/hooks/useObjectives';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateObjectiveDto, Objective, KeyResult, CreateKeyResultDto } from '@/lib/api/services/objectives';

interface KeyResultFormData {
  id?: string;
  title: string;
  description: string;
  dueDate: Date | null;
}

export default function ObjectivesPage() {
  const { data: objectives, isLoading } = useObjectives();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();
  const completeMutation = useCompleteObjective();
  const createKRMutation = useCreateKeyResult();
  const updateKRMutation = useUpdateKeyResult();
  const deleteKRMutation = useDeleteKeyResult();
  const completeKRMutation = useCompleteKeyResult();
  const toggleObjectiveCompletionMutation = useToggleObjectiveCompletion();
  const toggleKRCompletionMutation = useToggleKeyResultCompletion();
  const archiveObjectiveMutation = useArchiveObjective();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [formData, setFormData] = useState<{
    lifeAreaId: string;
    title: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    lifeAreaId: '',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: null,
  });

  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>([]);
  const [editingKR, setEditingKR] = useState<{ objectiveId: string; kr: KeyResult } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select both start and end dates',
        color: 'red',
      });
      return;
    }

    try {
      const dto: CreateObjectiveDto = {
        lifeAreaId: formData.lifeAreaId,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        keyResults: keyResults
          .filter((kr) => kr.title && kr.dueDate)
          .map((kr) => ({
            title: kr.title,
            description: kr.description,
            dueDate: kr.dueDate!.toISOString().split('T')[0],
          })),
      };

      if (editingObjective) {
        await updateMutation.mutateAsync({ id: editingObjective.id, dto });
        notifications.show({
          title: 'Success',
          message: 'Objective updated successfully',
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync(dto);
        notifications.show({
          title: 'Success',
          message: 'Objective created successfully',
          color: 'green',
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving objective:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save objective',
        color: 'red',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingObjective(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: null,
    });
    setKeyResults([]);
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormData({
      lifeAreaId: objective.lifeAreaId,
      title: objective.title,
      description: objective.description || '',
      startDate: new Date(objective.startDate),
      endDate: new Date(objective.endDate),
    });
    setKeyResults([]);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Objective',
      children: (
        <Text size="sm">
          Are you sure you want to delete this objective? This will also delete all associated key results. This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
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

  const handleToggleObjectiveCompletion = async (id: string) => {
    try {
      await toggleObjectiveCompletionMutation.mutateAsync(id);
      notifications.show({
        title: 'Success',
        message: 'Objective status updated',
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling objective completion:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update objective status',
        color: 'red',
      });
    }
  };

  const handleNew = () => {
    setEditingObjective(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: null,
    });
    setKeyResults([]);
    setIsModalOpen(true);
  };

  const addKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        title: '',
        description: '',
        dueDate: null,
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

  const handleAddKRToExisting = async (objectiveId: string) => {
    modals.open({
      title: 'Add Key Result',
      size: 'lg',
      children: (
        <AddKeyResultModal
          objectiveId={objectiveId}
          onSuccess={() => {
            modals.closeAll();
            notifications.show({
              title: 'Success',
              message: 'Key result added successfully',
              color: 'green',
            });
          }}
        />
      ),
    });
  };

  const handleToggleKRCompletion = async (objectiveId: string, keyResultId: string) => {
    try {
      await toggleKRCompletionMutation.mutateAsync({ objectiveId, keyResultId });
      notifications.show({
        title: 'Success',
        message: 'Key result status updated',
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling key result completion:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update key result status',
        color: 'red',
      });
    }
  };

  const handleDeleteKR = (objectiveId: string, keyResultId: string) => {
    modals.openConfirmModal({
      title: 'Delete Key Result',
      children: <Text size="sm">Are you sure you want to delete this key result? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteKRMutation.mutateAsync({ objectiveId, keyResultId });
          notifications.show({
            title: 'Success',
            message: 'Key result deleted successfully',
            color: 'green',
          });
        } catch (error) {
          console.error('Error deleting key result:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to delete key result',
            color: 'red',
          });
        }
      },
    });
  };

  const handleArchive = (id: string) => {
    modals.openConfirmModal({
      title: 'Archive Objective',
      children: (
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to archive this objective?
          </Text>
          <Text size="sm" c="dimmed">
            Archived objectives and their key results will be stored for future reporting.
            They will remain available in your data but won&apos;t appear in your active objectives list.
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Archive', cancel: 'Cancel' },
      confirmProps: { color: 'blue' },
      onConfirm: async () => {
        try {
          await archiveObjectiveMutation.mutateAsync(id);
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
      },
    });
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateProgress = (objective: Objective) => {
    if (!objective.keyResults || objective.keyResults.length === 0) {
      return objective.progress || 0;
    }
    const completed = objective.keyResults.filter((kr) => kr.isCompleted).length;
    return Math.round((completed / objective.keyResults.length) * 100);
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
          <Title order={1} size="h2" mb="xs">
            Objectives & Key Results
          </Title>
          <Text c="dimmed" size="sm">
            Define and track your strategic objectives with measurable key results
          </Text>
        </div>
        <Button leftSection={<Plus size={20} />} onClick={handleNew} size="md">
          New Objective
        </Button>
      </Group>

      {/* Objectives Grid */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {objectives?.filter((obj) => !obj.isArchived).map((objective) => {
          const progress = calculateProgress(objective);
          const completedKRs = objective.keyResults?.filter((kr) => kr.isCompleted).length || 0;
          const totalKRs = objective.keyResults?.length || 0;

          return (
            <Card key={objective.id} shadow="md" padding="lg" withBorder radius="md">
              <Stack gap="md">
                {/* Header */}
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                    <Target size={24} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg" style={{ flex: 1 }} lineClamp={1}>
                        {objective.title}
                      </Text>
                      <Badge color={getStatusColor(objective.status)} size="sm" variant="filled">
                        {getStatusText(objective.status)}
                      </Badge>
                    </Group>
                    {objective.description && (
                      <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                        {objective.description}
                      </Text>
                    )}
                    <Group gap="xs">
                      <TrendingUp size={14} />
                      <Text size="xs" c="dimmed" fw={500}>
                        {getLifeAreaName(objective.lifeAreaId)}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Divider />

                {/* Progress */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Progress
                    </Text>
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">
                        {completedKRs}/{totalKRs} KRs
                      </Text>
                      <Text size="sm" fw={600} c="blue">
                        {progress}%
                      </Text>
                    </Group>
                  </Group>
                  <Progress value={progress} color="blue" size="md" radius="xl" />
                </Stack>

                {/* Key Results */}
                {objective.keyResults && objective.keyResults.length > 0 && (
                  <Stack gap="xs">
                    <Text size="sm" fw={600} c="dimmed">
                      Key Results
                    </Text>
                    <ScrollArea.Autosize mah={200}>
                      <Stack gap="xs">
                        {objective.keyResults.map((kr) => (
                          <Paper key={kr.id} p="sm" withBorder radius="md" bg="var(--mantine-color-gray-0)">
                            <Group wrap="nowrap" gap="sm">
                              <Tooltip label={kr.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}>
                                <ActionIcon
                                  size="md"
                                  variant="subtle"
                                  color={kr.isCompleted ? 'green' : 'gray'}
                                  onClick={() => handleToggleKRCompletion(objective.id, kr.id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {kr.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </ActionIcon>
                              </Tooltip>
                              <Box style={{ flex: 1 }}>
                                <Text
                                  size="sm"
                                  fw={500}
                                  style={{
                                    textDecoration: kr.isCompleted ? 'line-through' : 'none',
                                    color: kr.isCompleted ? 'var(--mantine-color-dimmed)' : 'inherit',
                                  }}
                                >
                                  {kr.title}
                                </Text>
                                <Group gap="xs" mt={4}>
                                  <Calendar size={12} />
                                  <Text size="xs" c="dimmed">
                                    Due: {new Date(kr.dueDate).toLocaleDateString()}
                                  </Text>
                                </Group>
                              </Box>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeleteKR(objective.id, kr.id)}
                              >
                                <Trash2 size={14} />
                              </ActionIcon>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  </Stack>
                )}

                {/* Dates */}
                <Group gap="sm" wrap="nowrap">
                  <Group gap={4}>
                    <Calendar size={14} />
                    <Text size="xs" c="dimmed">
                      {new Date(objective.startDate).toLocaleDateString()}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    →
                  </Text>
                  <Group gap={4}>
                    <Calendar size={14} />
                    <Text size="xs" c="dimmed">
                      {new Date(objective.endDate).toLocaleDateString()}
                    </Text>
                  </Group>
                </Group>

                <Divider />

                {/* Actions */}
                <Group gap="xs">
                  <Button
                    variant="light"
                    leftSection={<Plus size={16} />}
                    onClick={() => handleAddKRToExisting(objective.id)}
                    size="xs"
                    flex={1}
                  >
                    Add KR
                  </Button>
                  <Button
                    variant="light"
                    color={objective.status === 'completed' ? 'gray' : 'green'}
                    leftSection={<CheckCircle2 size={16} />}
                    onClick={() => handleToggleObjectiveCompletion(objective.id)}
                    size="xs"
                    flex={1}
                  >
                    {objective.status === 'completed' ? 'Reopen' : 'Complete'}
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<Edit2 size={16} />}
                    onClick={() => handleEdit(objective)}
                    size="xs"
                    flex={1}
                  >
                    Edit
                  </Button>
                  <Tooltip label="Archive objective">
                    <ActionIcon variant="light" color="blue" onClick={() => handleArchive(objective.id)} size="lg">
                      <Archive size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <ActionIcon variant="light" color="red" onClick={() => handleDelete(objective.id)} size="lg">
                    <Trash2 size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {objectives?.filter((obj) => !obj.isArchived).length === 0 && (
        <Card shadow="sm" padding="xl" withBorder>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="md" variant="light" color="blue">
              <Target size={32} />
            </ThemeIcon>
            <Text c="dimmed" size="lg" fw={500}>
              No objectives yet
            </Text>
            <Text c="dimmed" size="sm" ta="center">
              Start defining your strategic objectives with measurable key results
            </Text>
            <Button variant="light" onClick={handleNew} leftSection={<Plus size={20} />}>
              Create your first objective
            </Button>
          </Stack>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" color="blue" variant="light">
              <Target size={20} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              {editingObjective ? 'Edit Objective' : 'New Objective'}
            </Text>
          </Group>
        }
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Basic Info */}
            <Paper p="md" withBorder radius="md">
              <Stack gap="md">
                <Text size="sm" fw={600} c="blue">
                  Objective Details
                </Text>

                <Select
                  label="Life Area"
                  placeholder="Select a life area"
                  value={formData.lifeAreaId}
                  onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
                  data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
                  required
                  withAsterisk
                  leftSection={<TrendingUp size={16} />}
                />

                <TextInput
                  label="Title"
                  placeholder="e.g., Achieve 10% body fat"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  withAsterisk
                  leftSection={<Target size={16} />}
                />

                <Textarea
                  label="Description"
                  placeholder="Describe this objective..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  autosize
                  minRows={3}
                  maxRows={6}
                />

                <Grid>
                  <Grid.Col span={6}>
                    <DateInput
                      label="Start Date"
                      placeholder="Select start date"
                      value={formData.startDate}
                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                      required
                      withAsterisk
                      leftSection={<Calendar size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DateInput
                      label="End Date"
                      placeholder="Select end date"
                      value={formData.endDate}
                      onChange={(value) => setFormData({ ...formData, endDate: value })}
                      required
                      withAsterisk
                      leftSection={<Calendar size={16} />}
                      minDate={formData.startDate || undefined}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>

            {/* Key Results */}
            {!editingObjective && (
              <Paper p="md" withBorder radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="sm" fw={600} c="blue">
                      Key Results
                    </Text>
                    <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={addKeyResult}>
                      Add Key Result
                    </Button>
                  </Group>

                  {keyResults.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No key results added yet. Add measurable results to track your objective progress.
                    </Text>
                  ) : (
                    <Stack gap="sm">
                      {keyResults.map((kr, index) => (
                        <Paper key={index} p="sm" withBorder radius="md" bg="var(--mantine-color-gray-0)">
                          <Stack gap="sm">
                            <Group justify="space-between" wrap="nowrap">
                              <Text size="xs" fw={600} c="dimmed">
                                Key Result {index + 1}
                              </Text>
                              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => removeKeyResult(index)}>
                                <X size={14} />
                              </ActionIcon>
                            </Group>

                            <TextInput
                              placeholder="e.g., Reduce body fat to 10%"
                              value={kr.title}
                              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                              size="sm"
                              required
                            />

                            <Textarea
                              placeholder="Description (optional)"
                              value={kr.description}
                              onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                              rows={2}
                              size="sm"
                            />

                            <DateInput
                              placeholder="Due date"
                              value={kr.dueDate}
                              onChange={(value) => updateKeyResult(index, 'dueDate', value)}
                              leftSection={<Calendar size={14} />}
                              size="sm"
                              required
                              minDate={formData.startDate || undefined}
                              maxDate={formData.endDate || undefined}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Actions */}
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                leftSection={editingObjective ? <Edit2 size={16} /> : <Plus size={16} />}
              >
                {editingObjective ? 'Update Objective' : 'Create Objective'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

// Component for adding KR to existing objective
function AddKeyResultModal({ objectiveId, onSuccess }: { objectiveId: string; onSuccess: () => void }) {
  const createKRMutation = useCreateKeyResult();
  const [formData, setFormData] = useState<CreateKeyResultDto>({
    title: '',
    description: '',
    dueDate: '',
  });
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;

    try {
      await createKRMutation.mutateAsync({
        objectiveId,
        dto: {
          ...formData,
          dueDate: dueDate.toISOString().split('T')[0],
        },
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating key result:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create key result',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="e.g., Reduce body fat to 10%"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          withAsterisk
          leftSection={<Target size={16} />}
        />

        <Textarea
          label="Description"
          placeholder="Describe this key result..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        <DateInput
          label="Due Date"
          placeholder="Select due date"
          value={dueDate}
          onChange={setDueDate}
          required
          withAsterisk
          leftSection={<Calendar size={16} />}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit" loading={createKRMutation.isPending} leftSection={<Plus size={16} />}>
            Add Key Result
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
