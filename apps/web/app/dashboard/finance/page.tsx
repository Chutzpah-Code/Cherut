'use client';

import { Grid, Stack, Box } from '@mantine/core';
import { BalanceBand } from './components/BalanceBand';
import { AccountsAndCardsList } from './components/AccountsAndCardsList';
import { SpendingByCategory } from './components/SpendingByCategory';
import { TransactionsBlock } from './components/TransactionsBlock';

export default function FinancePage() {
  return (
    <Stack gap="xl">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <BalanceBand />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <AccountsAndCardsList />
        </Grid.Col>
      </Grid>

      <Box pt="md" style={{ borderTop: '1px solid #E2E5EB' }}>
        <SpendingByCategory />
      </Box>

      <Box pt="md" style={{ borderTop: '1px solid #E2E5EB' }}>
        <TransactionsBlock />
      </Box>
    </Stack>
  );
}
