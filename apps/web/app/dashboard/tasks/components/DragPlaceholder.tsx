'use client';

import React from 'react';
import { Card, Text } from '@mantine/core';

interface DragPlaceholderProps {
  color: string;
}

export function DragPlaceholder({ color }: DragPlaceholderProps) {
  return (
    <Card
      style={{
        height: '80px',
        border: `2px dashed var(--mantine-color-${color}-4)`,
        backgroundColor: `var(--mantine-color-${color}-0)`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
        transform: 'translate3d(0, 0, 0) scale(0.98)',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        willChange: 'transform, opacity', // Hardware acceleration
        animation: 'pulse 1.5s infinite ease-in-out',
      }}
      shadow="none"
      padding="sm"
      withBorder={false}
    >
      <Text
        size="sm"
        c="dimmed"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: `var(--mantine-color-${color}-6)`,
        }}
      >
        Drop here
      </Text>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 0.8;
              transform: translate3d(0, 0, 0) scale(0.98);
            }
            50% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }
        `
      }} />
    </Card>
  );
}