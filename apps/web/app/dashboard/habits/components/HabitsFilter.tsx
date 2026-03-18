'use client';

import React from 'react';
import { Group, Button, Text, Badge } from '@mantine/core';
import { Archive, Eye, EyeOff } from 'lucide-react';
import { HabitCounts } from '@/lib/api/services/habits';

export type HabitsFilterType = 'active' | 'archived' | 'all';

interface HabitsFilterProps {
  currentFilter: HabitsFilterType;
  onFilterChange: (filter: HabitsFilterType) => void;
  habitCounts?: HabitCounts;
}

export function HabitsFilter({ currentFilter, onFilterChange, habitCounts }: HabitsFilterProps) {
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
        <Group gap="sm">
          <Button
            variant={currentFilter === 'active' ? 'filled' : 'outline'}
            onClick={() => onFilterChange('active')}
            leftSection={<Eye size={16} />}
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              ...(currentFilter === 'active' ? {
                background: '#4686FE',
                border: '1px solid #4686FE',
                color: 'white',
              } : {
                borderColor: '#CCCCCC',
                color: '#333333',
                background: 'white',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'active' ? {
                    background: '#3366E5',
                  } : {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  }),
                },
              },
            }}
          >
            Active
          </Button>
          <Button
            variant={currentFilter === 'archived' ? 'filled' : 'outline'}
            onClick={() => onFilterChange('archived')}
            leftSection={<Archive size={16} />}
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              ...(currentFilter === 'archived' ? {
                background: '#4686FE',
                border: '1px solid #4686FE',
                color: 'white',
              } : {
                borderColor: '#CCCCCC',
                color: '#333333',
                background: 'white',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'archived' ? {
                    background: '#3366E5',
                  } : {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  }),
                },
              },
            }}
          >
            Archived
          </Button>
          <Button
            variant={currentFilter === 'all' ? 'filled' : 'outline'}
            onClick={() => onFilterChange('all')}
            leftSection={<EyeOff size={16} />}
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              ...(currentFilter === 'all' ? {
                background: '#4686FE',
                border: '1px solid #4686FE',
                color: 'white',
              } : {
                borderColor: '#CCCCCC',
                color: '#333333',
                background: 'white',
              }),
            }}
            styles={{
              root: {
                '&:hover': {
                  ...(currentFilter === 'all' ? {
                    background: '#3366E5',
                  } : {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  }),
                },
              },
            }}
          >
            All
          </Button>
        </Group>

        {habitCounts && (
          <Group gap="xs">
            <Text
              size="sm"
              c="dimmed"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666666',
              }}
            >
              {currentFilter === 'active' && `${habitCounts.active} active habits`}
              {currentFilter === 'archived' && `${habitCounts.archived} archived habits`}
              {currentFilter === 'all' && `${habitCounts.total} total habits`}
            </Text>

            {currentFilter === 'archived' && habitCounts.archived > 0 && (
              <Badge
                size="md"
                radius={6}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#F5F5F5',
                  color: '#666666',
                  border: '1px solid #CCCCCC',
                }}
              >
                {habitCounts.archived}
              </Badge>
            )}
          </Group>
        )}
      </Group>
    </>
  );
}