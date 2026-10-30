'use client';

import { useTranslations } from 'next-intl';
import { Text, Box, Stack, Group } from '@mantine/core';

export type VisualizationStep = 'state' | 'outcome' | 'process';

interface VisualizationStepsProps {
  step: VisualizationStep;
  imageUrl: string;
  title: string;
  currentEmotion?: string;
  currentEnergy: number;
  currentConfidence: number;
  desiredState: string;
  empoweringBelief: string;
  outcomeVisualizationText: string;
  processVisualizationText: string;
  likelyObstacle: string;
  obstacleResponse: string;
  nextAction: string;
  nextActionDueDate?: string;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

// Per-goal 3-step visualization content (state → outcome → process), reused
// both for a single-goal "▶ Visualizar" and for each goal inside a
// multi-goal session. Presentational only — the fullscreen Modal shell,
// progress bar and footer buttons are owned by SessionPlayer/index.tsx.
export function VisualizationSteps({
  step,
  imageUrl,
  title,
  currentEmotion,
  currentEnergy,
  currentConfidence,
  desiredState,
  empoweringBelief,
  outcomeVisualizationText,
  processVisualizationText,
  likelyObstacle,
  obstacleResponse,
  nextAction,
  nextActionDueDate,
}: VisualizationStepsProps) {
  const t = useTranslations('visionBoard.sessionPlayer');

  return (
    <Stack gap="xl" style={{ maxWidth: 640, width: '100%' }} align="center">
      <Text
        ta="center"
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {t(`step${step === 'state' ? 'State' : step === 'outcome' ? 'Outcome' : 'Process'}Prompt`)}
      </Text>

      {step === 'state' && (
        <Stack gap="lg" align="center" style={{ width: '100%' }}>
          <Group justify="center" gap="xs" wrap="wrap">
            {currentEmotion && <Pill>{t('nowLabel')}: {currentEmotion}</Pill>}
            <Pill>{t('energyLabel')} {currentEnergy}/10</Pill>
            <Pill>{t('confidenceLabel')} {currentConfidence}/10</Pill>
          </Group>
          <Text
            ta="center"
            style={{
              color: '#fff',
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(20px, 3.2vw, 26px)',
              fontWeight: 600,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {desiredState || t('fallbackDesiredState')}
          </Text>
          <Text
            ta="center"
            fs="italic"
            style={{
              color: '#9DB8F2',
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(16px, 2.2vw, 19px)',
              fontWeight: 600,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            “{empoweringBelief || t('fallbackBelief')}”
          </Text>
        </Stack>
      )}

      {step === 'outcome' && (
        <Stack gap="lg" align="center" style={{ width: '100%' }}>
          <Box style={{ width: '100%', maxHeight: '36vh', borderRadius: 16, overflow: 'hidden' }}>
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', maxHeight: '36vh', objectFit: 'cover', display: 'block' }}
            />
          </Box>
          <Text ta="center" fw={600} style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>
            {title}
          </Text>
          <Text
            ta="center"
            style={{
              color: '#fff',
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(20px, 3.2vw, 28px)',
              fontWeight: 600,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {outcomeVisualizationText || t('fallbackOutcome')}
          </Text>
        </Stack>
      )}

      {step === 'process' && (
        <Stack gap="lg" align="center" style={{ width: '100%' }}>
          <Text
            ta="center"
            style={{
              color: '#fff',
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(18px, 2.6vw, 23px)',
              fontWeight: 600,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {processVisualizationText || t('fallbackProcess')}
          </Text>

          <Group grow w="100%" align="stretch" wrap="wrap">
            <Box style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, flex: 1, minWidth: 220 }}>
              <Text size="xs" fw={700} tt="uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', marginBottom: 6 }}>
                {t('obstacleLabel')}
              </Text>
              <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
                {likelyObstacle || t('fallbackObstacle')}
              </Text>
            </Box>
            <Box style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, flex: 1, minWidth: 220 }}>
              <Text size="xs" fw={700} tt="uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', marginBottom: 6 }}>
                {t('responseLabel')}
              </Text>
              <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
                {obstacleResponse || t('fallbackResponse')}
              </Text>
            </Box>
          </Group>

          <Box
            style={{
              width: '100%',
              background: 'rgba(70,134,254,0.16)',
              border: '1px solid rgba(70,134,254,0.3)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Text fw={700} style={{ color: '#9DB8F2', fontFamily: 'Inter Display, sans-serif', fontSize: 'clamp(15px, 2vw, 18px)' }}>
              {t('nextActionLabel')}: {nextAction || t('fallbackNextAction')}
            </Text>
            {nextActionDueDate && (
              <Text size="sm" fw={600} style={{ color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                {nextActionDueDate}
              </Text>
            )}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
