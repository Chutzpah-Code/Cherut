'use client';

import React from 'react';
import { Card, Text, Badge, Stack, Button, TextInput, ActionIcon, Group, ScrollArea, Box } from '@mantine/core';
import { Plus, X, Check } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { DragPlaceholder } from './DragPlaceholder';
import { useState } from 'react';

interface KanbanListProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (status: string) => void;
  onEditTitle?: (newTitle: string) => void;
  onDelete?: () => void;
  activeId?: string | null;
  overId?: string | null;
  onToggleComplete?: (taskId: string) => void;
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
  activeId,
  overId,
  onToggleComplete,
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

  // Show placeholder when dragging over this column or over a task in this column
  const showPlaceholder = activeId && (overId === id || tasks.some(task => task.id === overId));

  // Find the task being dragged over for insertion positioning
  const overTask = overId && tasks.find(task => task.id === overId);
  const overTaskIndex = overTask ? tasks.indexOf(overTask) : -1;

  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        .kanban-list {
          @media (max-width: 1024px) {
            height: 400px !important;
          }
          @media (max-width: 768px) {
            height: 350px !important;
          }
        }
      `}</style>
      <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        height: '450px', // Fixed height optimized for 4.5 tasks
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        willChange: 'transform, border-color, box-shadow', // Hardware acceleration
        borderColor: isOver ? `var(--mantine-color-${color}-6)` : '#e9ecef',
        borderWidth: isOver ? '2px' : '1px',
        backgroundColor: isOver ? `var(--mantine-color-${color}-0)` : undefined,
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver
          ? `0 4px 12px rgba(0,0,0,0.1), 0 0 0 2px var(--mantine-color-${color}-2)`
          : '0 1px 3px rgba(0,0,0,0.1)',
      }}
      className="kanban-list"
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

      {/* Tasks - Drop Zone with ScrollArea */}
      <ScrollArea
        style={{
          flex: 1,
          marginRight: '-12px',
          paddingRight: '12px'
        }}
        type="auto"
        scrollbarSize={6}
        styles={{
          scrollbar: {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          },
          thumb: {
            backgroundColor: '#CCCCCC',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: `var(--mantine-color-${color}-6)`,
            },
          },
        }}
      >
        <div
          ref={setNodeRef}
          style={{
            minHeight: '200px',
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            willChange: 'background-color, border-radius, border, margin, padding', // Hardware acceleration
            backgroundColor: isOver ? 'rgba(70, 134, 254, 0.05)' : 'transparent',
            borderRadius: isOver ? '8px' : '0px',
            border: isOver ? '2px dashed rgba(70, 134, 254, 0.3)' : '2px dashed transparent',
            margin: isOver ? '4px' : '0px',
            padding: isOver ? '8px' : '0px',
          }}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {tasks.length === 0 ? (
                <>
                  {showPlaceholder && overId === id && (
                    <DragPlaceholder color={color} />
                  )}
                  {!isAddingCard && (
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                      No tasks
                    </Text>
                  )}
                </>
              ) : (
                tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {/* Show placeholder before the task if hovering over it */}
                    {showPlaceholder && overTask && overTaskIndex === index && (
                      <DragPlaceholder color={color} />
                    )}

                    {/* Only show the task if it's not being dragged */}
                    {task.id !== activeId && (
                      <KanbanCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        onToggleComplete={onToggleComplete}
                      />
                    )}

                    {/* Show placeholder after the last task if dropping at the end */}
                    {showPlaceholder && overId === id && index === tasks.length - 1 && !overTask && (
                      <DragPlaceholder color={color} />
                    )}
                  </React.Fragment>
                ))
              )}
            </Stack>
          </SortableContext>
        </div>
      </ScrollArea>

        {/* Add Card Button */}
        {onAddTask && !isAddingCard && (
          <Button
            variant="outline"
            leftSection={<Plus size={16} />}
            onClick={() => onAddTask(id)}
            fullWidth
            mt="lg"
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              borderColor: '#CCCCCC',
              color: '#333333',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              background: 'white',
            }}
            styles={{
              root: {
                '&:hover': {
                  borderColor: '#4686FE',
                  color: '#4686FE',
                },
              },
            }}
          >
            Add card
          </Button>
        )}
      </Card>
    </React.Fragment>
  );
}
