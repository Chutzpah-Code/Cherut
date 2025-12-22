'use client';

import { SimpleGrid, Card, Text, Group, ActionIcon, Stack, Menu, Tooltip, Badge } from '@mantine/core';
import { MoreVertical, ArchiveRestore, Trash2, Eye } from 'lucide-react';
import { JournalEntry } from '@/lib/api/services/journal';
import { useState } from 'react';

interface ArchivedJournalGridProps {
  entries: JournalEntry[];
  onUnarchive: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
  onView: (entry: JournalEntry) => void;
}

export function ArchivedJournalGrid({ entries, onUnarchive, onDelete, onView }: ArchivedJournalGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (entries.length === 0) {
    return (
      <Card p="xl" mt="lg">
        <Stack align="center">
          <Text size="lg" fw={500} c="dimmed">
            No archived journal entries
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Journal entries you archive will appear here. You can unarchive them at any time.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          p="md"
          withBorder
          style={{
            opacity: 0.8,
            filter: 'grayscale(0.3)',
            transition: 'all 0.2s ease',
            transform: hoveredCard === entry.id ? 'scale(1.02)' : 'scale(1)',
            borderLeft: '4px solid var(--mantine-color-blue-6)',
          }}
          onMouseEnter={() => setHoveredCard(entry.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} size="sm" lineClamp={2} mb="xs">
                  {entry.title}
                </Text>
                {entry.content && (
                  <Text size="xs" c="dimmed" lineClamp={3}>
                    {entry.content}
                  </Text>
                )}
              </div>

              <Menu shadow="md" width={180}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="sm" color="gray">
                    <MoreVertical size={14} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Eye size={16} />}
                    onClick={() => onView(entry)}
                  >
                    View Details
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<ArchiveRestore size={16} />}
                    onClick={() => onUnarchive(entry)}
                  >
                    Unarchive
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    onClick={() => onDelete(entry.id)}
                  >
                    Delete Permanently
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Group gap="xs" justify="space-between">
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {formatDate(entry.createdAt)}
                </Text>
              </Group>

              <Group gap="xs">
                <Tooltip label="Archived">
                  <Badge size="xs" color="gray" variant="dot">
                    archived
                  </Badge>
                </Tooltip>
              </Group>
            </Group>

            {entry.updatedAt !== entry.createdAt && (
              <Group gap="xs" mt="xs">
                <Text size="xs" c="dimmed">
                  Updated: {formatDate(entry.updatedAt)}
                </Text>
              </Group>
            )}
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}