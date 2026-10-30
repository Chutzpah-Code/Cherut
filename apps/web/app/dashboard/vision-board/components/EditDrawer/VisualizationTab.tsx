'use client';

import { useTranslations } from 'next-intl';
import { Stack, Box, Text, Select, SegmentedControl, Divider, Textarea, Progress } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useObjectives } from '@/hooks/useObjectives';
import { countFilledVisualizationFields, VISUALIZATION_PROGRESS_TOTAL } from '@/lib/vision-board/visualization-fields';
import { TappableScale } from '@/components/ui/TappableScale';
import { AudioPicker } from './AudioPicker';
import { EditDrawerFormState, SetField } from './types';

const FEELING_OPTIONS = [
  'calm', 'confidence', 'courage', 'clarity', 'gratitude',
  'motivation', 'security', 'freedom', 'focus', 'joy',
] as const;

interface VisualizationTabProps {
  formState: EditDrawerFormState;
  setField: SetField;
}

export function VisualizationTab({ formState, setField }: VisualizationTabProps) {
  const t = useTranslations('visionBoard.visualizationTab');
  const tFeelings = useTranslations('visionBoard.editDrawer.feelings');
  const { data: objectives } = useObjectives(undefined);
  const filledCount = countFilledVisualizationFields(formState);

  return (
    <Stack gap="md">
      <Box>
        <Text size="xs" c="dimmed" mb={4}>{t('progressLabel', { current: filledCount, total: VISUALIZATION_PROGRESS_TOTAL })}</Text>
        <Progress value={(filledCount / VISUALIZATION_PROGRESS_TOTAL) * 100} color="blue" radius="xl" />
      </Box>

      <Text size="sm" c="dimmed">{t('persistNote')}</Text>

      <Select
        label={t('relatedObjective')}
        placeholder={t('relatedObjectivePlaceholder')}
        value={formState.objectiveId ?? null}
        onChange={(value) => setField('objectiveId', value || undefined)}
        data={objectives?.map((obj) => ({ value: obj.id, label: obj.title })) || []}
        searchable
        clearable
        radius={8}
      />

      <Box>
        <Text size="sm" fw={600} mb={6}>{t('practiceDuration')}</Text>
        <SegmentedControl
          fullWidth
          value={String(formState.plannedPracticeDurationMinutes)}
          onChange={(v) => setField('plannedPracticeDurationMinutes', Number(v) as 5 | 10 | 15)}
          data={[
            { value: '5', label: t('duration5min') },
            { value: '10', label: t('duration10min') },
            { value: '15', label: t('duration15min') },
          ]}
          radius={8}
        />
      </Box>

      <AudioPicker formState={formState} setField={setField} />

      <Divider label={t('stateDivider')} labelPosition="left" />

      <Select
        label={t('currentEmotion')}
        placeholder={t('currentEmotionPlaceholder')}
        value={formState.currentEmotion ?? null}
        onChange={(value) => setField('currentEmotion', value || undefined)}
        data={FEELING_OPTIONS.map((f) => ({ value: f, label: tFeelings(f) }))}
        clearable
        radius={8}
      />

      <Box>
        <Text size="sm" fw={600} mb={6}>{t('currentEnergy')} — {formState.currentEnergy}/10</Text>
        <TappableScale
          value={formState.currentEnergy}
          onChange={(v) => setField('currentEnergy', v)}
          lowLabel={t('lowLabel')}
          highLabel={t('highLabel')}
        />
      </Box>

      <Box>
        <Text size="sm" fw={600} mb={6}>{t('currentConfidence')} — {formState.currentConfidence}/10</Text>
        <TappableScale
          value={formState.currentConfidence}
          onChange={(v) => setField('currentConfidence', v)}
          lowLabel={t('lowLabel')}
          highLabel={t('highLabel')}
        />
      </Box>

      <Textarea
        label={t('desiredState')}
        placeholder={t('desiredStatePlaceholder')}
        value={formState.desiredState}
        onChange={(e) => setField('desiredState', e.target.value)}
        autosize
        minRows={1}
        maxRows={3}
        maxLength={500}
        radius={8}
      />

      <Textarea
        label={t('empoweringBelief')}
        placeholder={t('empoweringBeliefPlaceholder')}
        value={formState.empoweringBelief}
        onChange={(e) => setField('empoweringBelief', e.target.value)}
        autosize
        minRows={2}
        maxRows={5}
        maxLength={1000}
        radius={8}
      />

      <Divider label={t('visualizationDivider')} labelPosition="left" />

      <Textarea
        label={t('outcomeVisualizationText')}
        placeholder={t('outcomeVisualizationTextPlaceholder')}
        value={formState.outcomeVisualizationText}
        onChange={(e) => setField('outcomeVisualizationText', e.target.value)}
        autosize
        minRows={3}
        maxRows={8}
        maxLength={2000}
        radius={8}
      />

      <Textarea
        label={t('processVisualizationText')}
        placeholder={t('processVisualizationTextPlaceholder')}
        value={formState.processVisualizationText}
        onChange={(e) => setField('processVisualizationText', e.target.value)}
        autosize
        minRows={2}
        maxRows={6}
        maxLength={2000}
        radius={8}
      />

      <Textarea
        label={t('likelyObstacle')}
        placeholder={t('likelyObstaclePlaceholder')}
        value={formState.likelyObstacle}
        onChange={(e) => setField('likelyObstacle', e.target.value)}
        autosize
        minRows={2}
        maxRows={5}
        maxLength={1000}
        radius={8}
      />

      <Textarea
        label={t('obstacleResponse')}
        placeholder={t('obstacleResponsePlaceholder')}
        value={formState.obstacleResponse}
        onChange={(e) => setField('obstacleResponse', e.target.value)}
        autosize
        minRows={2}
        maxRows={5}
        maxLength={1000}
        radius={8}
      />

      <Divider label={t('actionDivider')} labelPosition="left" />

      <Textarea
        label={t('nextAction')}
        placeholder={t('nextActionPlaceholder')}
        value={formState.nextAction}
        onChange={(e) => setField('nextAction', e.target.value)}
        autosize
        minRows={1}
        maxRows={4}
        maxLength={500}
        radius={8}
      />

      <DateInput
        label={t('nextActionDueDate')}
        placeholder={t('nextActionDueDatePlaceholder')}
        value={formState.nextActionDueDateValue}
        onChange={(v) => setField('nextActionDueDateValue', v)}
        clearable
        radius={8}
      />
    </Stack>
  );
}
