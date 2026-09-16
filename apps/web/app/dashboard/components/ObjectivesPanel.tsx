'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Group, Progress, Stack, Text } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { RowsSkeleton } from './skeletons';

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#64748B',
};

const KR_VISIBLE = 5;

function ObjectiveRow({ objective, open, onToggle }: { objective: any; open: boolean; onToggle: () => void }) {
  const keyResults = objective.keyResults ?? [];
  const visibleKRs = keyResults.slice(0, KR_VISIBLE);
  const remaining = keyResults.length - visibleKRs.length;
  const panelId = `objective-panel-${objective.id}`;

  return (
    <Box style={{ borderBottom: '1px solid #F1F5F9' }}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{ padding: '12px 0', cursor: 'pointer' }}
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
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap" gap={8} mb={6}>
              <Text
                size="sm"
                fw={500}
                style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {objective.title}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748B', flexShrink: 0, width: 40, textAlign: 'right' }}>
                {Math.round(objective.progress ?? 0)}%
              </Text>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap={8}>
              <Progress value={objective.progress ?? 0} size={6} color="#0052CC" radius={3} style={{ flex: 1 }} />
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {keyResults.length > 0 ? `${keyResults.length} KR${keyResults.length !== 1 ? 's' : ''}` : 'No KRs'}
              </Text>
            </Group>
          </Box>
        </Group>
      </Box>

      {open && (
        <Box id={panelId} style={{ padding: '0 0 14px 26px' }}>
          {keyResults.length === 0 ? (
            <Text size="xs" c="dimmed">No key results defined yet.</Text>
          ) : (
            <Stack gap={10}>
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
                      <Text style={{ fontSize: 11, fontWeight: 600, color: kr.isCompleted ? '#15803D' : '#64748B', flexShrink: 0 }}>
                        {kr.currentValue}/{kr.targetValue}
                      </Text>
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

export function ObjectivesPanel() {
  const { data: objectives = [], isLoading } = useObjectives();
  const [openIds, setOpenIds] = useState<Record<string, boolean> | null>(null);

  const active = useMemo(
    () => (objectives as any[]).filter((o) => o.isActive !== false && o.status === 'active'),
    [objectives],
  );

  // First objective open by default, computed once data arrives
  const effectiveOpen = openIds ?? (active.length > 0 ? { [active[0].id]: true } : {});

  const toggle = (id: string) => {
    setOpenIds({ ...effectiveOpen, [id]: !effectiveOpen[id] });
  };

  return (
    <Box style={{ padding: '20px 24px' }}>
      <Group justify="space-between" mb={14}>
        <Text style={LABEL}>Objectives</Text>
        <Link href="/dashboard/objectives" style={{ fontSize: 13, fontWeight: 500, color: '#0052CC', textDecoration: 'none' }}>
          View all objectives →
        </Link>
      </Group>

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
        <Stack gap={0}>
          {active.map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              open={!!effectiveOpen[objective.id]}
              onToggle={() => toggle(objective.id)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
