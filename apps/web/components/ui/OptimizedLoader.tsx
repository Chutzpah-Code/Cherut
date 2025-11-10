'use client';

import { Loader, Stack, Text, Skeleton, Group } from '@mantine/core';
import { memo } from 'react';

interface OptimizedLoaderProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dots' | 'bars' | 'skeleton';
  lines?: number;
}

export const OptimizedLoader = memo(function OptimizedLoader({
  text = 'Loading...',
  size = 'md',
  variant = 'dots',
  lines = 3
}: OptimizedLoaderProps) {

  if (variant === 'skeleton') {
    return (
      <Stack gap="sm" p="md">
        {Array.from({ length: lines }).map((_, i) => (
          <Group key={i} gap="sm" wrap="nowrap">
            <Skeleton height={20} width={40} radius="sm" />
            <Skeleton height={20} style={{ flex: 1 }} radius="sm" />
            <Skeleton height={20} width={60} radius="sm" />
          </Group>
        ))}
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" py="xl">
      <Loader size={size} type={variant} />
      <Text size="sm" c="dimmed">{text}</Text>
    </Stack>
  );
});