'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Progress, Stack, Text, Menu, ActionIcon } from '@mantine/core';
import { ChevronDown, MoreHorizontal, Trash2, Archive, Plus } from 'lucide-react';
import {
  useObjectives,
  useDeleteObjective,
  useUpdateObjective,
  useUpdateKeyResult,
  useDeleteKeyResult,
} from '@/hooks/useObjectives';
import { RowsSkeleton } from './skeletons';
import { useUndoableDelete } from './useUndoableDelete';
import { useRowKeyNav } from './useRowKeyNav';

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

const KR_VISIBLE = 5;
const KR_ID_SEP = '::';

function quarterOf(dateStr: string) {
  return Math.floor(new Date(dateStr).getMonth() / 3) + 1;
}

function quarterChip(startDate?: string, endDate?: string): string | null {
  if (!startDate) return null;
  const startQ = quarterOf(startDate);
  const startY = new Date(startDate).getFullYear();
  if (!endDate) return `Q${startQ} ${startY}`;
  const endQ = quarterOf(endDate);
  const endY = new Date(endDate).getFullYear();
  if (startY !== endY) return `Q${startQ} ${startY}–Q${endQ} ${endY}`;
  return startQ === endQ ? `Q${startQ} ${startY}` : `Q${startQ}–Q${endQ} ${startY}`;
}

function ObjectiveRow({
  objective, open, onToggle, onEsc, isKRPending, onDeleteKR, onBumpKR, onDeleteObjective, onArchiveObjective,
}: {
  objective: any;
  open: boolean;
  onToggle: () => void;
  onEsc: () => void;
  isKRPending: (objectiveId: string, keyResultId: string) => boolean;
  onDeleteKR: (objectiveId: string, keyResultId: string) => void;
  onBumpKR: (objectiveId: string, kr: any) => void;
  onDeleteObjective: (id: string) => void;
  onArchiveObjective: (id: string) => void;
}) {
  const keyResults = (objective.keyResults ?? []).filter((kr: any) => !isKRPending(objective.id, kr.id));
  const visibleKRs = keyResults.slice(0, KR_VISIBLE);
  const remaining = keyResults.length - visibleKRs.length;
  const panelId = `objective-panel-${objective.id}`;
  const quarter = quarterChip(objective.startDate, objective.endDate);

  return (
    <Box style={{ border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 10 }}>
      <Box
        role="button"
        tabIndex={0}
        data-row-nav
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          } else if (e.key === 'Escape' && open) {
            onEsc();
          }
        }}
        style={{ padding: '12px 14px', cursor: 'pointer' }}
      >
        <Group wrap="nowrap" gap={10}>
          <ChevronDown
            size={16}
            color="#94A3B8"
            style={{
              flexShrink: 0,
              transition: 'transform 150ms ease',
              transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
          />
          <Text
            size="sm"
            fw={600}
            style={{ color: '#0F172A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {objective.title}
          </Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {keyResults.length > 0 ? `${keyResults.length} KR${keyResults.length !== 1 ? 's' : ''}` : 'No KRs'}
          </Text>
          {quarter && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9',
              borderRadius: 4, padding: '2px 8px', flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              {quarter}
            </span>
          )}
          <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748B', flexShrink: 0, width: 38, textAlign: 'right' }}>
            {Math.round(objective.progress ?? 0)}%
          </Text>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={`Actions for "${objective.title}"`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} color="#64748B" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item leftSection={<Archive size={14} />} onClick={() => onArchiveObjective(objective.id)}>
                Archive
              </Menu.Item>
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => onDeleteObjective(objective.id)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Box style={{ padding: '8px 0 0 26px' }}>
          <Progress value={objective.progress ?? 0} size={6} color="#0052CC" radius={3} />
        </Box>
      </Box>

      {open && (
        <Box id={panelId} style={{ padding: '0 14px 14px 40px', borderTop: '1px solid #EFF1F5' }}>
          {keyResults.length === 0 ? (
            <Stack gap={4} pt={12}>
              <Text size="xs" c="dimmed">No key results defined yet.</Text>
              <Link href="/dashboard/objectives" style={{ fontSize: 12, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
                Add a key result →
              </Link>
            </Stack>
          ) : (
            <Stack gap={10} pt={12}>
              {visibleKRs.map((kr: any) => {
                const pct = kr.targetValue > 0
                  ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
                  : 0;
                return (
                  <Box key={kr.id}>
                    <Group justify="space-between" mb={4} wrap="nowrap" gap={8}>
                      <Text
                        size="xs"
                        fw={500}
                        style={{
                          color: kr.isCompleted ? '#94A3B8' : '#0F172A',
                          textDecoration: kr.isCompleted ? 'line-through' : 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0,
                        }}
                      >
                        {kr.title}
                      </Text>
                      <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: kr.isCompleted ? '#15803D' : '#64748B' }}>
                          {kr.currentValue}/{kr.targetValue}
                        </Text>
                        {!kr.isCompleted && (
                          <ActionIcon size="xs" variant="subtle" aria-label={`Bump progress on "${kr.title}"`} onClick={() => onBumpKR(objective.id, kr)}>
                            <Plus size={12} />
                          </ActionIcon>
                        )}
                        <Menu position="bottom-end" withinPortal>
                          <Menu.Target>
                            <ActionIcon size="xs" variant="subtle" aria-label={`Actions for "${kr.title}"`}>
                              <MoreHorizontal size={12} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => onDeleteKR(objective.id, kr.id)}>
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Group>
                    <Progress value={pct} size={4} color={kr.isCompleted ? '#16A34A' : '#94A3B8'} radius={3} />
                  </Box>
                );
              })}
              {remaining > 0 && (
                <Text size="xs" c="dimmed">{remaining} more key result{remaining !== 1 ? 's' : ''}</Text>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}

const OPEN_STATE_KEY = 'dashboard_open_objectives';

export function ObjectivesPanel() {
  const { data: objectives = [], isLoading } = useObjectives();
  const [openIds, setOpenIds] = useState<Record<string, boolean> | null>(null);
  const { containerRef, onKeyDown } = useRowKeyNav<HTMLDivElement>();

  const deleteObjective = useDeleteObjective();
  const updateObjective = useUpdateObjective();
  const updateKeyResult = useUpdateKeyResult();
  const deleteKeyResult = useDeleteKeyResult();

  const undoableDeleteObjective = useUndoableDelete<string>(
    (id) => deleteObjective.mutate(id),
    { label: 'Objective' },
  );
  const undoableDeleteKR = useUndoableDelete<string>(
    (compositeId) => {
      const [objectiveId, keyResultId] = compositeId.split(KR_ID_SEP);
      deleteKeyResult.mutate({ objectiveId, keyResultId });
    },
    { label: 'Key result' },
  );

  const active = useMemo(
    () => (objectives as any[]).filter((o) => o.isActive !== false && !o.isArchived && o.status === 'active' && !undoableDeleteObjective.isPending(o.id)),
    [objectives, undoableDeleteObjective],
  );

  const totalKRs = useMemo(
    () => active.reduce((sum, o) => sum + (o.keyResults?.length ?? 0), 0),
    [active],
  );

  // First objective open by default; persisted per user across visits
  const effectiveOpen = openIds ?? (() => {
    try {
      const saved = localStorage.getItem(OPEN_STATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse/storage errors, fall through to default
    }
    return active.length > 0 ? { [active[0].id]: true } : {};
  })();

  const toggle = (id: string) => {
    const next = { ...effectiveOpen, [id]: !effectiveOpen[id] };
    setOpenIds(next);
    try {
      localStorage.setItem(OPEN_STATE_KEY, JSON.stringify(next));
    } catch {
      // ignore write failures (private browsing, storage disabled)
    }
  };

  const close = (id: string) => {
    const next = { ...effectiveOpen, [id]: false };
    setOpenIds(next);
    try {
      localStorage.setItem(OPEN_STATE_KEY, JSON.stringify(next));
    } catch {
      // ignore write failures (private browsing, storage disabled)
    }
  };

  const bumpKR = (objectiveId: string, kr: any) => {
    const nextValue = Math.min(kr.targetValue, kr.currentValue + 1);
    updateKeyResult.mutate({
      objectiveId,
      keyResultId: kr.id,
      dto: { currentValue: nextValue, isCompleted: nextValue >= kr.targetValue },
    });
  };

  return (
    <Box style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={2}>
        <Text style={LABEL}>Objectives</Text>
        <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
          View all objectives →
        </Link>
      </Group>
      {active.length > 0 && (
        <Text size="xs" c="dimmed" mb={12}>
          {active.length} objective{active.length !== 1 ? 's' : ''} · {totalKRs} key result{totalKRs !== 1 ? 's' : ''} · click an objective to expand
        </Text>
      )}

      {isLoading ? (
        <RowsSkeleton rows={3} height={56} />
      ) : active.length === 0 ? (
        <Stack gap={6}>
          <Text size="sm" c="dimmed">No objectives yet.</Text>
          <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
            Create an objective →
          </Link>
        </Stack>
      ) : (
        <Stack gap={0} ref={containerRef} onKeyDown={onKeyDown}>
          {active.map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              open={!!effectiveOpen[objective.id]}
              onToggle={() => toggle(objective.id)}
              onEsc={() => close(objective.id)}
              isKRPending={(objectiveId, keyResultId) => undoableDeleteKR.isPending(`${objectiveId}${KR_ID_SEP}${keyResultId}`)}
              onDeleteKR={(objectiveId, keyResultId) => undoableDeleteKR.remove(`${objectiveId}${KR_ID_SEP}${keyResultId}`)}
              onBumpKR={bumpKR}
              onDeleteObjective={(id) => undoableDeleteObjective.remove(id)}
              onArchiveObjective={(id) => updateObjective.mutate({ id, dto: { isArchived: true } })}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
