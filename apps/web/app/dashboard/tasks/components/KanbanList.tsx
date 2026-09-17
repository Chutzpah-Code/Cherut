'use client';

import React from 'react';
import { Card, Text, Badge, Stack, Button, TextInput, ActionIcon, Group, ScrollArea } from '@mantine/core';
import { Plus, X } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { KanbanCard } from './KanbanCard';
import { useState } from 'react';

interface KanbanListProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId: string, title: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export function KanbanList({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  onToggleComplete,
  onEditTask,
}: KanbanListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="lg"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: '#E9ECEF',
        borderWidth: '1px',
        backgroundColor: '#F4F5F7',
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md" wrap="nowrap" gap="xs">
        <Text
          fw={600}
          size="sm"
          style={{
            flex: 1,
            color: '#172B4D',
            letterSpacing: '-0.01em',
            fontFamily: 'Inter Display, sans-serif',
          }}
        >
          {title}
        </Text>
        <Badge
          size="sm"
          variant="filled"
          radius="xl"
          style={{
            backgroundColor: '#DFE1E6',
            color: '#42526E',
            fontWeight: 700,
            fontSize: 11,
            minWidth: 22,
            padding: '0 7px',
          }}
        >
          {tasks.length}
        </Badge>
      </Group>

      {/* Task list */}
      <ScrollArea
        style={{ flex: 1 }}
        type="auto"
        scrollbarSize={4}
        styles={{
          thumb: { backgroundColor: '#CBD5E1', borderRadius: 4 },
        }}
      >
        <Stack gap="sm">
          {tasks.length === 0 ? (
            !isAddingCard && (
              <Text c="dimmed" size="xs" ta="center" py="xl" style={{ color: '#97A0AF' }}>
                No tasks
              </Text>
            )
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask ? () => onEditTask(task) : undefined}
              />
            ))
          )}
        </Stack>
      </ScrollArea>

      {/* Add card */}
      {onAddTask && !isAddingCard && (
        <Button
          variant="subtle"
          leftSection={<Plus size={14} />}
          onClick={() => { setIsAddingCard(true); setNewCardTitle(''); }}
          fullWidth
          mt="sm"
          radius={8}
          size="sm"
          style={{
            color: '#6B778C',
            fontWeight: 500,
            justifyContent: 'flex-start',
            paddingLeft: 8,
          }}
          styles={{
            root: {
              '&:hover': { backgroundColor: 'rgba(9,30,66,0.06)', color: '#172B4D' },
            },
          }}
        >
          Add a card
        </Button>
      )}

      {onAddTask && isAddingCard && (
        <Stack gap={6} mt="sm">
          <TextInput
            placeholder="Card title..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.currentTarget.value)}
            autoFocus
            radius={8}
            size="sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCardTitle.trim()) {
                onAddTask(id, newCardTitle.trim());
                setNewCardTitle('');
                setIsAddingCard(false);
              }
              if (e.key === 'Escape') {
                setIsAddingCard(false);
                setNewCardTitle('');
              }
            }}
          />
          <Group gap={6}>
            <Button
              size="xs"
              radius={6}
              style={{ backgroundColor: '#4686FE' }}
              disabled={!newCardTitle.trim()}
              onClick={() => {
                if (newCardTitle.trim()) {
                  onAddTask(id, newCardTitle.trim());
                  setNewCardTitle('');
                  setIsAddingCard(false);
                }
              }}
            >
              Add card
            </Button>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }}
            >
              <X size={14} />
            </ActionIcon>
          </Group>
        </Stack>
      )}
    </Card>
  );
}
