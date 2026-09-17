'use client';

import React from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Checkbox,
  ActionIcon,
  Text,
  Box,
  Switch,
  Tooltip,
  SegmentedControl,
  Progress,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { X, Play, Square, RefreshCw } from 'lucide-react';
import { Task, ChecklistItem, UpdateTaskDto, RecurringConfig } from '@/lib/api/services/tasks';
import { useState, useEffect, useMemo } from 'react';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useObjectives } from '@/hooks/useObjectives';
import { useKeyResults } from '@/hooks/useKeyResults';
import { useTask, useUpdateTask, useToggleRecurringDate } from '@/hooks/useTasks';
import { notifications } from '@mantine/notifications';

// ── tokens ────────────────────────────────────────────────────────────────────
const INK = '#0F172A';
const SECONDARY = '#334155';
const MUTED = '#64748B';
const FAINT = '#94A3B8';
const BORDER = '#E2E5EB';
const HAIRLINE = '#EFF1F5';
const TINT_BORDER = '#E8EBF0';
const SURFACE = '#FFFFFF';
const SUBTLE = '#F8FAFC';
const CHIP = '#F1F5F9';
const ATTR_BG = '#FCFDFE';
const PRIMARY = '#4686FE';
const PRIMARY_HOVER = '#3366E5';
const PRIMARY_TINT = '#E4EBFD';
const PROGRESS_FILL = '#9DB8F2';
const PROGRESS_OVERFLOW = '#C2D2F6';
const PROGRESS_TRACK = '#EDF1F6';
const DANGER = '#B91C1C';
const DISABLED_TEXT = '#CBD5E1';
const DISABLED_BORDER = '#EDF1F6';

const SESSION_SECONDS = 25 * 60;

// ── helpers ───────────────────────────────────────────────────────────────────
function getRecurringDates(config: RecurringConfig): string[] {
  const dates: string[] = [];
  const current = new Date(config.startDate + 'T00:00:00');
  const end = new Date(config.endDate + 'T00:00:00');
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    if (config.frequency === 'daily') current.setDate(current.getDate() + 1);
    else if (config.frequency === 'weekly') current.setDate(current.getDate() + 7);
    else current.setMonth(current.getMonth() + 1);
  }
  return dates;
}

function localISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatStopwatch(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatHM(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatHMFull(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function formatCreatedEdited(createdAt: string, updatedAt: string): string {
  const created = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const editedMs = Date.now() - new Date(updatedAt).getTime();
  const editedMin = Math.floor(editedMs / 60000);
  let edited: string;
  if (editedMin < 1) edited = 'just now';
  else if (editedMin < 60) edited = `${editedMin}m ago`;
  else if (editedMin < 1440) edited = `${Math.floor(editedMin / 60)}h ago`;
  else edited = `${Math.floor(editedMin / 1440)}d ago`;
  return `Created ${created} · edited ${edited}`;
}

// ── small shared field styles ────────────────────────────────────────────────
const fieldLabelStyle = { fontSize: 12.5, fontWeight: 600, color: SECONDARY, marginBottom: 7 };
const selectStyles = {
  label: fieldLabelStyle,
  input: { fontSize: 13, borderColor: BORDER, borderRadius: 6, color: SECONDARY },
};

// ── PomodoroStepper ───────────────────────────────────────────────────────────
function PomodoroStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Group gap={2} style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 6, padding: 3 }}>
      <ActionIcon
        size={22}
        radius={4}
        variant="subtle"
        color="gray"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{ minWidth: 24, minHeight: 22 }}
      >
        <Text fw={600} size="sm" style={{ color: MUTED }}>−</Text>
      </ActionIcon>
      <Text fw={700} size="sm" ta="center" style={{ minWidth: 26, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      <ActionIcon
        size={22}
        radius={4}
        variant="subtle"
        color="gray"
        disabled={value >= 12}
        onClick={() => onChange(Math.min(12, value + 1))}
        style={{ minWidth: 24, minHeight: 22 }}
      >
        <Text fw={600} size="sm" style={{ color: MUTED }}>+</Text>
      </ActionIcon>
    </Group>
  );
}

// ── TimePanel ─────────────────────────────────────────────────────────────────
interface TimePanelProps {
  totalTimeTracked: number;
  isRunning: boolean;
  liveElapsed: number;
  estimatedPomodoros: number;
  onEstimateChange: (v: number) => void;
  onStart: () => void;
  onStop: () => void;
}

function TimePanel({
  totalTimeTracked,
  isRunning,
  liveElapsed,
  estimatedPomodoros,
  onEstimateChange,
  onStart,
  onStop,
}: TimePanelProps) {
  const done = Math.floor(totalTimeTracked / SESSION_SECONDS);
  const segmentCount = Math.max(estimatedPomodoros, done);

  return (
    <Box style={{ background: SUBTLE, border: `1px solid ${TINT_BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
      <Group justify="space-between" align="center" gap="md" wrap="wrap">
        <Stack gap={3}>
          <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
            Time tracked
          </Text>
          <Text
            style={{
              fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: INK,
              fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
            }}
          >
            {isRunning ? formatStopwatch(liveElapsed) : formatHM(totalTimeTracked)}
          </Text>
        </Stack>
        {isRunning ? (
          <Button
            leftSection={<Square size={13} />}
            size="sm"
            radius={6}
            color="red"
            onClick={onStop}
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            Stop
          </Button>
        ) : (
          <Button
            leftSection={<Play size={13} />}
            size="sm"
            radius={6}
            onClick={onStart}
            style={{ backgroundColor: PRIMARY, fontSize: 13, fontWeight: 600 }}
            styles={{ root: { '&:hover': { backgroundColor: PRIMARY_HOVER } } }}
          >
            Start
          </Button>
        )}
      </Group>

      <Group
        justify="space-between"
        align="flex-start"
        gap="md"
        wrap="wrap"
        mt="md"
        pt="sm"
        style={{ borderTop: `1px solid ${TINT_BORDER}` }}
      >
        <Stack gap={6}>
          <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
            Estimated pomodoros
          </Text>
          <Group gap={10} wrap="wrap">
            <PomodoroStepper value={estimatedPomodoros} onChange={onEstimateChange} />
            <Text size="xs" style={{ color: MUTED }}>
              {estimatedPomodoros === 0 ? 'No estimate' : `≈ ${formatHMFull(estimatedPomodoros * SESSION_SECONDS)} at 25m each`}
            </Text>
          </Group>
        </Stack>
        <Stack gap={6} align="flex-end">
          <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
            Done
          </Text>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {done} <Text component="span" fw={600} style={{ color: FAINT }}>/ {estimatedPomodoros}</Text>
          </Text>
        </Stack>
      </Group>

      {segmentCount > 0 && (
        <Group gap={4} mt="sm">
          {Array.from({ length: segmentCount }).map((_, i) => {
            const color = i < Math.min(done, estimatedPomodoros)
              ? PROGRESS_FILL
              : i < done
                ? PROGRESS_OVERFLOW
                : PROGRESS_TRACK;
            return <Box key={i} style={{ flex: 1, height: 6, background: color, borderRadius: 3 }} />;
          })}
        </Group>
      )}
    </Box>
  );
}

// ── ChecklistSection ──────────────────────────────────────────────────────────
interface ChecklistSectionProps {
  items: ChecklistItem[];
  newItemValue: string;
  onNewItemChange: (v: string) => void;
  onAddItem: () => void;
  onToggleItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

function ChecklistSection({ items, newItemValue, onNewItemChange, onAddItem, onToggleItem, onRemoveItem }: ChecklistSectionProps) {
  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Stack gap={10}>
      <Group justify="space-between" align="baseline">
        <Text style={fieldLabelStyle}>Checklist</Text>
        {total > 0 && (
          <Text size="xs" fw={600} style={{ color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
            {completed} / {total}
          </Text>
        )}
      </Group>

      {total > 0 && <Progress value={pct} size={4} radius={2} color={PRIMARY} styles={{ root: { background: PROGRESS_TRACK } }} />}

      <Stack gap={2}>
        {items.map((item) => (
          <Group key={item.id} gap={11} wrap="nowrap" py={4}>
            <Checkbox
              checked={item.completed}
              onChange={() => onToggleItem(item.id)}
              size="xs"
              radius={4}
              style={{ flexShrink: 0 }}
              styles={{
                input: {
                  borderColor: DISABLED_TEXT,
                  '&:checked': { backgroundColor: PRIMARY, borderColor: PRIMARY },
                },
              }}
            />
            <Text
              size="sm"
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13.5,
                fontWeight: item.completed ? 400 : 500,
                color: item.completed ? MUTED : INK,
                textDecoration: item.completed ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </Text>
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => onRemoveItem(item.id)} style={{ color: FAINT }}>
              <X size={13} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      <Group gap={8}>
        <TextInput
          placeholder="Add an item"
          value={newItemValue}
          onChange={(e) => onNewItemChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddItem();
            }
          }}
          size="sm"
          radius={6}
          style={{ flex: 1 }}
          styles={{ input: { fontSize: 13, borderColor: BORDER } }}
        />
        <Button
          size="sm"
          radius={6}
          variant="default"
          onClick={onAddItem}
          disabled={!newItemValue.trim()}
          style={{ fontSize: 13, fontWeight: 600, color: SECONDARY, borderColor: BORDER }}
        >
          Add
        </Button>
      </Group>
    </Stack>
  );
}

// ── DueDatePills ──────────────────────────────────────────────────────────────
interface DueDatePillsProps {
  value?: string;
  timeValue?: string;
  onChange: (date?: string) => void;
  onTimeChange: (time?: string) => void;
}

function DueDatePills({ value, timeValue, onChange, onTimeChange }: DueDatePillsProps) {
  const today = useMemo(() => localISODate(new Date()), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localISODate(d);
  }, []);

  const isToday = value === today;
  const isTomorrow = value === tomorrow;
  const isCustom = !!value && !isToday && !isTomorrow;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12,
    fontWeight: 600,
    color: active ? PRIMARY : SECONDARY,
    background: active ? PRIMARY_TINT : SURFACE,
    border: active ? 'none' : `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: '7px 11px',
    cursor: 'pointer',
  });

  return (
    <Stack gap={7}>
      <Text style={fieldLabelStyle}>Due date</Text>
      {isCustom ? (
        <Group gap={6}>
          <Box style={pillStyle(true)}>
            {new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Box>
          <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => { onChange(undefined); onTimeChange(undefined); }}>
            <X size={14} />
          </ActionIcon>
        </Group>
      ) : (
        <Group gap={6} wrap="wrap" align="center">
          <Box style={pillStyle(isToday)} onClick={() => onChange(today)}>Today</Box>
          <Box style={pillStyle(isTomorrow)} onClick={() => onChange(tomorrow)}>Tomorrow</Box>
          <DateInput
            value={null}
            onChange={(date) => {
              const d = date as unknown as Date | null;
              if (d) onChange(localISODate(d));
            }}
            placeholder="Pick"
            valueFormat="MMM D"
            size="xs"
            w={72}
            styles={{
              input: {
                ...pillStyle(false),
                textAlign: 'center',
                height: 'auto',
                minHeight: 0,
              },
            }}
          />
        </Group>
      )}

      {value && (
        <TimeInput
          value={timeValue ?? ''}
          onChange={(e) => onTimeChange(e.currentTarget.value || undefined)}
          size="xs"
          radius={6}
          placeholder="Optional time"
          style={{ width: 130 }}
          styles={{ input: { fontSize: 12.5, borderColor: BORDER } }}
        />
      )}
    </Stack>
  );
}

// ── TaskModal ─────────────────────────────────────────────────────────────────
interface TaskModalProps {
  task: Task | null;
  columnName?: string;
  opened: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateTaskDto) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onStartTimeTracking: (id: string) => void;
  onPauseTimeTracking: (id: string, trackingId: string) => void;
  onStopTimeTracking: (id: string, trackingId: string) => void;
  onToggleChecklistItem: (id: string, checklistItemId: string) => void;
}

export function TaskModal({
  task,
  columnName,
  opened,
  onClose,
  onSave,
  onDelete,
  onArchive,
  onStartTimeTracking,
  onStopTimeTracking,
  onToggleChecklistItem,
}: TaskModalProps) {
  const { data: lifeAreas } = useLifeAreas();
  const { data: allObjectives } = useObjectives(undefined);
  const { data: allKeyResults } = useKeyResults(undefined);

  const { data: liveTask } = useTask(task?.id || '');
  const currentTask = liveTask || task;

  const updateTaskMutation = useUpdateTask();
  const toggleRecurringDate = useToggleRecurringDate();

  const [formData, setFormData] = useState<UpdateTaskDto>({});
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const isTablet = useMediaQuery('(max-width: 759px)');
  const isPhone = useMediaQuery('(max-width: 519px)');

  const [liveElapsed, setLiveElapsed] = useState(0);
  useEffect(() => {
    const running = currentTask?.timeTracking?.find((t) => t.status === 'running');
    if (!running) {
      setLiveElapsed(0);
      return;
    }
    const start = new Date(running.startTime).getTime();
    const tick = () => setLiveElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentTask?.timeTracking]);

  const filteredObjectives = allObjectives?.filter(
    (obj) => !formData.lifeAreaId || obj.lifeAreaId === formData.lifeAreaId
  );
  const filteredKeyResults = allKeyResults?.filter(
    (kr) => !formData.objectiveId || kr.objectiveId === formData.objectiveId
  );

  useEffect(() => {
    if (currentTask) {
      setFormData({
        title: currentTask.title,
        description: currentTask.description,
        lifeAreaId: currentTask.lifeAreaId,
        objectiveId: currentTask.objectiveId,
        keyResultId: currentTask.keyResultId,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate?.split('T')[0],
        dueTime: currentTask.dueTime,
        estimatedPomodoros: currentTask.estimatedPomodoros,
        checklist: currentTask.checklist,
        tags: currentTask.tags,
        isRecurring: currentTask.isRecurring ?? false,
        recurringConfig: currentTask.recurringConfig,
        completedDates: currentTask.completedDates,
      });
    }
  }, [currentTask]);

  if (!currentTask) return null;

  const activeTracking = currentTask.timeTracking?.find((t) => t.status === 'running');

  const handleSave = () => {
    onSave(currentTask.id, formData);
    onClose();
    notifications.show({
      title: 'Task updated',
      message: formData.title || currentTask.title,
      color: 'green',
      autoClose: 2500,
    });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = { id: Date.now().toString(), title: newChecklistItem, completed: false };
    const updatedChecklist = [...(currentTask.checklist || []), newItem];
    updateTaskMutation.mutate({ id: currentTask.id, dto: { checklist: updatedChecklist } });
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    const updatedChecklist = currentTask.checklist?.filter((item) => item.id !== itemId) || [];
    updateTaskMutation.mutate({ id: currentTask.id, dto: { checklist: updatedChecklist } });
  };

  const handleDeleteClick = () => {
    modals.openConfirmModal({
      title: 'Delete task',
      children: (
        <Text style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#666666', lineHeight: '20px' }}>
          Are you sure you want to delete &quot;{currentTask.title}&quot;? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', style: { fontFamily: 'Inter, sans-serif', fontWeight: 600 } },
      onConfirm: () => {
        onDelete(currentTask.id);
        onClose();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton
      size={720}
      radius={isPhone ? 0 : 12}
      fullScreen={isPhone}
      title={
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Text style={{ fontFamily: 'Inter Display, sans-serif', fontSize: 17, fontWeight: 700, color: INK }}>
            Edit task
          </Text>
          <Group gap={8} wrap="wrap">
            {columnName && (
              <Box style={{ fontSize: 11.5, fontWeight: 600, color: SECONDARY, background: CHIP, borderRadius: 4, padding: '3px 8px' }}>
                {columnName}
              </Box>
            )}
            <Text style={{ fontSize: 11.5, color: MUTED }}>
              {formatCreatedEdited(currentTask.createdAt, currentTask.updatedAt)}
            </Text>
          </Group>
        </Stack>
      }
      styles={{
        content: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: isPhone ? '100vh' : 'calc(100vh - 80px)',
        },
        header: {
          padding: isPhone ? '16px 20px 12px' : '20px 24px 16px',
          borderBottom: `1px solid ${BORDER}`,
          flex: 'none',
        },
        close: { color: MUTED },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
      overlayProps={{ backgroundOpacity: 0.36, color: '#0F172A' }}
    >
      <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'minmax(0,1fr) 248px',
          }}
        >
          {/* Main column */}
          <Box
            style={{
              padding: isTablet ? '20px' : '22px 24px 24px',
              borderRight: isTablet ? 'none' : `1px solid ${BORDER}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              minWidth: 0,
            }}
          >
            <Stack gap={7}>
              <Text style={fieldLabelStyle}>Title</Text>
              <TextInput
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                size="md"
                radius={6}
                styles={{ input: { fontSize: 15, fontWeight: 500, borderColor: DISABLED_TEXT, color: INK } }}
              />
            </Stack>

            <Stack gap={7}>
              <Text style={fieldLabelStyle}>Description</Text>
              <Textarea
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={3}
                radius={6}
                styles={{ input: { fontSize: 13.5, lineHeight: 1.5, borderColor: BORDER, wordBreak: 'break-all' } }}
              />
            </Stack>

            <TimePanel
              totalTimeTracked={currentTask.totalTimeTracked ?? 0}
              isRunning={!!activeTracking}
              liveElapsed={liveElapsed}
              estimatedPomodoros={formData.estimatedPomodoros ?? 0}
              onEstimateChange={(v) => {
                setFormData({ ...formData, estimatedPomodoros: v });
                updateTaskMutation.mutate({ id: currentTask.id, dto: { estimatedPomodoros: v } });
              }}
              onStart={() => onStartTimeTracking(currentTask.id)}
              onStop={() => activeTracking && onStopTimeTracking(currentTask.id, activeTracking.id)}
            />

            <ChecklistSection
              items={currentTask.checklist ?? []}
              newItemValue={newChecklistItem}
              onNewItemChange={setNewChecklistItem}
              onAddItem={handleAddChecklistItem}
              onToggleItem={(itemId) => onToggleChecklistItem(currentTask.id, itemId)}
              onRemoveItem={handleRemoveChecklistItem}
            />
          </Box>

          {/* Attributes column */}
          <Box
            style={{
              padding: isTablet ? '20px' : '22px 24px 24px',
              borderTop: isTablet ? `1px solid ${BORDER}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              background: ATTR_BG,
              minWidth: 0,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
              Details
            </Text>

            <Stack gap={7}>
              <Text style={fieldLabelStyle}>Priority</Text>
              <SegmentedControl
                fullWidth
                value={formData.priority ?? 'medium'}
                onChange={(v) => setFormData({ ...formData, priority: v as Task['priority'] })}
                data={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                radius={7}
                styles={{
                  root: { background: CHIP, padding: 3 },
                  indicator: { boxShadow: '0 1px 2px rgba(15,23,42,.08)' },
                  label: { fontSize: 11, fontWeight: 600, padding: '6px 2px' },
                }}
              />
            </Stack>

            <DueDatePills
              value={formData.dueDate}
              timeValue={formData.dueTime}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
              onTimeChange={(time) => setFormData({ ...formData, dueTime: time })}
            />

            <Stack gap={7}>
              <Select
                label="Life area"
                placeholder="Select life area"
                value={formData.lifeAreaId}
                onChange={(value) => setFormData({ ...formData, lifeAreaId: value || undefined, objectiveId: undefined, keyResultId: undefined })}
                data={lifeAreas?.map((area) => ({ value: area.id, label: area.name })) || []}
                searchable
                clearable
                size="sm"
                styles={selectStyles}
              />
            </Stack>

            <Stack gap={7}>
              <Select
                label="Objective"
                placeholder="Not linked"
                value={formData.objectiveId}
                onChange={(value) => setFormData({ ...formData, objectiveId: value || undefined, keyResultId: undefined })}
                data={filteredObjectives?.map((obj) => ({ value: obj.id, label: obj.title })) || []}
                searchable
                clearable
                size="sm"
                styles={selectStyles}
              />
              <Text style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>
                Link an objective to unlock its key results below.
              </Text>
            </Stack>

            <Stack gap={7}>
              <Text style={{ ...fieldLabelStyle, color: formData.objectiveId ? SECONDARY : FAINT }}>Key result</Text>
              <Select
                placeholder={formData.objectiveId ? 'Link to key result' : 'Pick an objective first'}
                value={formData.keyResultId}
                onChange={(value) => setFormData({ ...formData, keyResultId: value || undefined })}
                data={filteredKeyResults?.map((kr) => ({ value: kr.id, label: kr.title })) || []}
                searchable
                clearable
                disabled={!formData.objectiveId}
                size="sm"
                styles={{
                  input: formData.objectiveId
                    ? { fontSize: 13, borderColor: BORDER }
                    : { fontSize: 13, borderColor: DISABLED_BORDER, background: SUBTLE, color: DISABLED_TEXT },
                }}
              />
            </Stack>

            <Group justify="space-between" align="center" gap="md" pt="sm" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Group gap={6}>
                  <RefreshCw size={13} color={MUTED} />
                  <Text style={fieldLabelStyle}>Recurring</Text>
                </Group>
                <Text style={{ fontSize: 11.5, color: MUTED }}>{formData.isRecurring ? 'On' : 'Off'}</Text>
              </Stack>
              <Switch
                checked={!!formData.isRecurring}
                onChange={(e) => {
                  const on = e.currentTarget.checked;
                  setFormData({
                    ...formData,
                    isRecurring: on,
                    recurringConfig: on ? (formData.recurringConfig ?? { startDate: '', endDate: '', frequency: 'daily' as const }) : undefined,
                    completedDates: on ? (formData.completedDates ?? []) : undefined,
                  });
                }}
                color="blue"
                size="md"
                styles={{ track: { cursor: 'pointer' } }}
              />
            </Group>

            {formData.isRecurring && (
              <Stack gap="sm" style={{ padding: 12, background: SUBTLE, borderRadius: 8, border: `1px solid ${HAIRLINE}` }}>
                <Select
                  label="Frequency"
                  size="xs"
                  value={formData.recurringConfig?.frequency ?? 'daily'}
                  onChange={(v) => setFormData({
                    ...formData,
                    recurringConfig: { ...(formData.recurringConfig ?? { startDate: '', endDate: '' }), frequency: v as RecurringConfig['frequency'] },
                  })}
                  data={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                  styles={selectStyles}
                />
                <TextInput
                  label="Start date"
                  type="date"
                  size="xs"
                  value={formData.recurringConfig?.startDate ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurringConfig: { ...(formData.recurringConfig ?? { endDate: '', frequency: 'daily' }), startDate: e.target.value },
                  })}
                  styles={{ label: fieldLabelStyle }}
                />
                <TextInput
                  label="End date"
                  type="date"
                  size="xs"
                  value={formData.recurringConfig?.endDate ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurringConfig: { ...(formData.recurringConfig ?? { startDate: '', frequency: 'daily' }), endDate: e.target.value },
                  })}
                  styles={{ label: fieldLabelStyle }}
                />

                {currentTask.isRecurring && currentTask.recurringConfig?.startDate && currentTask.recurringConfig?.endDate && (() => {
                  const allDates = getRecurringDates(currentTask.recurringConfig!);
                  const completed = new Set(currentTask.completedDates ?? []);
                  const total = allDates.length;
                  const done = completed.size;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" fw={600} c="dimmed">{done}/{total} days complete</Text>
                        <Text size="xs" c="dimmed">{pct}%</Text>
                      </Group>
                      <Progress value={pct} size="sm" radius={4} color={PRIMARY} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                        {allDates.map((d) => {
                          const isDone = completed.has(d);
                          const label = d.slice(5);
                          return (
                            <Tooltip key={d} label={d} withArrow position="top">
                              <button
                                type="button"
                                onClick={() => toggleRecurringDate.mutate({ id: currentTask.id, date: d })}
                                style={{
                                  width: 32, height: 32, borderRadius: 6, border: 'none',
                                  background: isDone ? PRIMARY : '#E2E8F0',
                                  color: isDone ? '#fff' : MUTED,
                                  fontSize: 9.5, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'background 0.15s',
                                }}
                              >
                                {label}
                              </button>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </Stack>
                  );
                })()}
              </Stack>
            )}

            <Stack gap={8} pt="sm" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <Text
                style={{ fontSize: 13, fontWeight: 600, color: SECONDARY, cursor: 'pointer' }}
                onClick={() => onArchive(currentTask.id)}
              >
                {currentTask.archived ? 'Unarchive task' : 'Archive task'}
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: 600, color: DANGER, cursor: 'pointer' }}
                onClick={handleDeleteClick}
              >
                Delete task
              </Text>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box
        style={{
          padding: isPhone ? '12px 20px' : '16px 24px',
          borderTop: `1px solid ${BORDER}`,
          background: SURFACE,
          flexShrink: 0,
          paddingBottom: isPhone ? 'max(12px, env(safe-area-inset-bottom))' : undefined,
        }}
      >
        <Group gap={10} justify="flex-end" style={{ flexDirection: isPhone ? 'column-reverse' : 'row' }}>
          <Button
            variant="outline"
            onClick={onClose}
            radius={6}
            fullWidth={isPhone}
            style={{ fontSize: 13.5, fontWeight: 600, color: SECONDARY, borderColor: BORDER, height: 40 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title?.trim()}
            radius={6}
            fullWidth={isPhone}
            style={{ backgroundColor: PRIMARY, fontSize: 13.5, fontWeight: 600, height: 40 }}
            styles={{ root: { '&:hover': { backgroundColor: PRIMARY_HOVER } } }}
          >
            Save changes
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
