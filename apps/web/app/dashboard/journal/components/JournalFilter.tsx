'use client';

import React from 'react';
import { Group, Button, Text, Badge } from '@mantine/core';
import { JournalCounts } from '@/lib/api/services/journal';

export type JournalFilterType = 'active' | 'archived' | 'all';

interface JournalFilterProps {
  currentFilter: JournalFilterType;
  onFilterChange: (filter: JournalFilterType) => void;
  journalCounts?: JournalCounts;
}

export function JournalFilter({
  currentFilter,
  onFilterChange,
  journalCounts,
}: JournalFilterProps) {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Group
        justify="space-between"
        align="center"
        mb="xl"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Group
          gap={0}
          style={{
            background: '#EEEEEE',
            borderRadius: '40px',
            height: '48px',
            padding: '4px',
          }}
        >
          <Button
            onClick={() => onFilterChange('active')}
            radius={40}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              height: '40px',
              padding: '0 20px',
              border: 'none',
              ...(currentFilter === 'active' ? {
                background: '#4686FE',
                color: 'white',
              } : {
                background: 'transparent',
                color: '#6D6D6D',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'active' ? {} : {
                    background: 'rgba(70, 134, 254, 0.1)',
                  }),
                },
              },
            }}
          >
            Active
          </Button>
          <Button
            onClick={() => onFilterChange('archived')}
            radius={40}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              height: '40px',
              padding: '0 20px',
              border: 'none',
              ...(currentFilter === 'archived' ? {
                background: '#4686FE',
                color: 'white',
              } : {
                background: 'transparent',
                color: '#6D6D6D',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'archived' ? {} : {
                    background: 'rgba(70, 134, 254, 0.1)',
                  }),
                },
              },
            }}
          >
            Archived
          </Button>
          <Button
            onClick={() => onFilterChange('all')}
            radius={40}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              height: '40px',
              padding: '0 20px',
              border: 'none',
              ...(currentFilter === 'all' ? {
                background: '#4686FE',
                color: 'white',
              } : {
                background: 'transparent',
                color: '#6D6D6D',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'all' ? {} : {
                    background: 'rgba(70, 134, 254, 0.1)',
                  }),
                },
              },
            }}
          >
            All
          </Button>
        </Group>

        {journalCounts && (
          <Group gap="xs">
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#6D6D6D',
              }}
            >
              {currentFilter === 'active' && `${journalCounts.active} active entries`}
              {currentFilter === 'archived' && `${journalCounts.archived} archived entries`}
              {currentFilter === 'all' && `${journalCounts.total} total entries`}
            </Text>

            {currentFilter === 'archived' && journalCounts.archived > 0 && (
              <Badge
                radius={40}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#4686FE',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  border: 'none',
                }}
              >
                {journalCounts.archived}
              </Badge>
            )}
          </Group>
        )}
      </Group>
    </>
  );
}