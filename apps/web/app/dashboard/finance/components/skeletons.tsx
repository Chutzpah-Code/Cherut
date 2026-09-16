'use client';

import { Stack, Group, Skeleton, Box } from '@mantine/core';

// Shared loading skeletons sized to match each list/panel's real row height,
// used in place of a generic spinner throughout the finance module.

export function RowsSkeleton({ rows = 4, height = 44 }: { rows?: number; height?: number }) {
  return (
    <Stack gap={6}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius="sm" />
      ))}
    </Stack>
  );
}

export function BigStatSkeleton() {
  return (
    <Stack gap={10}>
      <Skeleton height={11} width={140} radius="sm" />
      <Skeleton height={40} width={220} radius="sm" />
      <Group gap={10} mt={6}>
        <Skeleton height={13} width={90} radius="sm" />
        <Skeleton height={13} width={140} radius="sm" />
      </Group>
    </Stack>
  );
}

export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Group gap={10} wrap="wrap">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} style={{ background: '#F8FAFC', border: '1px solid #E8EBF0', borderRadius: 6, padding: '10px 16px', minWidth: 132 }}>
          <Skeleton height={10} width={70} radius="sm" mb={8} />
          <Skeleton height={18} width={90} radius="sm" />
        </Box>
      ))}
    </Group>
  );
}

export function ChartSkeleton({ height = 150 }: { height?: number }) {
  return <Skeleton height={height} radius="sm" />;
}
