'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Drawer, Box, Group, Text, UnstyledButton, Button, Modal } from '@mantine/core';
import { useAddPanel, AddEntityType } from '../../add-panel-context';
import { TransactionForm } from './TransactionForm';
import { AccountForm } from './AccountForm';
import { BillRuleForm } from './BillRuleForm';
import { BudgetForm } from './BudgetForm';
import { InvestmentForm } from './InvestmentForm';
import type { AddSubformHandle } from './types';

export function AddPanel() {
  const t = useTranslations('finance.addPanel');
  const { state, openCreate, close } = useAddPanel();
  const formRef = useRef<AddSubformHandle>(null);
  const [valid, setValid] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);

  const CHIPS: { value: AddEntityType; label: string }[] = [
    { value: 'transaction', label: t('chipTransaction') },
    { value: 'account', label: t('chipAccount') },
    { value: 'card', label: t('chipCard') },
    { value: 'bill', label: t('chipBill') },
    { value: 'budget', label: t('chipBudget') },
    { value: 'investment', label: t('chipInvestment') },
  ];

  const SUBMIT_LABEL: Record<AddEntityType, { create: string; edit: string }> = {
    transaction: { create: t('transactionCreate'), edit: t('transactionEdit') },
    account: { create: t('accountCreate'), edit: t('accountEdit') },
    card: { create: t('cardCreate'), edit: t('cardEdit') },
    bill: { create: t('billCreate'), edit: t('billEdit') },
    budget: { create: t('budgetCreate'), edit: t('budgetEdit') },
    investment: { create: t('investmentCreate'), edit: t('investmentEdit') },
  };

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
        title={<Text fw={700} size="lg">{t('title')}</Text>}
        styles={{
          content: { maxWidth: '100vw' },
          body: { padding: 0, height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' },
        }}
      >
        {state.mode === 'create' && (
          <Box px="md" pb="md" style={{ borderBottom: '1px solid #E2E5EB' }}>
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>
              {t('whatAreYouAdding')}
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
          <Button variant="default" onClick={requestClose}>{t('cancel')}</Button>
          <Button onClick={() => formRef.current?.submit()} loading={pending} disabled={!valid} style={{ flex: 1, backgroundColor: '#0052CC' }}>
            {label}
          </Button>
        </Box>
      </Drawer>

      <Modal opened={confirmOpened} onClose={() => setConfirmOpened(false)} title={t('discardChangesTitle')} centered size="sm">
        <Text size="sm" mb="md">{t('unsavedChanges')}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpened(false)}>{t('keepEditing')}</Button>
          <Button color="red" onClick={forceClose}>{t('discard')}</Button>
        </Group>
      </Modal>
    </>
  );
}
