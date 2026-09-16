'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Group, Stack } from '@mantine/core';
import { SummaryTiles } from './components/SummaryTiles';
import { HorizonSwitcher } from './components/HorizonSwitcher';
import { UpcomingBills } from './components/UpcomingBills';
import { RecurringList } from './components/RecurringList';
import { BalanceProjectionChart } from './components/BalanceProjectionChart';
import { NetWorthPanel } from './components/NetWorthPanel';
import { PortfolioSection } from './components/PortfolioSection';

const VALID_HORIZONS = [30, 60, 90];

export default function BillsPortfolioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const horizonParam = Number(searchParams.get('horizon'));
  const horizon = VALID_HORIZONS.includes(horizonParam) ? horizonParam : 90;

  const setHorizon = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 90) params.delete('horizon');
    else params.set('horizon', String(value));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <SummaryTiles />
        <HorizonSwitcher value={horizon} onChange={setHorizon} />
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <UpcomingBills horizon={horizon} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <RecurringList />
        </Grid.Col>
      </Grid>

      <Grid gutter="xl" pt="md" style={{ borderTop: '1px solid #E2E5EB' }}>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <BalanceProjectionChart horizon={horizon} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <NetWorthPanel />
        </Grid.Col>
      </Grid>

      <Box pt="md" style={{ borderTop: '1px solid #E2E5EB' }}>
        <PortfolioSection />
      </Box>
    </Stack>
  );
}
