'use client';

import { Box } from '@mantine/core';
import { StatusStrip } from './components/StatusStrip';
import { TasksDuePanel } from './components/TasksDuePanel';
import { ObjectivesPanel } from './components/ObjectivesPanel';
import { TodaysHabitsPanel } from './components/TodaysHabitsPanel';
import { FinanceCard } from './components/FinanceCard';

export default function DashboardPage() {
  return (
    <Box style={{ border: '1px solid #DDE1E8', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      <StatusStrip />

      <Box
        style={{
          borderTop: '1px solid #E2E5EB',
          borderBottom: '1px solid #E2E5EB',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
        }}
        className="dashboard-row-action"
      >
        <Box style={{ borderBottom: '1px solid #E2E5EB' }} className="dashboard-col-tasks">
          <TasksDuePanel />
        </Box>
        <Box className="dashboard-col-objectives">
          <ObjectivesPanel />
        </Box>
      </Box>

      <Box
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)' }}
        className="dashboard-row-secondary"
      >
        <Box style={{ borderBottom: '1px solid #E2E5EB' }} className="dashboard-col-habits">
          <TodaysHabitsPanel />
        </Box>
        <Box className="dashboard-col-finance">
          <FinanceCard />
        </Box>
      </Box>

      <style jsx global>{`
        @media (min-width: 1100px) {
          .dashboard-row-action {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr) !important;
          }
          .dashboard-col-tasks {
            border-bottom: none !important;
            border-right: 1px solid #E2E5EB;
          }
          .dashboard-row-secondary {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .dashboard-col-habits {
            border-bottom: none !important;
            border-right: 1px solid #E2E5EB;
          }
        }
      `}</style>
    </Box>
  );
}
