'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Stack, Group, Box, Text, TextInput, NumberInput, Select, UnstyledButton, Switch, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useFinanceAccounts, useCreateInvestment, useUpdateInvestment } from '@/hooks/useFinance';
import { CreateInvestmentDto, FinanceAccount } from '@/lib/api/services/finance';
import { ASSET_CLASSES, ASSET_CLASS_ORDER, AssetClass, Liquidity, isVehicleLikeClass, isCurrencyLikeClass } from '@/lib/finance/asset-classes';
import { getAssetClassLabel, getAssetTypeLabel } from '@/lib/finance/asset-classes-i18n';
import { fmtCurrency } from '../../portfolio/components/billUtils';
import { useFinanceCurrency } from '../../currency-context';
import type { AddSubformHandle, AddSubformProps } from './types';

const today = () => new Date().toISOString().slice(0, 10);

function ChipRow({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <Group gap={6} wrap="wrap">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <UnstyledButton
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6,
              color: active ? '#1D4ED8' : '#334155',
              background: active ? '#E4EBFD' : '#F1F5F9',
            }}
          >
            {opt.label}
          </UnstyledButton>
        );
      })}
    </Group>
  );
}

export const InvestmentForm = forwardRef<AddSubformHandle, AddSubformProps>(function InvestmentForm(
  { mode, entity, onDone, onValidChange, onPendingChange },
  ref,
) {
  const t = useTranslations('finance.investmentForm');
  const locale = useLocale();
  const { data: accounts = [] } = useFinanceAccounts();
  const { displayCurrency: currency } = useFinanceCurrency();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();

  const initial: Partial<CreateInvestmentDto> & { assetClass: AssetClass } = mode === 'edit' && entity
    ? { ...entity }
    : {
        assetClass: 'financial', assetType: ASSET_CLASSES.financial.types[0],
        valuedDate: today(), liquidity: 'liquid',
      };

  const [form, setForm] = useState<any>(initial);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) dirtyRef.current = true;
    mountedRef.current = true;
  }, [form]);

  const assetClass: AssetClass = form.assetClass;
  const classDef = ASSET_CLASSES[assetClass];

  // Creating (not editing — updateInvestment never moves money) with a
  // linked account can only use what that account actually has available.
  const linkedAccount = (accounts as FinanceAccount[]).find((a) => a.id === form.linkedAccountId);
  const fundingAmount = form.acquiredValue ?? form.currentValue;
  const insufficientFunds = mode === 'create' && !!linkedAccount && typeof fundingAmount === 'number'
    && fundingAmount > (linkedAccount.balance ?? 0);

  const valid = !!form.name && !!form.assetClass && !!form.assetType
    && form.currentValue !== undefined && form.currentValue !== null && !!form.valuedDate && !!form.liquidity
    && !insufficientFunds;
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);

  const pending = createInvestment.isPending || updateInvestment.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  const showError = (error: any) => {
    notifications.show({ color: 'red', message: error?.response?.data?.message || t('genericError') });
  };

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateInvestment.mutate({ id: entity.id, dto: form }, { onSuccess: onDone, onError: showError });
      } else {
        createInvestment.mutate(form as CreateInvestmentDto, { onSuccess: onDone, onError: showError });
      }
    },
  }));

  const pickClass = (c: string) => setForm((f: any) => ({ ...f, assetClass: c, assetType: ASSET_CLASSES[c as AssetClass].types[0] }));

  return (
    <Stack gap="md">
      <Stack gap={8}>
        <Text size="xs" fw={600} c="#334155">{t('assetClass')}</Text>
        <ChipRow
          options={ASSET_CLASS_ORDER.map((c) => ({ value: c, label: getAssetClassLabel(c, ASSET_CLASSES[c].label, locale) }))}
          value={assetClass}
          onChange={pickClass}
        />
      </Stack>

      <Stack gap={8}>
        <Text size="xs" fw={600} c="#334155">{t('type')}</Text>
        <Stack gap={5}>
          {classDef.types.map((assetType) => {
            const active = form.assetType === assetType;
            return (
              <UnstyledButton
                key={assetType}
                onClick={() => setForm((f: any) => ({ ...f, assetType }))}
                style={{
                  fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6, textAlign: 'left',
                  color: active ? '#1D4ED8' : '#334155',
                  background: active ? '#E4EBFD' : '#F1F5F9',
                }}
              >
                {getAssetTypeLabel(assetType, locale)}
              </UnstyledButton>
            );
          })}
        </Stack>
      </Stack>

      <TextInput label={t('name')} placeholder={t('namePlaceholder')} value={form.name ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} />

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <NumberInput label={t('acquiredFor')} decimalScale={2} value={form.acquiredValue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, acquiredValue: typeof v === 'number' ? v : undefined }))} />
        <TextInput label={t('acquiredOn')} type="date" value={form.acquiredDate ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, acquiredDate: e.target.value || undefined }))} />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <NumberInput label={t('currentValue')} decimalScale={2} value={form.currentValue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, currentValue: typeof v === 'number' ? v : undefined }))} />
        <TextInput label={t('valuedOn')} type="date" value={form.valuedDate ?? today()} onChange={(e) => setForm((f: any) => ({ ...f, valuedDate: e.target.value }))} />
      </SimpleGrid>

      {assetClass === 'realEstate' && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput label={t('area')} decimalScale={2} value={form.area ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, area: typeof v === 'number' ? v : undefined }))} />
            <TextInput label={t('registration')} placeholder={t('registrationPlaceholder')} value={form.registration ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, registration: e.target.value || undefined }))} />
          </SimpleGrid>
          <TextInput label={t('address')} value={form.address ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value || undefined }))} />
        </>
      )}

      {isVehicleLikeClass(assetClass) && (
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <NumberInput label={t('year')} value={form.year ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, year: typeof v === 'number' ? v : undefined }))} />
          <TextInput label={t('plateOrSerial')} value={form.plateOrSerial ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, plateOrSerial: e.target.value || undefined }))} />
          <NumberInput label={t('depreciationPerYear')} decimalScale={1} value={form.depreciationPerYear ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, depreciationPerYear: typeof v === 'number' ? v : undefined }))} />
          <TextInput label={t('referenceTable')} placeholder={t('referenceTablePlaceholder')} value={form.referenceTable ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, referenceTable: e.target.value || undefined }))} />
        </SimpleGrid>
      )}

      {isCurrencyLikeClass(assetClass) && (
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <NumberInput label={t('quantity')} decimalScale={4} value={form.quantity ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, quantity: typeof v === 'number' ? v : undefined }))} />
          <TextInput label={t('unit')} placeholder={t('unitPlaceholder')} value={form.unit ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, unit: e.target.value || undefined }))} />
          <NumberInput label={t('unitPrice')} decimalScale={2} value={form.unitPrice ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, unitPrice: typeof v === 'number' ? v : undefined }))} />
          <TextInput label={t('priceSource')} placeholder={t('priceSourcePlaceholder')} value={form.priceSource ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, priceSource: e.target.value || undefined }))} />
        </SimpleGrid>
      )}

      {assetClass === 'business' && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label={t('counterparty')} value={form.counterparty ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, counterparty: e.target.value || undefined }))} />
            <TextInput label={t('stake')} placeholder={t('stakePlaceholder')} value={form.stake ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, stake: e.target.value || undefined }))} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label={t('interestReturn')} placeholder={t('interestReturnPlaceholder')} value={form.interestReturn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, interestReturn: e.target.value || undefined }))} />
            <TextInput label={t('endsOn')} type="date" value={form.endsOn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, endsOn: e.target.value || undefined }))} />
          </SimpleGrid>
          <Switch
            label={t('createIncomingBills')}
            checked={!!form.createIncomingBills}
            onChange={(e) => setForm((f: any) => ({ ...f, createIncomingBills: e.currentTarget.checked }))}
          />
        </>
      )}

      {assetClass === 'digital' && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput label={t('monthlyRevenue')} decimalScale={2} value={form.monthlyRevenue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, monthlyRevenue: typeof v === 'number' ? v : undefined }))} />
          <TextInput label={t('renewsOrExpires')} type="date" value={form.renewsOrExpiresOn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, renewsOrExpiresOn: e.target.value || undefined }))} />
        </SimpleGrid>
      )}

      <Stack gap={7}>
        <Text size="xs" fw={600} c="#334155">{t('liquidity')}</Text>
        <Box style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {(['liquid', 'illiquid'] as Liquidity[]).map((l) => {
            const active = form.liquidity === l;
            return (
              <UnstyledButton
                key={l}
                onClick={() => setForm((f: any) => ({ ...f, liquidity: l }))}
                style={{
                  flex: 1, fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '7px 0', borderRadius: 6,
                  background: active ? '#FFFFFF' : 'transparent',
                  boxShadow: active ? '0 1px 2px rgba(15,23,42,.06)' : 'none',
                }}
              >
                {l === 'liquid' ? t('liquid') : t('illiquid')}
              </UnstyledButton>
            );
          })}
        </Box>
        <Text size="xs" c="dimmed">{t('illiquidHint')}</Text>
      </Stack>

      <Stack gap={4}>
        <Select
          label={t('linkedAccount')}
          placeholder={t('none')}
          clearable
          data={(accounts as FinanceAccount[]).map((a) => ({ value: a.id, label: a.name }))}
          value={form.linkedAccountId ?? null}
          onChange={(v) => setForm((f: any) => ({ ...f, linkedAccountId: v ?? undefined }))}
        />
        {linkedAccount && (
          <Text size="xs" c={insufficientFunds ? 'red' : 'dimmed'}>
            {insufficientFunds
              ? t('insufficientBalance', { balance: fmtCurrency(linkedAccount.balance ?? 0, locale, currency) })
              : t('availableBalance', { balance: fmtCurrency(linkedAccount.balance ?? 0, locale, currency) })}
          </Text>
        )}
      </Stack>
      <TextInput label={t('notes')} placeholder={t('notesOptional')} value={form.notes ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value || undefined }))} />
    </Stack>
  );
});
