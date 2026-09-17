'use client';

import { useRef, useState } from 'react';
import { Drawer, Box, Group, Text, UnstyledButton, Button, Modal } from '@mantine/core';
import { useAddPanel, AddEntityType } from '../../add-panel-context';
import { TransactionForm } from './TransactionForm';
import { AccountForm } from './AccountForm';
import { BillRuleForm } from './BillRuleForm';
import { BudgetForm } from './BudgetForm';
import { InvestmentForm } from './InvestmentForm';
import type { AddSubformHandle } from './types';

const CHIPS: { value: AddEntityType; label: string }[] = [
  { value: 'transaction', label: 'Transaction' },
  { value: 'account', label: 'Account' },
  { value: 'card', label: 'Credit card' },
  { value: 'bill', label: 'Bill rule' },
  { value: 'budget', label: 'Budget' },
  { value: 'investment', label: 'Investment' },
];

const SUBMIT_LABEL: Record<AddEntityType, { create: string; edit: string }> = {
  transaction: { create: 'Add transaction', edit: 'Save transaction' },
  account: { create: 'Create account', edit: 'Save account' },
  card: { create: 'Create card', edit: 'Save card' },
  bill: { create: 'Create bill rule', edit: 'Save bill rule' },
  budget: { create: 'Create budget', edit: 'Save budget' },
  investment: { create: 'Create investment', edit: 'Save investment' },
};

export function AddPanel() {
  const { state, openCreate, close } = useAddPanel();
  const formRef = useRef<AddSubformHandle>(null);
  const [valid, setValid] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);

  const requestClose = () => {
    if (formRef.current?.isDirty()) {
      setConfirmOpened(true);
      return;
    }
    close();
  };
  const forceClose = () => {
    setConfirmOpened(false);
    close();
  };

  const handleChipChange = (type: AddEntityType) => {
    if (state.mode === 'edit') return; // editing is scoped to one entity/type
    openCreate(type);
  };

  const labels = SUBMIT_LABEL[state.type];
  const label = state.mode === 'edit' ? labels.edit : labels.create;
  const formKey = `${state.type}-${state.mode}-${state.entity?.id ?? 'new'}`;

  const commonProps = {
    ref: formRef,
    mode: state.mode,
    entity: state.entity,
    prefill: state.prefill,
    onDone: forceClose,
    onValidChange: setValid,
    onPendingChange: setPending,
  };

  const renderForm = () => {
    switch (state.type) {
      case 'transaction': return <TransactionForm key={formKey} {...commonProps} />;
      case 'account': return <AccountForm key={formKey} {...commonProps} />;
      case 'card': return <AccountForm key={formKey} {...commonProps} forcedType="credit" />;
      case 'bill': return <BillRuleForm key={formKey} {...commonProps} />;
      case 'budget': return <BudgetForm key={formKey} {...commonProps} />;
      case 'investment': return <InvestmentForm key={formKey} {...commonProps} />;
      default: return null;
    }
  };

  return (
    <>
      <Drawer
        opened={state.open}
        onClose={requestClose}
        position="right"
        size={404}
        title={<Text fw={700} size="lg">Add</Text>}
        styles={{
          content: { maxWidth: '100vw' },
          body: { padding: 0, height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' },
        }}
      >
        {state.mode === 'create' && (
          <Box px="md" pb="md" style={{ borderBottom: '1px solid #E2E5EB' }}>
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>
              What are you adding?
            </Text>
            <Group gap={6} wrap="wrap">
              {CHIPS.map((chip) => {
                const active = state.type === chip.value;
                return (
                  <UnstyledButton
                    key={chip.value}
                    onClick={() => handleChipChange(chip.value)}
                    style={{
                      fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6,
                      color: active ? '#1D4ED8' : '#334155',
                      background: active ? '#E4EBFD' : '#F1F5F9',
                    }}
                  >
                    {chip.label}
                  </UnstyledButton>
                );
              })}
            </Group>
          </Box>
        )}

        <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
          {renderForm()}
        </Box>

        <Box
          px="md"
          py="sm"
          style={{
            borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            flexShrink: 0, display: 'flex', gap: 10,
          }}
        >
          <Button variant="default" onClick={requestClose}>Cancel</Button>
          <Button onClick={() => formRef.current?.submit()} loading={pending} disabled={!valid} style={{ flex: 1, backgroundColor: '#0052CC' }}>
            {label}
          </Button>
        </Box>
      </Drawer>

      <Modal opened={confirmOpened} onClose={() => setConfirmOpened(false)} title="Discard changes?" centered size="sm">
        <Text size="sm" mb="md">You have unsaved changes. Close anyway?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpened(false)}>Keep editing</Button>
          <Button color="red" onClick={forceClose}>Discard</Button>
        </Group>
      </Modal>
    </>
  );
}
