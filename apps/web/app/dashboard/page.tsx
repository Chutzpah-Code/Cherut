'use client';

import { Box } from '@mantine/core';
import { Surface } from '@/components/ui/Surface';
import { StatusStrip } from './components/StatusStrip';
import { BalanceChart } from './components/BalanceChart';
import { TaskThroughputChart } from './components/TaskThroughputChart';
import { HabitConsistencyChart } from './components/HabitConsistencyChart';
import { TasksDueList } from './components/TasksDueList';
import { ObjectivesReadOnly } from './components/ObjectivesReadOnly';
import { CashFlowChart } from './components/CashFlowChart';
import { UpcomingBillsChart } from './components/UpcomingBillsChart';
import { KeyResultsSplitChart } from './components/KeyResultsSplitChart';
import { SpendingThisMonth } from './components/SpendingThisMonth';
import { NetWorthSummary } from './components/NetWorthSummary';

// Dashboard 2A — read-only briefing. Sits in a white Surface on top of the
// app's shared gray canvas (apps/web/components/ui/Surface.tsx), same as
// every other module page. Responsive column overrides use a plain <style>
// tag rather than styled-jsx — styled-jsx's scoping transform previously
// made `next build` hang for 20+ minutes against this exact dashboard route
// (see git history), so it is deliberately not used anywhere in this module.
export default function DashboardPage() {
  return (
    <Surface style={{ overflow: 'hidden' }}>
      <StatusStrip />

      <Box className="dash-row-3" style={{ borderTop: '1px solid #E2E5EB', borderBottom: '1px solid #E2E5EB' }}>
        <Box className="dash-col dash-col-a"><BalanceChart /></Box>
        <Box className="dash-col dash-col-b"><TaskThroughputChart /></Box>
        <Box className="dash-col dash-col-c"><HabitConsistencyChart /></Box>
      </Box>

      <Box className="dash-row-2" style={{ borderBottom: '1px solid #E2E5EB' }}>
        <Box className="dash-col dash-col-a"><TasksDueList /></Box>
        <Box className="dash-col dash-col-b"><ObjectivesReadOnly /></Box>
      </Box>

      <Box className="dash-row-3" style={{ borderBottom: '1px solid #E2E5EB' }}>
        <Box className="dash-col dash-col-a"><CashFlowChart /></Box>
        <Box className="dash-col dash-col-b"><UpcomingBillsChart /></Box>
        <Box className="dash-col dash-col-c"><KeyResultsSplitChart /></Box>
      </Box>

      <Box className="dash-row-2">
        <Box className="dash-col dash-col-a"><SpendingThisMonth /></Box>
        <Box className="dash-col dash-col-b"><NetWorthSummary /></Box>
      </Box>

      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
        .dash-row-2, .dash-row-3 { display: grid; grid-template-columns: minmax(0,1fr); }
        .dash-col { border-bottom: 1px solid #E2E5EB; }
        .dash-col:last-child { border-bottom: none; }

        @media (min-width: 768px) {
          .dash-row-3 { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .dash-row-3 .dash-col-a { grid-column: span 2; border-bottom: 1px solid #E2E5EB; }
          .dash-row-3 .dash-col-b { border-right: 1px solid #E2E5EB; border-bottom: none; }
          .dash-row-3 .dash-col-c { border-bottom: none; }
          .dash-row-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .dash-row-2 .dash-col-a { border-right: 1px solid #E2E5EB; border-bottom: none; }
          .dash-row-2 .dash-col-b { border-bottom: none; }
        }

        @media (min-width: 1024px) {
          .dash-row-3 { grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr); }
          .dash-row-3 .dash-col-a { grid-column: span 1; border-bottom: none; border-right: 1px solid #E2E5EB; }
          .dash-row-3 .dash-col-b { border-right: 1px solid #E2E5EB; }
        }
      `,
        }}
      />
    </Surface>
  );
}
