'use client';

import { useTranslations } from 'next-intl';
import { Box, Group, Text, Button } from '@mantine/core';

interface SessionSelectBarProps {
  selectedCount: number;
  estimatedMinutes: number;
  onSelectAll: () => void;
  onCancel: () => void;
  onBeginSession: () => void;
}

export function SessionSelectBar({ selectedCount, estimatedMinutes, onSelectAll, onCancel, onBeginSession }: SessionSelectBarProps) {
  const t = useTranslations('visionBoard.sessionSelect');

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: '#17171D',
        borderRadius: 999,
        padding: '10px 10px 10px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        maxWidth: '94vw',
      }}
    >
      <Box>
        <Text size="sm" fw={700} style={{ color: '#fff', whiteSpace: 'nowrap' }}>
          {t('goalsCount', { count: selectedCount, minutes: estimatedMinutes })}
        </Text>
        <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
          {t('hintClickPhotos')}
        </Text>
      </Box>
      <Group gap={6} wrap="nowrap">
        <Button variant="subtle" size="xs" onClick={onSelectAll} style={{ color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
          {t('selectAll')}
        </Button>
        <Button variant="subtle" size="xs" onClick={onCancel} style={{ color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
          {t('cancel')}
        </Button>
        <Button
          size="xs"
          onClick={onBeginSession}
          disabled={selectedCount === 0}
          radius={999}
          style={{ background: '#4686FE', border: 'none', whiteSpace: 'nowrap' }}
        >
          {t('beginSession')}
        </Button>
      </Group>
    </Box>
  );
}
