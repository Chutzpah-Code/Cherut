'use client';

import { useTranslations } from 'next-intl';
import { Stack, TextInput, Textarea, Select, Grid, Box, Text, Progress, UnstyledButton, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { ChevronRight } from 'lucide-react';
import { Objective } from '@/lib/api/services/objectives';
import { ObjectiveFormState } from './types';

interface LifeAreaOption {
  id: string;
  name: string;
}

interface ObjectiveTabProps {
  formState: ObjectiveFormState;
  setField: <K extends keyof ObjectiveFormState>(key: K, value: ObjectiveFormState[K]) => void;
  lifeAreas: LifeAreaOption[];
  objective: Objective | null;
  keyResultsCount: number;
  showErrors: boolean;
  onGoToKeyResults: () => void;
}

export function ObjectiveTab({ formState, setField, lifeAreas, objective, keyResultsCount, showErrors, onGoToKeyResults }: ObjectiveTabProps) {
  const t = useTranslations('objectives');

  return (
    <Stack gap="md">
      <TextInput
        label={t('titleLabel')}
        placeholder={t('titlePlaceholder')}
        value={formState.title}
        onChange={(e) => setField('title', e.target.value)}
        required
        withAsterisk
        error={showErrors && !formState.title.trim() ? t('fieldRequired') : undefined}
        radius={8}
      />

      <Textarea
        label={t('description')}
        placeholder={t('descriptionPlaceholder')}
        value={formState.description}
        onChange={(e) => setField('description', e.target.value)}
        rows={3}
        radius={8}
      />

      <Select
        label={t('lifeArea')}
        placeholder={t('selectLifeArea')}
        required
        withAsterisk
        data={lifeAreas.map((area) => ({ value: area.id, label: area.name }))}
        value={formState.lifeAreaId || null}
        onChange={(value) => setField('lifeAreaId', value || '')}
        error={showErrors && !formState.lifeAreaId ? t('fieldRequired') : undefined}
        radius={8}
      />

      <Grid grow>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateInput
            label={t('startDate')}
            placeholder={t('startDatePlaceholder')}
            value={formState.startDate}
            onChange={(value) => setField('startDate', value)}
            required
            withAsterisk
            error={showErrors && !formState.startDate ? t('fieldRequired') : undefined}
            radius={8}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateInput
            label={t('endDate')}
            placeholder={t('endDatePlaceholder')}
            value={formState.endDate}
            onChange={(value) => setField('endDate', value)}
            required
            withAsterisk
            error={showErrors && !formState.endDate ? t('fieldRequired') : undefined}
            radius={8}
          />
        </Grid.Col>
      </Grid>

      {objective && (
        <Box mt="sm" p="md" style={{ background: '#F8F9FA', borderRadius: 8 }}>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>{t('progress')}</Text>
            <Text size="sm" fw={600}>{objective.progress}%</Text>
          </Group>
          <Progress value={objective.progress} size="sm" radius={8} color="#4686FE" mb="sm" />
          <UnstyledButton onClick={onGoToKeyResults} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4686FE', fontSize: 14, fontWeight: 600 }}>
            {t('seeKeyResults', { count: keyResultsCount })} <ChevronRight size={14} />
          </UnstyledButton>
        </Box>
      )}
    </Stack>
  );
}
