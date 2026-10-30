'use client';

import { useTranslations } from 'next-intl';
import { Stack, Text, SimpleGrid, UnstyledButton, Button } from '@mantine/core';
import { TappableScale } from '@/components/ui/TappableScale';

const SESSION_FEELINGS = ['calm', 'focused', 'excited', 'anxious', 'tired', 'scattered'] as const;

interface CheckInStepProps {
  feeling: string | null;
  energy: number;
  confidence: number;
  onFeelingChange: (feeling: string) => void;
  onEnergyChange: (energy: number) => void;
  onConfidenceChange: (confidence: number) => void;
  onBegin: () => void;
  wasPrefilled: boolean;
}

export function CheckInStep({
  feeling,
  energy,
  confidence,
  onFeelingChange,
  onEnergyChange,
  onConfidenceChange,
  onBegin,
  wasPrefilled,
}: CheckInStepProps) {
  const t = useTranslations('visionBoard.sessionPlayer');

  return (
    <Stack gap="xl" align="center" style={{ maxWidth: 480, width: '100%' }}>
      <Stack gap={4} align="center">
        <Text
          ta="center"
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {t('checkinTitle')}
        </Text>
        <Text ta="center" fw={700} style={{ color: '#fff', fontFamily: 'Inter Display, sans-serif', fontSize: 'clamp(22px, 4vw, 30px)' }}>
          {t('checkinSubtitle')}
        </Text>
        {wasPrefilled && (
          <Text ta="center" size="sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('prefilledNote')}
          </Text>
        )}
      </Stack>

      <Stack gap="sm" style={{ width: '100%' }}>
        <Text size="xs" fw={700} tt="uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
          {t('feelingLabel')}
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          {SESSION_FEELINGS.map((f) => {
            const active = feeling === f;
            return (
              <UnstyledButton
                key={f}
                onClick={() => onFeelingChange(f)}
                style={{
                  padding: '14px 8px',
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  border: active ? '1.5px solid #4686FE' : '1.5px solid rgba(255,255,255,0.12)',
                  background: active ? 'rgba(70,134,254,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                  transition: 'all 0.15s ease',
                }}
              >
                {t(`feelings.${f}`)}
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>

      <Stack gap="lg" style={{ width: '100%' }}>
        <Stack gap={4}>
          <Text size="xs" fw={700} tt="uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
            {t('energyLabel')} — {energy}/10
          </Text>
          <TappableScale value={energy} onChange={onEnergyChange} lowLabel={t('lowLabel')} highLabel={t('highLabel')} dark />
        </Stack>
        <Stack gap={4}>
          <Text size="xs" fw={700} tt="uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
            {t('confidenceLabel')} — {confidence}/10
          </Text>
          <TappableScale value={confidence} onChange={onConfidenceChange} lowLabel={t('lowLabel')} highLabel={t('highLabel')} dark />
        </Stack>
      </Stack>

      <Button
        onClick={onBegin}
        disabled={!feeling}
        radius={999}
        size="md"
        style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif', fontWeight: 600, minWidth: 160 }}
      >
        {t('beginButton')}
      </Button>
    </Stack>
  );
}
