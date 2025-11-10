'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, TrendingUp, CheckCircle2, Circle, X, Archive } from 'lucide-react';
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
  targetValue: number;
  currentValue: number;
  unit: string;
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
  const toggleKeyResultCompletionMutation = useToggleKeyResultCompletion();
  const archiveMutation = useArchiveObjective();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [isKRModalOpen, setIsKRModalOpen] = useState(false);
  const [editingKR, setEditingKR] = useState<{
    objective: Objective;
    kr: KeyResult;
  } | null>(null);
  const [currentObjective, setCurrentObjective] = useState<string>('');

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
      const dto: CreateObjectiveDto = {
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

      if (editingObjective) {
        await updateMutation.mutateAsync({ id: editingObjective.id, dto });
      } else {
        await createMutation.mutateAsync(dto);
      }

      notifications.show({
        title: 'Success',
        message: `Objective ${editingObjective ? 'updated' : 'created'} successfully!`,
        color: 'green',
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving objective:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save objective',
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
      }));
      setKeyResults(krFormData);
    } else {
      setKeyResults([]);
    }

    setIsModalOpen(true);
  };

  const handleDeleteObjective = async (objective: Objective) => {
    if (window.confirm(`Are you sure you want to delete "${objective.title}"? This action cannot be undone.`)) {
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
    }
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

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <div>
      <Group justify="space-between" align="center" mb="xl">
        <div>
          <Title order={1}>Objectives & Key Results</Title>
          <Text c="dimmed" size="lg">
            Define and track your strategic goals using the OKR methodology
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={handleCreateNew}>
          Create Objective
        </Button>
      </Group>

      {!objectives || objectives.length === 0 ? (
        <Card p="xl" mt="lg">
          <Center>
            <Stack align="center">
              <ThemeIcon size={60} radius="xl" variant="light">
                <Target size={30} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={500} mb="xs">
                  No objectives yet
                </Text>
                <Text c="dimmed" mb="md">
                  Create your first objective to start tracking your progress towards your goals
                </Text>
                <Button leftSection={<Plus size={16} />} onClick={handleCreateNew}>
                  Create Your First Objective
                </Button>
              </div>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
          {objectives.map((objective) => (
            <Card key={objective.id} p="lg" withBorder>
              <Group justify="space-between" align="flex-start" mb="md">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb="xs">
                    <Text fw={600} size="lg">
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
                  </Group>
                  {objective.description && (
                    <Text size="sm" c="dimmed" mb="sm">
                      {objective.description}
                    </Text>
                  )}
                </div>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => handleEditObjective(objective)}
                  >
                    <Edit2 size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => handleDeleteObjective(objective)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Group>

              <Box mb="md">
                <Group justify="space-between" align="center" mb="xs">
                  <Text size="sm" fw={500}>
                    Progress
                  </Text>
                  <Text size="sm" fw={500}>
                    {objective.progress}%
                  </Text>
                </Group>
                <Progress value={objective.progress} size="sm" radius="xl" />
              </Box>

              {objective.keyResults && objective.keyResults.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Key Results ({objective.keyResults.length})
                  </Text>
                  <Stack gap="xs">
                    {objective.keyResults.slice(0, 3).map((kr, index) => (
                      <Paper key={kr.id} p="xs" withBorder>
                        <Group justify="space-between" align="center">
                          <Box style={{ flex: 1 }}>
                            <Text size="xs" fw={500} lineClamp={1}>
                              {kr.title}
                            </Text>
                            <Group gap="xs" mt={4}>
                              <TrendingUp size={12} />
                              <Text size="xs" c="dimmed">
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
                    {objective.keyResults.length > 3 && (
                      <Text size="xs" c="dimmed" ta="center">
                        +{objective.keyResults.length - 3} more
                      </Text>
                    )}
                  </Stack>
                </div>
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingObjective ? 'Edit Objective' : 'Create New Objective'}
        size="lg"
        scrollAreaComponent={ScrollArea}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="Enter objective title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Description"
              placeholder="Describe your objective"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Select
              label="Life Area"
              placeholder="Select a life area"
              required
              data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
              value={formData.lifeAreaId}
              onChange={(value) => setFormData({ ...formData, lifeAreaId: value || '' })}
            />

            <Group grow>
              <DateInput
                label="Start Date"
                placeholder="Select start date"
                value={formData.startDate}
                onChange={(value) => setFormData({ ...formData, startDate: value || new Date() })}
                required
              />
              <DateInput
                label="End Date"
                placeholder="Select end date"
                value={formData.endDate}
                onChange={(value) => setFormData({ ...formData, endDate: value || new Date() })}
                required
              />
            </Group>

            <Divider />

            <div>
              <Group justify="space-between" align="center" mb="md">
                <Text fw={500}>Key Results</Text>
                <Button variant="light" size="compact-sm" onClick={addKeyResult}>
                  <Plus size={14} />
                </Button>
              </Group>

              <Stack gap="md">
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
                        placeholder="Key result title"
                        value={kr.title}
                        onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                        size="sm"
                        required
                      />
                      <Textarea
                        placeholder="Key result description (optional)"
                        value={kr.description}
                        onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                        size="sm"
                        rows={2}
                      />
                      <Group grow>
                        <NumberInput
                          placeholder="Target value"
                          value={kr.targetValue}
                          onChange={(value) => updateKeyResult(index, 'targetValue', value || 0)}
                          size="sm"
                          min={0}
                          required
                        />
                        <NumberInput
                          placeholder="Current value"
                          value={kr.currentValue}
                          onChange={(value) => updateKeyResult(index, 'currentValue', value || 0)}
                          size="sm"
                          min={0}
                        />
                        <TextInput
                          placeholder="Unit (e.g., users, %, points)"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          size="sm"
                          required
                        />
                      </Group>
                    </Stack>
                  </Paper>
                ))}

                {keyResults.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    No key results added yet. Click the + button to add some.
                  </Text>
                )}
              </Stack>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingObjective ? 'Update' : 'Create'} Objective
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}