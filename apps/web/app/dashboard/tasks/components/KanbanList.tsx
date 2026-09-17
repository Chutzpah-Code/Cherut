'use client';

import React from 'react';
import { Card, Text, Badge, Stack, Button, TextInput, ActionIcon, Group, ScrollArea } from '@mantine/core';
import { Plus, X, Check, Trash2, GripVertical } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard } from './KanbanCard';
import { DragPlaceholder } from './DragPlaceholder';
import { useState } from 'react';
import { modals } from '@mantine/modals';

interface KanbanListProps {
  id: string;
  title: string;
  color?: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId: string, title: string) => void;
  onEditTitle?: (newTitle: string) => void;
  onDelete?: () => void;
  activeId?: string | null;
  overId?: string | null;
  onToggleComplete?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export function KanbanList({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  onEditTitle,
  onDelete,
  activeId,
  overId,
  onToggleComplete,
  onEditTask,
}: KanbanListProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col:${id}`, data: { type: 'column', columnId: id } });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);

  const handleSaveTitle = () => {
    if (onEditTitle && titleValue.trim()) {
      onEditTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDeleteClick = () => {
    modals.openConfirmModal({
      title: 'Delete list',
      children: (
        <Text
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: '#666666',
            lineHeight: '20px',
          }}
        >
          {tasks.length > 0
            ? `Are you sure you want to delete "${title}"? This will also permanently delete ${tasks.length} task${tasks.length !== 1 ? 's' : ''} inside it. This action cannot be undone.`
            : `Are you sure you want to delete "${title}"? This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: {
        color: 'red',
        style: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
      },
      onConfirm: () => onDelete?.(),
    });
  };

  const showPlaceholder = activeId && (overId === id || tasks.some(task => task.id === overId));
  const overTask = overId && tasks.find(task => task.id === overId);
  const overTaskIndex = overTask ? tasks.indexOf(overTask) : -1;

  return (
    <Card
      ref={setSortableNodeRef}
      shadow="xs"
      padding="md"
      radius="lg"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: CSS.Transform.toString(transform),
        transition: isDragging
          ? 'none'
          : [transition, 'box-shadow 0.15s ease', 'border-color 0.15s ease'].filter(Boolean).join(', '),
        opacity: isDragging ? 0 : 1,
        borderColor: isOver ? '#CBD5E1' : '#E9ECEF',
        borderWidth: '1px',
        backgroundColor: isOver ? '#F8FAFC' : '#F4F5F7',
        boxShadow: isOver ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md" wrap="nowrap" gap={4}>
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder list"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#97A0AF',
            cursor: 'grab',
            touchAction: 'none',
            flexShrink: 0,
          }}
        >
          <GripVertical size={14} />
        </div>
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
            <ActionIcon size="sm" color="gray" variant="subtle" onClick={() => { setTitleValue(title); setIsEditingTitle(false); }}>
              <X size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap" align="center">
            <Text
              fw={600}
              size="sm"
              onClick={() => onEditTitle && setIsEditingTitle(true)}
              style={{
                cursor: onEditTitle ? 'pointer' : 'default',
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
        )}

        {onDelete && (
          <ActionIcon
            size="sm"
            color="gray"
            variant="subtle"
            onClick={handleDeleteClick}
            style={{ color: '#97A0AF' }}
          >
            <Trash2 size={14} />
          </ActionIcon>
        )}
      </Group>

      {/* Drop zone */}
      <ScrollArea
        style={{ flex: 1 }}
        type="auto"
        scrollbarSize={4}
        styles={{
          thumb: { backgroundColor: '#CBD5E1', borderRadius: 4 },
        }}
      >
        <div
          ref={setNodeRef}
          style={{
            minHeight: 120,
            transition: 'background-color 0.15s ease',
            backgroundColor: isOver ? 'rgba(9, 30, 66, 0.04)' : 'transparent',
            borderRadius: 8,
            padding: isOver ? 4 : 0,
          }}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {tasks.length === 0 ? (
                <>
                  {showPlaceholder && overId === id && <DragPlaceholder color="gray" />}
                  {!isAddingCard && (
                    <Text c="dimmed" size="xs" ta="center" py="xl" style={{ color: '#97A0AF' }}>
                      No tasks
                    </Text>
                  )}
                </>
              ) : (
                tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    {showPlaceholder && overTask && overTaskIndex === index && (
                      <DragPlaceholder color="gray" />
                    )}
                    {task.id !== activeId && (
                      <KanbanCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask ? () => onEditTask(task) : undefined}
                      />
                    )}
                    {showPlaceholder && overId === id && index === tasks.length - 1 && !overTask && (
                      <DragPlaceholder color="gray" />
                    )}
                  </React.Fragment>
                ))
              )}
            </Stack>
          </SortableContext>
        </div>
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
