'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, ActionIcon, Text, Box } from '@mantine/core';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';

interface VisionBoardLightboxProps {
  items: VisionBoardItem[];
  initialIndex: number;
  opened: boolean;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function VisionBoardLightbox({ items, initialIndex, opened, onClose }: VisionBoardLightboxProps) {
  const t = useTranslations('visionBoard.lightbox');
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (opened) setIndex(initialIndex);
  }, [opened, initialIndex]);

  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIndex((i) => (i + 1) % items.length);

  useEffect(() => {
    if (!opened) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, items.length]);

  if (!opened || items.length === 0) return null;

  const item = items[index];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
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
      <Box
        style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ActionIcon
          aria-label={t('close')}
          onClick={onClose}
          variant="subtle"
          size={44}
          radius="xl"
          style={{
            position: 'absolute',
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
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          {t('counter', { current: index + 1, total: items.length })}
        </Text>

        {items.length > 1 && (
          <>
            <ActionIcon
              aria-label={t('previous')}
              onClick={goPrev}
              variant="subtle"
              size={48}
              radius="xl"
              visibleFrom="sm"
              style={{
                position: 'absolute',
                top: '50%',
                left: 16,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ChevronLeft size={26} />
            </ActionIcon>
            <ActionIcon
              aria-label={t('next')}
              onClick={goNext}
              variant="subtle"
              size={48}
              radius="xl"
              visibleFrom="sm"
              style={{
                position: 'absolute',
                top: '50%',
                right: 16,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ChevronRight size={26} />
            </ActionIcon>
          </>
        )}

        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 16px',
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </Box>

        <Text
          ta="center"
          fw={600}
          style={{
            color: '#fff',
            padding: '0 24px 24px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {item.title}
        </Text>
      </Box>
    </Modal>
  );
}
