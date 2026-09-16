'use client';

import { Box, UnstyledButton } from '@mantine/core';

const OPTIONS = [30, 60, 90] as const;

export function HorizonSwitcher({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Box style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
      {OPTIONS.map((h) => {
        const active = value === h;
        return (
          <UnstyledButton
            key={h}
            onClick={() => onChange(h)}
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 6,
              color: active ? '#0F172A' : '#64748B',
              background: active ? '#FFFFFF' : 'transparent',
              boxShadow: active ? '0 1px 2px rgba(15,23,42,.08)' : 'none',
            }}
          >
            {h} days
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
