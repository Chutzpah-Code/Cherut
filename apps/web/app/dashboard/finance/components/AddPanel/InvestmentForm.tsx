'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Stack, Group, Box, Text, TextInput, NumberInput, Select, UnstyledButton, Switch } from '@mantine/core';
import { useFinanceAccounts, useCreateInvestment, useUpdateInvestment } from '@/hooks/useFinance';
import { CreateInvestmentDto } from '@/lib/api/services/finance';
import { ASSET_CLASSES, ASSET_CLASS_ORDER, AssetClass, Liquidity, isVehicleLikeClass, isCurrencyLikeClass } from '@/lib/finance/asset-classes';
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
  const { data: accounts = [] } = useFinanceAccounts();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();

  const initial: Partial<CreateInvestmentDto> & { assetClass: AssetClass } = mode === 'edit' && entity
    ? { ...entity }
    : {
        assetClass: 'financial', assetType: ASSET_CLASSES.financial.types[0],
        currency: 'USD', valuedDate: today(), liquidity: 'liquid',
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

  const valid = !!form.name && !!form.assetClass && !!form.assetType
    && form.currentValue !== undefined && form.currentValue !== null && !!form.valuedDate && !!form.liquidity;
  useEffect(() => { onValidChange(valid); }, [valid, onValidChange]);

  const pending = createInvestment.isPending || updateInvestment.isPending;
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    isDirty: () => dirtyRef.current,
    submit: () => {
      if (!valid) return;
      if (mode === 'edit' && entity) {
        updateInvestment.mutate({ id: entity.id, dto: form }, { onSuccess: onDone });
      } else {
        createInvestment.mutate(form as CreateInvestmentDto, { onSuccess: onDone });
      }
    },
  }));

  const pickClass = (c: string) => setForm((f: any) => ({ ...f, assetClass: c, assetType: ASSET_CLASSES[c as AssetClass].types[0] }));

  return (
    <Stack gap="md">
      <Stack gap={8}>
        <Text size="xs" fw={600} c="#334155">Asset class</Text>
        <ChipRow
          options={ASSET_CLASS_ORDER.map((c) => ({ value: c, label: ASSET_CLASSES[c].label }))}
          value={assetClass}
          onChange={pickClass}
        />
      </Stack>

      <Stack gap={8}>
        <Text size="xs" fw={600} c="#334155">Type</Text>
        <Stack gap={5}>
          {classDef.types.map((t) => {
            const active = form.assetType === t;
            return (
              <UnstyledButton
                key={t}
                onClick={() => setForm((f: any) => ({ ...f, assetType: t }))}
                style={{
                  fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 6, textAlign: 'left',
                  color: active ? '#1D4ED8' : '#334155',
                  background: active ? '#E4EBFD' : '#F1F5F9',
                }}
              >
                {t}
              </UnstyledButton>
            );
          })}
        </Stack>
      </Stack>

      <TextInput label="Name" placeholder="e.g. Apartamento Centro" value={form.name ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} />

      <Group grow>
        <NumberInput label="Acquired for" decimalScale={2} value={form.acquiredValue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, acquiredValue: typeof v === 'number' ? v : undefined }))} />
        <TextInput label="Acquired on" type="date" value={form.acquiredDate ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, acquiredDate: e.target.value || undefined }))} />
      </Group>
      <Group grow>
        <NumberInput label="Current value" decimalScale={2} value={form.currentValue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, currentValue: typeof v === 'number' ? v : undefined }))} />
        <TextInput label="Valued on" type="date" value={form.valuedDate ?? today()} onChange={(e) => setForm((f: any) => ({ ...f, valuedDate: e.target.value }))} />
      </Group>

      {assetClass === 'realEstate' && (
        <>
          <Group grow>
            <NumberInput label="Area (m² / ha)" decimalScale={2} value={form.area ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, area: typeof v === 'number' ? v : undefined }))} />
            <TextInput label="Registration" placeholder="Matrícula" value={form.registration ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, registration: e.target.value || undefined }))} />
          </Group>
          <TextInput label="Address" value={form.address ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value || undefined }))} />
        </>
      )}

      {isVehicleLikeClass(assetClass) && (
        <Group grow>
          <NumberInput label="Year" value={form.year ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, year: typeof v === 'number' ? v : undefined }))} />
          <TextInput label="Plate / serial" value={form.plateOrSerial ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, plateOrSerial: e.target.value || undefined }))} />
          <NumberInput label="Depreciation / yr (%)" decimalScale={1} value={form.depreciationPerYear ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, depreciationPerYear: typeof v === 'number' ? v : undefined }))} />
          <TextInput label="Reference table" placeholder="FIPE" value={form.referenceTable ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, referenceTable: e.target.value || undefined }))} />
        </Group>
      )}

      {isCurrencyLikeClass(assetClass) && (
        <Group grow>
          <NumberInput label="Quantity" decimalScale={4} value={form.quantity ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, quantity: typeof v === 'number' ? v : undefined }))} />
          <TextInput label="Unit" placeholder="g / saca / USD" value={form.unit ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, unit: e.target.value || undefined }))} />
          <NumberInput label="Unit price" decimalScale={2} value={form.unitPrice ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, unitPrice: typeof v === 'number' ? v : undefined }))} />
          <TextInput label="Price source" placeholder="Manual" value={form.priceSource ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, priceSource: e.target.value || undefined }))} />
        </Group>
      )}

      {assetClass === 'business' && (
        <>
          <Group grow>
            <TextInput label="Counterparty / company" value={form.counterparty ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, counterparty: e.target.value || undefined }))} />
            <TextInput label="Stake" placeholder="% or n/a" value={form.stake ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, stake: e.target.value || undefined }))} />
          </Group>
          <Group grow>
            <TextInput label="Interest / return" placeholder="2% per month" value={form.interestReturn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, interestReturn: e.target.value || undefined }))} />
            <TextInput label="Ends on" type="date" value={form.endsOn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, endsOn: e.target.value || undefined }))} />
          </Group>
          <Switch
            label="Create the incoming payments as bills"
            checked={!!form.createIncomingBills}
            onChange={(e) => setForm((f: any) => ({ ...f, createIncomingBills: e.currentTarget.checked }))}
          />
        </>
      )}

      {assetClass === 'digital' && (
        <Group grow>
          <NumberInput label="Monthly revenue" decimalScale={2} value={form.monthlyRevenue ?? ''} onChange={(v) => setForm((f: any) => ({ ...f, monthlyRevenue: typeof v === 'number' ? v : undefined }))} />
          <TextInput label="Renews / expires" type="date" value={form.renewsOrExpiresOn ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, renewsOrExpiresOn: e.target.value || undefined }))} />
        </Group>
      )}

      <Stack gap={7}>
        <Text size="xs" fw={600} c="#334155">Liquidity</Text>
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
                {l === 'liquid' ? 'Liquid' : 'Illiquid'}
              </UnstyledButton>
            );
          })}
        </Box>
        <Text size="xs" c="dimmed">Illiquid assets count towards net worth but stay out of the balance projection.</Text>
      </Stack>

      <Select
        label="Linked account"
        placeholder="None"
        clearable
        data={(accounts as any[]).map((a) => ({ value: a.id, label: a.name }))}
        value={form.linkedAccountId ?? null}
        onChange={(v) => setForm((f: any) => ({ ...f, linkedAccountId: v ?? undefined }))}
      />
      <TextInput label="Notes" placeholder="Optional" value={form.notes ?? ''} onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value || undefined }))} />
    </Stack>
  );
});
