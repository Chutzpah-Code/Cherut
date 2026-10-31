'use client';

import { Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Surface } from '@/components/ui/Surface';
import { FinanceCurrencyProvider } from './currency-context';
import { AddPanelProvider, useAddPanel } from './add-panel-context';
import { FinanceHeader } from './components/FinanceHeader';
import { AddPanel } from './components/AddPanel';

function FinanceLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useAddPanel();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      <Stack gap="md">
        <FinanceHeader />
        <Surface
          p={{ base: 'md', sm: 'xl' }}
          style={{ paddingRight: state.open && isDesktop ? 404 : undefined, transition: 'padding-right 0.2s ease' }}
        >
          {children}
        </Surface>
      </Stack>
      <AddPanel />
    </>
  );
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceCurrencyProvider>
      <AddPanelProvider>
        <FinanceLayoutContent>{children}</FinanceLayoutContent>

        {/* Money and Bills & Portfolio should print legibly as a statement:
            drawer and interactive controls hidden, bands unstacked to a
            single column, status-color backgrounds preserved. */}
        <style jsx global>{`
          @media print {
            .finance-no-print,
            .mantine-Drawer-root,
            .mantine-Modal-root {
              display: none !important;
            }
            .mantine-Grid-root {
              display: block !important;
            }
            .mantine-Grid-root > .mantine-Grid-col {
              width: 100% !important;
              max-width: 100% !important;
              flex: none !important;
              margin-bottom: 16px;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </AddPanelProvider>
    </FinanceCurrencyProvider>
  );
}
