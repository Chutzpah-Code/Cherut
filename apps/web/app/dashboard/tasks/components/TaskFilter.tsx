'use client';

import React from 'react';
import { Group, Button, Text, Badge } from '@mantine/core';

export type TaskFilter = 'active' | 'archived';

interface TaskFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  taskCounts?: {
    active: number;
    archived: number;
    total: number;
  };
}

export function TaskFilter({ currentFilter, onFilterChange, taskCounts }: TaskFilterProps) {
  return (
    <React.Fragment>
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
        </Group>

        {taskCounts && (
          <Group gap="xs">
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666666',
              }}
            >
              {currentFilter === 'active' && `${taskCounts.active} active tasks`}
              {currentFilter === 'archived' && `${taskCounts.archived} archived tasks`}
            </Text>

            {currentFilter === 'archived' && taskCounts.archived > 0 && (
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
                {taskCounts.archived}
              </Badge>
            )}
          </Group>
        )}
      </Group>
    </React.Fragment>
  );
}