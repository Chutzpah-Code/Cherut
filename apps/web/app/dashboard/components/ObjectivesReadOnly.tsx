'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Progress, Stack, Text, ActionIcon } from '@mantine/core';
import { ChevronRight } from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { RowsSkeleton } from './skeletons';

const LABEL: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#0F172A' };
const KR_VISIBLE = 4;
const OBJECTIVES_VISIBLE = 5;

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

function ObjectiveCard({ objective }: { objective: any }) {
  const [expanded, setExpanded] = useState(false);
  const keyResults = objective.keyResults ?? [];
  const visibleKRs = keyResults.slice(0, KR_VISIBLE);
  const remaining = keyResults.length - visibleKRs.length;
  const quarter = quarterChip(objective.startDate, objective.endDate);

  return (
    <Box style={{ border: '1px solid #E8EBF0', borderRadius: 8, padding: '14px 16px' }}>
      <Group
        align="center"
        gap={12}
        wrap="nowrap"
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: 'pointer' }}
      >
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          aria-label={expanded ? 'Collapse key results' : 'Expand key results'}
          style={{ flexShrink: 0, color: '#94A3B8', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}
        >
          <ChevronRight size={14} />
        </ActionIcon>
        <Text style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {objective.title}
        </Text>
        {quarter && <Text style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>{quarter}</Text>}
        <Text style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(objective.progress ?? 0)}%
        </Text>
      </Group>
      <Progress value={objective.progress ?? 0} size={6} color="#9DB8F2" radius={3} style={{ margin: '10px 0 0' }} />

      {expanded && (
        keyResults.length === 0 ? (
          <Text style={{ fontSize: 12.5, color: '#64748B', marginTop: 14 }}>No key results defined yet</Text>
        ) : (
          <Stack gap={10} mt={14}>
            {visibleKRs.map((kr: any) => {
              const pct = kr.targetValue > 0 ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100)) : 0;
              return (
                <Box key={kr.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 84px 76px', alignItems: 'center', gap: 12 }}>
                  <Text style={{
                    fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: kr.isCompleted ? '#64748B' : '#0F172A', textDecoration: kr.isCompleted ? 'line-through' : 'none',
                  }}>
                    {kr.title}
                  </Text>
                  <Box style={{ height: 4, background: '#EDF1F6', borderRadius: 2, overflow: 'hidden' }}>
                    {pct > 0 && <Box style={{ width: `${pct}%`, height: '100%', background: kr.isCompleted ? '#8FC9A6' : '#9DB8F2' }} />}
                  </Box>
                  <Text style={{
                    fontSize: 12.5, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                    color: kr.isCompleted ? '#15803D' : '#64748B',
                  }}>
                    {kr.currentValue}/{kr.targetValue}
                  </Text>
                </Box>
              );
            })}
            {remaining > 0 && <Text style={{ fontSize: 12.5, color: '#64748B' }}>{remaining} more key result{remaining !== 1 ? 's' : ''}</Text>}
          </Stack>
        )
      )}
    </Box>
  );
}

export function ObjectivesReadOnly() {
  const { data: objectives = [], isLoading } = useObjectives();

  const active = useMemo(
    () => (objectives as any[]).filter((o) => o.isActive !== false && !o.isArchived && o.status === 'active'),
    [objectives],
  );
  const visibleObjectives = active.slice(0, OBJECTIVES_VISIBLE);
  const remainingObjectives = active.length - visibleObjectives.length;
  const { totalKRs, completeKRs } = useMemo(() => {
    let total = 0;
    let complete = 0;
    for (const o of active) {
      for (const kr of o.keyResults ?? []) {
        total++;
        if (kr.isCompleted) complete++;
      }
    }
    return { totalKRs: total, completeKRs: complete };
  }, [active]);

  return (
    <Box id="objectives" style={{ padding: '24px 28px 26px' }}>
      <Group justify="space-between" align="baseline">
        <Text style={LABEL}>Objectives &amp; key results</Text>
        <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none' }}>All objectives</Link>
      </Group>
      <Text style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 14px' }}>
        {active.length > 0
          ? `${active.length} objective${active.length !== 1 ? 's' : ''} · ${totalKRs} key result${totalKRs !== 1 ? 's' : ''} · ${completeKRs} of ${totalKRs} complete`
          : 'No objectives yet'}
      </Text>

      {isLoading ? (
        <RowsSkeleton rows={3} height={90} />
      ) : active.length === 0 ? (
        <Stack gap={6}>
          <Text size="sm" c="dimmed">No objectives yet.</Text>
          <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 500, color: '#1D4ED8', textDecoration: 'none' }}>Create an objective →</Link>
        </Stack>
      ) : (
        <Stack gap={10}>
          {visibleObjectives.map((objective) => <ObjectiveCard key={objective.id} objective={objective} />)}
          {remainingObjectives > 0 && (
            <Link href="/dashboard/objectives" style={{ fontSize: 12.5, fontWeight: 500, color: '#1D4ED8', textDecoration: 'none' }}>
              +{remainingObjectives} more objective{remainingObjectives !== 1 ? 's' : ''}
            </Link>
          )}
        </Stack>
      )}
    </Box>
  );
}
