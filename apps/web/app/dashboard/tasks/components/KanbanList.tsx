'use client';

import { Card, Text, Badge, Stack, Button, TextInput, ActionIcon, Group } from '@mantine/core';
import { Plus, X, Check } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { useState } from 'react';

interface KanbanListProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
  onEditTitle?: (newTitle: string) => void;
  onDelete?: () => void;
}

export function KanbanList({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onAddTask,
  onEditTitle,
  onDelete,
}: KanbanListProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);

  const handleSaveTitle = () => {
    if (onEditTitle && titleValue.trim()) {
      onEditTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        minHeight: '400px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        borderColor: isOver ? `var(--mantine-color-${color}-6)` : undefined,
        borderWidth: isOver ? '2px' : '1px',
        backgroundColor: isOver ? `var(--mantine-color-${color}-0)` : undefined,
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md" wrap="nowrap">
        {isEditingTitle ? (
          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
            <TextInput
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setTitleValue(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              size="sm"
              style={{ flex: 1 }}
            />
            <ActionIcon size="sm" color="green" onClick={handleSaveTitle}>
              <Check size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              color="gray"
              onClick={() => {
                setTitleValue(title);
                setIsEditingTitle(false);
              }}
            >
              <X size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: `var(--mantine-color-${color}-6)`,
                borderRadius: '50%',
              }}
            />
            <Text
              fw={600}
              size="lg"
              onClick={() => onEditTitle && setIsEditingTitle(true)}
              style={{ cursor: onEditTitle ? 'pointer' : 'default', flex: 1 }}
            >
              {title}
            </Text>
            <Badge color="gray" size="sm" variant="light">
              {tasks.length}
            </Badge>
          </Group>
        )}

        {onDelete && (
          <ActionIcon size="sm" color="red" variant="subtle" onClick={onDelete}>
            <X size={16} />
          </ActionIcon>
        )}
      </Group>

      {/* Tasks - Drop Zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: '200px',
          transition: 'background-color 0.2s ease',
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <Stack gap="sm">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}

            {tasks.length === 0 && !isAddingCard && (
              <Text c="dimmed" size="sm" ta="center" py="xl">
                No tasks
              </Text>
            )}
          </Stack>
        </SortableContext>
      </div>

      {/* Add Card Button */}
      {!isAddingCard && (
        <Button
          variant="subtle"
          leftSection={<Plus size={16} />}
          onClick={() => onAddTask(id)}
          fullWidth
          mt="md"
          size="sm"
        >
          Add card
        </Button>
      )}
    </Card>
  );
}
