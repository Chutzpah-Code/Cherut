'use client';

import React from 'react';
import { Card, Text, Group, Badge, ActionIcon, Menu } from '@mantine/core';
import { MoreVertical, Edit, Trash2, Calendar, Eye, ArchiveRestore } from 'lucide-react';
import { JournalEntry } from '@/lib/api/services/journal';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isArchived?: boolean;
  onUnarchive?: (entry: JournalEntry) => void;
}

export function EntryCard({ entry, onClick, onEdit, onDelete, isArchived = false, onUnarchive }: EntryCardProps) {
  const formattedDate = format(new Date(entry.createdAt), 'MMM dd, yyyy');
  const formattedTime = format(new Date(entry.createdAt), 'HH:mm');

  // Get preview text (first 150 characters)
  const previewText = entry.content.length > 150
    ? entry.content.substring(0, 150) + '...'
    : entry.content;

  // Check if entry was updated
  const wasUpdated = new Date(entry.updatedAt) > new Date(entry.createdAt);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
        withBorder
        radius={16}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        styles={{
          root: {
            border: '1px solid #E5E7EB',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#4686FE',
              boxShadow: '0 4px 12px rgba(70, 134, 254, 0.15)',
            }
          }
        }}
        onClick={onClick}
      >
      {/* Title */}
      {/* Title with Archive badge */}
      <Group gap="sm" wrap="wrap" align="flex-start">
        <Text
          fw={600}
          size="md"
          lineClamp={2}
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#000000',
            flex: 1,
          }}
        >
          {entry.title || 'Untitled Entry'}
        </Text>
        {isArchived && (
          <Badge
            size="sm"
            variant="light"
            color="gray"
            radius={6}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
            }}
          >
            Archived
          </Badge>
        )}
      </Group>

      <Group justify="space-between" align="flex-start" mb="xs">
        <Group gap="xs" align="center">
          <Calendar size={14} />
          <Text
            size="xs"
            c="dimmed"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: '#666666',
            }}
          >
            {formattedDate} at {formattedTime}
          </Text>
          {wasUpdated && (
            <Badge
              size="xs"
              radius={6}
              styles={{
                root: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#EBF8FF',
                  color: '#4686FE',
                  border: '1px solid #4686FE',
                },
              }}
            >
              Edited
            </Badge>
          )}
        </Group>

        {(onEdit || onDelete || isArchived) && (
          <Menu shadow="md" width={isArchived ? 180 : 120} position="bottom-end">
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
              {isArchived ? (
                <>
                  <Menu.Item
                    leftSection={<Eye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}
                  >
                    View Details
                  </Menu.Item>
                  {onUnarchive && (
                    <Menu.Item
                      leftSection={<ArchiveRestore size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnarchive(entry);
                      }}
                    >
                      Unarchive
                    </Menu.Item>
                  )}
                  {onDelete && (
                    <>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<Trash2 size={14} />}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                      >
                        Delete Permanently
                      </Menu.Item>
                    </>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Text
        size="sm"
        style={{
          flexGrow: 1,
          whiteSpace: 'pre-line',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#333333',
          lineHeight: '1.5',
        }}
      >
        {previewText}
      </Text>

      <Group justify="space-between" align="center" mt="md" pt="xs" style={{ borderTop: '1px solid #E5E7EB' }}>
        <Text
          size="xs"
          c="dimmed"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#666666',
          }}
        >
          {entry.content.length.toLocaleString()} characters
        </Text>
        <Text
          size="xs"
          fw={500}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#4686FE',
          }}
        >
          Click to read more
        </Text>
      </Group>
      </Card>
    </>
  );
}