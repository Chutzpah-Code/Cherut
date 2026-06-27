'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Group, Text, Select, Button, ActionIcon, Loader, Center, TextInput,
} from '@mantine/core';
import { Play, Square, Plus, Pencil, Trash2, Check, X, Clock } from 'lucide-react';
import { useBoardKanban } from '@/hooks/useBoards';
import {
  useStartTimeTracking,
  useStopTimeTracking,
  useAddManualTimeEntry,
  useEditTimeEntry,
  useDeleteTimeEntry,
} from '@/hooks/useTasks';
import { Task, TimeTrackingEntry } from '@/lib/api/services/tasks';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtTimer(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function fmtHuman(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function toLocalTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '00')}`;
}

function toLocalDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function todayStr(): string {
  return toLocalDate(new Date().toISOString());
}

function dayLabel(d: string): string {
  const today = todayStr();
  const yesterday = toLocalDate(new Date(Date.now() - 86400000).toISOString());
  if (d === today) return 'Hoje';
  if (d === yesterday) return 'Ontem';
  const [y, mo, da] = d.split('-');
  return `${da}/${mo}/${y}`;
}

// ── types ─────────────────────────────────────────────────────────────────────

type FlatEntry = {
  taskId: string;
  taskTitle: string;
  taskStatus: Task['status'];
  entry: TimeTrackingEntry;
};

const STATUS_DOT: Record<string, string> = {
  todo: '#0052CC',
  in_progress: '#E56910',
  done: '#22C55E',
};

// ── TimerBar ──────────────────────────────────────────────────────────────────

interface TimerBarProps {
  tasks: Task[];
  activeTask: Task | null;
  activeEntry: TimeTrackingEntry | null;
  onShowManual: () => void;
}

function TimerBar({ tasks, activeTask, activeEntry, onShowManual }: TimerBarProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const startMutation = useStartTimeTracking();
  const stopMutation = useStopTimeTracking();

  useEffect(() => {
    if (!activeEntry) { setLiveElapsed(0); return; }
    const start = new Date(activeEntry.startTime).getTime();
    const tick = () => setLiveElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeEntry?.id, activeEntry?.startTime]);

  const handleStart = () => {
    if (!selectedTaskId) return;
    startMutation.mutate(selectedTaskId);
  };

  const handleStop = () => {
    if (!activeTask || !activeEntry) return;
    stopMutation.mutate({ id: activeTask.id, trackingId: activeEntry.id });
  };

  return (
    <Box style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 12,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      {activeEntry ? (
        <>
          <Group gap={8} style={{ flex: 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'ttPulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
            <Text size="sm" fw={600} c="green.7">Rodando</Text>
            <Text size="sm" c="dimmed">—</Text>
            <Text size="sm" fw={500} style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
              {activeTask?.title}
            </Text>
          </Group>
          <Text fw={700} style={{ fontFamily: 'monospace', fontSize: 24, color: '#166534', letterSpacing: 2, flexShrink: 0 }}>
            {fmtTimer(liveElapsed)}
          </Text>
          <Button
            leftSection={<Square size={14} />}
            color="red"
            size="sm"
            onClick={handleStop}
            loading={stopMutation.isPending}
          >
            Stop
          </Button>
        </>
      ) : (
        <>
          <Select
            placeholder="Selecionar tarefa..."
            data={tasks.map(t => ({ value: t.id, label: t.title }))}
            value={selectedTaskId}
            onChange={setSelectedTaskId}
            searchable
            clearable
            size="sm"
            style={{ flex: 1, minWidth: 200 }}
          />
          <Text style={{ fontFamily: 'monospace', fontSize: 22, color: '#94A3B8', letterSpacing: 2, flexShrink: 0 }}>
            00:00:00
          </Text>
          <Button
            leftSection={<Play size={14} />}
            color="green"
            size="sm"
            onClick={handleStart}
            disabled={!selectedTaskId}
            loading={startMutation.isPending}
          >
            Start
          </Button>
          <Button
            leftSection={<Plus size={14} />}
            variant="light"
            color="blue"
            size="sm"
            onClick={onShowManual}
          >
            Manual
          </Button>
        </>
      )}
    </Box>
  );
}

// ── ManualEntryForm ───────────────────────────────────────────────────────────

interface ManualEntryFormProps {
  tasks: Task[];
  onClose: () => void;
}

function ManualEntryForm({ tasks, onClose }: ManualEntryFormProps) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const addMutation = useAddManualTimeEntry();

  const isValid = !!taskId && !!startTime && !!endTime && !!date &&
    buildISO(date, endTime) > buildISO(date, startTime);

  const handleSave = () => {
    if (!isValid || !taskId) return;
    addMutation.mutate(
      { id: taskId, dto: { startTime: buildISO(date, startTime), endTime: buildISO(date, endTime) } },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Box style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
      <Group gap={10} wrap="wrap" align="flex-end">
        <Select
          label="Tarefa"
          placeholder="Selecionar..."
          data={tasks.map(t => ({ value: t.id, label: t.title }))}
          value={taskId}
          onChange={setTaskId}
          searchable
          size="sm"
          style={{ flex: 1, minWidth: 180 }}
        />
        <TextInput
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          size="sm"
          style={{ width: 140 }}
        />
        <TextInput
          label="Início"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          size="sm"
          style={{ width: 110 }}
        />
        <TextInput
          label="Fim"
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          size="sm"
          style={{ width: 110 }}
        />
        <Group gap={6} style={{ paddingBottom: 2 }}>
          <Button size="sm" color="blue" onClick={handleSave} disabled={!isValid} loading={addMutation.isPending}>
            Salvar
          </Button>
          <Button size="sm" variant="subtle" color="gray" onClick={onClose}>
            Cancelar
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

// ── TimeEntryRow ──────────────────────────────────────────────────────────────

interface TimeEntryRowProps {
  fe: FlatEntry;
  isLast: boolean;
}

function TimeEntryRow({ fe, isLast }: TimeEntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const editMutation = useEditTimeEntry();
  const deleteMutation = useDeleteTimeEntry();

  const enterEdit = () => {
    setEditDate(fe.entry.startTime ? toLocalDate(fe.entry.startTime) : todayStr());
    setEditStart(fe.entry.startTime ? toLocalTime(fe.entry.startTime) : '');
    setEditEnd(fe.entry.endTime ? toLocalTime(fe.entry.endTime) : '');
    setEditing(true);
  };

  const isEditValid = !!editStart && !!editEnd && !!editDate &&
    buildISO(editDate, editEnd) > buildISO(editDate, editStart);

  const handleSave = () => {
    if (!isEditValid) return;
    editMutation.mutate(
      { id: fe.taskId, trackingId: fe.entry.id, dto: { startTime: buildISO(editDate, editStart), endTime: buildISO(editDate, editEnd) } },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: fe.taskId, trackingId: fe.entry.id });
  };

  const dotColor = STATUS_DOT[fe.taskStatus] ?? '#0052CC';
  const duration = fe.entry.duration ?? 0;
  const borderBottom = isLast ? 'none' : '1px solid #F1F5F9';

  if (editing) {
    return (
      <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 20px', background: '#F0F9FF', borderBottom, flexWrap: 'wrap' }}>
        <TextInput type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="xs" style={{ width: 130 }} />
        <TextInput type="time" value={editStart} onChange={e => setEditStart(e.target.value)} size="xs" style={{ width: 100 }} />
        <Text size="xs" c="dimmed" style={{ paddingBottom: 7 }}>–</Text>
        <TextInput type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} size="xs" style={{ width: 100 }} />
        <Group gap={4} style={{ paddingBottom: 2 }}>
          <ActionIcon size="sm" color="green" onClick={handleSave} disabled={!isEditValid} loading={editMutation.isPending}>
            <Check size={12} />
          </ActionIcon>
          <ActionIcon size="sm" color="gray" variant="subtle" onClick={() => setEditing(false)}>
            <X size={12} />
          </ActionIcon>
        </Group>
      </Box>
    );
  }

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <Text size="sm" fw={500} style={{ flex: 1, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {fe.taskTitle}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0, minWidth: 120, textAlign: 'right' }}>
        {fe.entry.startTime ? toLocalTime(fe.entry.startTime) : '?'}
        {' – '}
        {fe.entry.endTime ? toLocalTime(fe.entry.endTime) : '...'}
      </Text>
      <Text size="sm" fw={600} style={{ flexShrink: 0, minWidth: 52, textAlign: 'right', color: '#0F172A', fontFamily: 'monospace' }}>
        {fmtHuman(duration)}
      </Text>
      <ActionIcon size="sm" variant="subtle" color="blue" onClick={enterEdit}>
        <Pencil size={12} />
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="red" onClick={handleDelete} loading={deleteMutation.isPending}>
        <Trash2 size={12} />
      </ActionIcon>
    </Box>
  );
}

// ── BoardTimeLogView ──────────────────────────────────────────────────────────

interface BoardTimeLogViewProps {
  boardId: string;
}

export function BoardTimeLogView({ boardId }: BoardTimeLogViewProps) {
  const { data: columns, isLoading } = useBoardKanban(boardId);
  const [showManual, setShowManual] = useState(false);

  const tasks: Task[] = useMemo(
    () => columns?.flatMap(c => c.tasks).filter(t => !t.archived) ?? [],
    [columns],
  );

  const activeTask = useMemo(
    () => tasks.find(t => t.timeTracking?.some(e => e.status === 'running')) ?? null,
    [tasks],
  );

  const activeEntry = useMemo(
    () => activeTask?.timeTracking?.find(e => e.status === 'running') ?? null,
    [activeTask],
  );

  const flatEntries: FlatEntry[] = useMemo(() => tasks
    .flatMap(t =>
      (t.timeTracking ?? [])
        .filter(e => e.status === 'completed' || e.status === 'paused')
        .map(e => ({ taskId: t.id, taskTitle: t.title, taskStatus: t.status, entry: e }))
    )
    .sort((a, b) => b.entry.startTime.localeCompare(a.entry.startTime)),
    [tasks],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FlatEntry[]>();
    for (const fe of flatEntries) {
      const day = toLocalDate(fe.entry.startTime);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(fe);
    }
    return map;
  }, [flatEntries]);

  if (isLoading) {
    return <Center h={400}><Loader size="sm" color="blue" /></Center>;
  }

  const hasContent = flatEntries.length > 0 || !!activeEntry;

  return (
    <>
      <style>{`@keyframes ttPulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
      <Stack gap="md" py="md">
        <TimerBar
          tasks={tasks}
          activeTask={activeTask}
          activeEntry={activeEntry}
          onShowManual={() => setShowManual(v => !v)}
        />

        {showManual && (
          <ManualEntryForm tasks={tasks} onClose={() => setShowManual(false)} />
        )}

        {!hasContent ? (
          <Center h={300}>
            <Stack align="center" gap={8}>
              <Clock size={32} color="#94A3B8" />
              <Text size="sm" c="dimmed">Nenhum tempo registrado neste board.</Text>
              <Text size="xs" c="dimmed">Use o timer acima para começar.</Text>
            </Stack>
          </Center>
        ) : (
          <Box style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            {activeTask && activeEntry && (
              <>
                <Box style={{ padding: '8px 20px', background: '#F0FDF4', borderBottom: '1px solid #BBF7D0' }}>
                  <Text size="xs" fw={700} c="green.7" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Rodando agora
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#F0FDF4', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'ttPulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
                  <Text size="sm" fw={500} style={{ flex: 1, color: '#166534' }}>{activeTask.title}</Text>
                  <Text size="sm" c="green.7">{toLocalTime(activeEntry.startTime)} – agora</Text>
                </Box>
              </>
            )}

            {Array.from(grouped.entries()).map(([day, entries]) => {
              const dayTotal = entries.reduce((s, fe) => s + (fe.entry.duration ?? 0), 0);
              return (
                <React.Fragment key={day}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {dayLabel(day)}
                    </Text>
                    <Text size="xs" fw={600} c="dimmed">Total: {fmtHuman(dayTotal)}</Text>
                  </Box>
                  {entries.map((fe, i) => (
                    <TimeEntryRow key={fe.entry.id} fe={fe} isLast={i === entries.length - 1} />
                  ))}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Stack>
    </>
  );
}
