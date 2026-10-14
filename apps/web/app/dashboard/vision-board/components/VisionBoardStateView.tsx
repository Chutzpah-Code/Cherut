'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, ActionIcon, Text, Box, Stack, Button, Group } from '@mantine/core';
import { X } from 'lucide-react';

interface VisionBoardStateViewProps {
  opened: boolean;
  onClose: () => void;
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
}

const STEPS = ['state', 'outcome', 'process'] as const;

// Immersive, read-only "visualizar e agir" flow for a single item — same
// fullscreen Modal shell (dark background, centered content) as
// VisionBoardLightbox.tsx, but walked through manually in 3 steps
// (state → outcome → process) instead of a single wall of text, mirroring
// the state/result/strategy structure the practice is modeled on.
export function VisionBoardStateView({
  opened,
  onClose,
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
}: VisionBoardStateViewProps) {
  const t = useTranslations('visionBoard.stateView');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (opened) setStepIndex(0);
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, onClose]);

  if (!opened) return null;

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const goNext = () => {
    if (isLastStep) onClose();
    else setStepIndex((i) => i + 1);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      radius={0}
      styles={{
        content: {
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          maxHeight: '100dvh',
        },
        body: {
          flex: 1,
          minHeight: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <ActionIcon
        aria-label={t('close')}
        onClick={onClose}
        variant="subtle"
        size={44}
        radius="xl"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 2,
          color: '#fff',
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <X size={22} />
      </ActionIcon>

      <Text
        size="sm"
        fw={600}
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        {t('stepCounter', { current: stepIndex + 1, total: STEPS.length })}
      </Text>

      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '72px 24px 24px',
        }}
      >
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
            {t(`${step}.prompt`)}
          </Text>

          {step === 'state' && (
            <Stack gap="md" align="center" style={{ width: '100%' }}>
              {currentEmotion && (
                <Text ta="center" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: 17 }}>
                  {t('state.currentEmotionLabel')}: {currentEmotion}
                </Text>
              )}
              <Text ta="center" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontSize: 15 }}>
                {t('state.energyLabel')} {currentEnergy}/10 · {t('state.confidenceLabel')} {currentConfidence}/10
              </Text>
              {desiredState && (
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
                  {desiredState}
                </Text>
              )}
              {empoweringBelief && (
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
                  “{empoweringBelief}”
                </Text>
              )}
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
                {outcomeVisualizationText}
              </Text>
            </Stack>
          )}

          {step === 'process' && (
            <Stack gap="lg" align="center" style={{ width: '100%' }}>
              {processVisualizationText && (
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
                  {processVisualizationText}
                </Text>
              )}
              {likelyObstacle && (
                <Text ta="center" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', fontSize: 16, whiteSpace: 'pre-wrap' }}>
                  <Text component="span" fw={700} style={{ color: 'rgba(255,255,255,0.9)' }}>{t('process.obstacleLabel')}: </Text>
                  {likelyObstacle}
                </Text>
              )}
              {obstacleResponse && (
                <Text ta="center" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', fontSize: 16, whiteSpace: 'pre-wrap' }}>
                  <Text component="span" fw={700} style={{ color: 'rgba(255,255,255,0.9)' }}>{t('process.responseLabel')}: </Text>
                  {obstacleResponse}
                </Text>
              )}
              {nextAction && (
                <Text
                  ta="center"
                  fw={700}
                  style={{
                    color: '#9DB8F2',
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: 'clamp(17px, 2.4vw, 20px)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {t('process.actionLabel')}: {nextAction}
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      <Group justify="center" py="lg" style={{ flexShrink: 0 }}>
        <Button
          onClick={goNext}
          radius={999}
          size="md"
          style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif', fontWeight: 600, minWidth: 160 }}
        >
          {isLastStep ? t('finish') : t('continue')}
        </Button>
      </Group>
    </Modal>
  );
}
