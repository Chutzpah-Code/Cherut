'use client';

import React from 'react';
import { Group, Button, Text, Badge } from '@mantine/core';
import { Archive, Eye, EyeOff } from 'lucide-react';

export type TaskFilter = 'active' | 'archived' | 'all';

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
              {currentFilter === 'all' && `${taskCounts.total} total tasks`}
            </Text>

            {currentFilter === 'archived' && taskCounts.archived > 0 && (
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
                {taskCounts.archived}
              </Badge>
            )}
          </Group>
        )}
      </Group>
    </React.Fragment>
  );
}