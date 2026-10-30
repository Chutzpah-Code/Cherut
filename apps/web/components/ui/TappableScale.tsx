'use client';

import { Box, Group, Text, UnstyledButton } from '@mantine/core';

interface TappableScaleProps {
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  dark?: boolean;
}

// A row of 1-10 tappable buttons with a color ramp by value — not a native
// range slider, per the design: no drag precision needed, just a quick tap.
export function TappableScale({ value, onChange, lowLabel, highLabel, dark = false }: TappableScaleProps) {
  return (
    <Box>
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Group gap={4} wrap="nowrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = n <= value;
            return (
              <UnstyledButton
                key={n}
                onClick={() => onChange(n)}
                style={{
                  width: 26,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  backgroundColor: active ? `rgba(70,134,254,${0.25 + n * 0.075})` : dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                  color: active ? '#fff' : dark ? 'rgba(255,255,255,0.5)' : '#64748B',
                }}
              >
                {n}
              </UnstyledButton>
            );
          })}
        </Group>
        <Text fw={700} size="xl" style={{ color: dark ? '#fff' : '#000', minWidth: 28, textAlign: 'right' }}>
          {value}
        </Text>
      </Group>
      <Group justify="space-between">
        <Text size="xs" c={dark ? 'rgba(255,255,255,0.5)' : 'dimmed'}>{lowLabel}</Text>
        <Text size="xs" c={dark ? 'rgba(255,255,255,0.5)' : 'dimmed'}>{highLabel}</Text>
      </Group>
    </Box>
  );
}
