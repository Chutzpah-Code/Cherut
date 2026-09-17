'use client';

import { Stack, Group, Skeleton, Box } from '@mantine/core';

export function RowsSkeleton({ rows = 3, height = 40 }: { rows?: number; height?: number }) {
  return (
    <Stack gap={6}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius="sm" />
      ))}
    </Stack>
  );
}

export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Group gap={10} wrap="wrap">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: '10px 16px', minWidth: 132, flex: '1 0 auto' }}>
          <Skeleton height={10} width={70} radius="sm" mb={8} />
          <Skeleton height={20} width={50} radius="sm" />
        </Box>
      ))}
    </Group>
  );
}

export function BigStatSkeleton() {
  return (
    <Stack gap={10}>
      <Skeleton height={11} width={130} radius="sm" />
      <Skeleton height={34} width={180} radius="sm" />
      <Group gap={10} mt={4}>
        <Skeleton height={13} width={80} radius="sm" />
        <Skeleton height={13} width={110} radius="sm" />
      </Group>
    </Stack>
  );
}

export function ChartSkeleton({ height = 104 }: { height?: number }) {
  return (
    <Stack gap={8}>
      <Skeleton height={height} radius="sm" />
      <Group gap={16}>
        <Skeleton height={13} width={70} radius="sm" />
        <Skeleton height={13} width={70} radius="sm" />
        <Skeleton height={13} width={70} radius="sm" />
      </Group>
    </Stack>
  );
}
