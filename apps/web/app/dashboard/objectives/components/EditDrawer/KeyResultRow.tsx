'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Accordion, Box, Text, Group, Textarea, TextInput, Grid, NumberInput, ActionIcon, Progress, Badge } from '@mantine/core';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateKeyResult, useUpdateKeyResult } from '@/hooks/useObjectives';
import { KeyResultDraft, isDraftFilled } from './types';

interface KeyResultRowProps {
  draft: KeyResultDraft;
  index: number;
  mode: 'create' | 'edit';
  objectiveId?: string;
  onChange: (localId: string, patch: Partial<KeyResultDraft>) => void;
  onPersisted: (localId: string, id: string) => void;
  onRemove: (draft: KeyResultDraft) => void;
  reportSaveStart: () => void;
  reportSaveEnd: (ok: boolean) => void;
}

export function KeyResultRow({
  draft,
  index,
  mode,
  objectiveId,
  onChange,
  onPersisted,
  onRemove,
  reportSaveStart,
  reportSaveEnd,
}: KeyResultRowProps) {
  const t = useTranslations('objectives');
  const createMutation = useCreateKeyResult();
  const updateMutation = useUpdateKeyResult();

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (mode === 'edit') dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title, draft.description, draft.targetValue, draft.currentValue, draft.unit]);

  const debouncedDraft = useDebounce(draft, 500);

  useEffect(() => {
    if (mode !== 'edit' || !objectiveId || !dirtyRef.current) return;

    if (!debouncedDraft.id) {
      if (!isDraftFilled(debouncedDraft)) return; // wait for the user to finish filling required fields
      dirtyRef.current = false;
      reportSaveStart();
      createMutation.mutate(
        {
          objectiveId,
          dto: {
            title: debouncedDraft.title.trim(),
            description: debouncedDraft.description.trim() || undefined,
            targetValue: debouncedDraft.targetValue,
            currentValue: debouncedDraft.currentValue,
            unit: debouncedDraft.unit.trim(),
          },
        },
        {
          onSuccess: (created) => {
            onPersisted(debouncedDraft.localId, created.id);
            reportSaveEnd(true);
          },
          onError: () => reportSaveEnd(false),
        },
      );
    } else {
      dirtyRef.current = false;
      reportSaveStart();
      updateMutation.mutate(
        {
          objectiveId,
          keyResultId: debouncedDraft.id,
          dto: {
            title: debouncedDraft.title.trim(),
            description: debouncedDraft.description.trim() || undefined,
            targetValue: debouncedDraft.targetValue,
            currentValue: debouncedDraft.currentValue,
            unit: debouncedDraft.unit.trim(),
          },
        },
        {
          onSuccess: () => reportSaveEnd(true),
          onError: () => reportSaveEnd(false),
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  const pct = draft.targetValue > 0 ? Math.min(Math.round((draft.currentValue / draft.targetValue) * 100), 100) : 0;
  const isComplete = draft.targetValue > 0 && draft.currentValue >= draft.targetValue;
  const step = Math.max(1, Math.round((draft.targetValue || 0) * 0.01));

  const patch = (p: Partial<KeyResultDraft>) => onChange(draft.localId, p);

  return (
    <Accordion.Item value={draft.localId}>
      <Accordion.Control>
        <Group wrap="nowrap" gap="sm">
          <Badge
            circle
            size="lg"
            variant="filled"
            color={isComplete ? 'green' : 'blue'}
            style={{ flexShrink: 0 }}
          >
            {index + 1}
          </Badge>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600} lineClamp={1}>{draft.title || t('krTitlePlaceholder')}</Text>
            <Group gap="xs" wrap="nowrap" mt={4}>
              <Progress value={pct} color={isComplete ? 'green' : 'blue'} size="sm" style={{ flex: 1 }} />
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {t('krCompactProgress', { current: draft.currentValue, target: draft.targetValue, unit: draft.unit })}
              </Text>
            </Group>
          </Box>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Box pt="xs">
          <TextInput
            label={t('krTitleLabel')}
            description={t('krTitleDesc')}
            placeholder={t('krTitlePlaceholder')}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            required
            withAsterisk
            error={mountedRef.current && !draft.title.trim() ? t('fieldRequired') : undefined}
            radius={8}
            mb="sm"
          />
          <Textarea
            label={t('krDetailsLabel')}
            placeholder={t('krDetailsPlaceholder')}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            radius={8}
            mb="sm"
          />

          <Text size="sm" fw={600} mt="sm" mb={6}>{t('measurement')}</Text>
          <Grid grow mb="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label={t('targetGoal')}
                value={draft.targetValue}
                onChange={(v) => patch({ targetValue: Number(v) || 0 })}
                min={0}
                required
                withAsterisk
                error={mountedRef.current && !(draft.targetValue > 0) ? t('fieldRequired') : undefined}
                radius={8}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label={t('unitOfMeasure')}
                placeholder={t('unitPlaceholder')}
                value={draft.unit}
                onChange={(e) => patch({ unit: e.target.value })}
                required
                withAsterisk
                error={mountedRef.current && !draft.unit.trim() ? t('fieldRequired') : undefined}
                radius={8}
              />
            </Grid.Col>
          </Grid>

          <Text size="sm" fw={600} mb={6}>{t('currentProgress')}</Text>
          <Group gap="sm" wrap="nowrap" mb="sm">
            <ActionIcon
              size={48}
              variant="default"
              radius={8}
              onClick={() => patch({ currentValue: Math.max(0, draft.currentValue - step) })}
              aria-label={t('decreaseProgress')}
            >
              <Minus size={18} />
            </ActionIcon>
            <NumberInput
              value={draft.currentValue}
              onChange={(v) => patch({ currentValue: Math.max(0, Number(v) || 0) })}
              hideControls
              inputMode="decimal"
              min={0}
              ta="center"
              style={{ flex: 1 }}
              styles={{ input: { textAlign: 'center', height: 48, fontSize: 16, fontWeight: 600 } }}
            />
            <ActionIcon
              size={48}
              variant="default"
              radius={8}
              onClick={() => patch({ currentValue: draft.currentValue + step })}
              aria-label={t('increaseProgress')}
            >
              <Plus size={18} />
            </ActionIcon>
          </Group>

          <Box
            p="xs"
            mb="sm"
            style={{ backgroundColor: isComplete ? 'rgba(34,197,94,0.08)' : '#F8F9FA', borderRadius: 8 }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">{t('progressPreview')}</Text>
              <Text size="xs" fw={600} c={isComplete ? 'green' : undefined} style={{ whiteSpace: 'nowrap' }}>
                {t('krProgressValue', { current: draft.currentValue, target: draft.targetValue, unit: draft.unit, pct })}
              </Text>
            </Group>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => onRemove(draft)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'none',
              color: '#DC2626',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            <Trash2 size={14} /> {t('removeKeyResult')}
          </Box>
        </Box>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
