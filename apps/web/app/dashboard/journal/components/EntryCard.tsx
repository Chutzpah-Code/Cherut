'use client';

import React from 'react';
import { Card, Text, Group, Badge, ActionIcon, Menu } from '@mantine/core';
import { MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { JournalEntry } from '@/lib/api/services/journal';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntryCard({ entry, onClick, onEdit, onDelete }: EntryCardProps) {
  const formattedDate = format(new Date(entry.createdAt), 'MMM dd, yyyy');
  const formattedTime = format(new Date(entry.createdAt), 'HH:mm');

  // Get preview text (first 150 characters)
  const previewText = entry.content.length > 150
    ? entry.content.substring(0, 150) + '...'
    : entry.content;

  // Check if entry was updated
  const wasUpdated = new Date(entry.updatedAt) > new Date(entry.createdAt);

  return (
    <Card
      withBorder
      radius="md"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--mantine-shadow-sm)',
          }
        }
      }}
      onClick={onClick}
    >
      {/* Title */}
      <Text fw={600} size="md" mb="xs" lineClamp={2}>
        {entry.title || 'Untitled Entry'}
      </Text>

      <Group justify="space-between" align="flex-start" mb="xs">
        <Group gap="xs" align="center">
          <Calendar size={14} />
          <Text size="xs" c="dimmed">
            {formattedDate} at {formattedTime}
          </Text>
          {wasUpdated && (
            <Badge size="xs" color="blue" variant="light">
              Edited
            </Badge>
          )}
        </Group>

        {(onEdit || onDelete) && (
          <Menu shadow="md" width={120} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {onEdit && (
                <Menu.Item
                  leftSection={<Edit size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  Edit
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Text size="sm" style={{ flexGrow: 1, whiteSpace: 'pre-line' }}>
        {previewText}
      </Text>

      <Group justify="space-between" align="center" mt="md" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Text size="xs" c="dimmed">
          {entry.content.length.toLocaleString()} characters
        </Text>
        <Text size="xs" c="blue" fw={500}>
          Click to read more
        </Text>
      </Group>
    </Card>
  );
}