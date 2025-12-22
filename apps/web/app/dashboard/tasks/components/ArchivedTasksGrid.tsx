'use client';

import { SimpleGrid, Card, Text, Badge, Group, ActionIcon, Stack, Menu, Tooltip } from '@mantine/core';
import { MoreVertical, ArchiveRestore, Trash2, Eye } from 'lucide-react';
import { Task } from '@/lib/api/services/tasks';
import { useState } from 'react';

interface ArchivedTasksGridProps {
  tasks: Task[];
  onUnarchive: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}

export function ArchivedTasksGrid({ tasks, onUnarchive, onDelete, onView }: ArchivedTasksGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority as keyof typeof colors] || 'gray';
  };

  if (tasks.length === 0) {
    return (
      <Card p="xl" mt="lg">
        <Stack align="center">
          <Text size="lg" fw={500} c="dimmed">
            No archived tasks
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Tasks you archive will appear here. You can unarchive them at any time.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {tasks.map((task) => (
        <Card
          key={task.id}
          p="md"
          withBorder
          style={{
            opacity: 0.8,
            filter: 'grayscale(0.3)',
            transition: 'all 0.2s ease',
            transform: hoveredCard === task.id ? 'scale(1.02)' : 'scale(1)',
            borderLeft: `4px solid var(--mantine-color-${getPriorityColor(task.priority)}-6)`,
          }}
          onMouseEnter={() => setHoveredCard(task.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} size="sm" lineClamp={2} mb="xs">
                  {task.title}
                </Text>
                {task.description && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {task.description}
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
                    onClick={() => onView(task)}
                  >
                    View Details
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<ArchiveRestore size={16} />}
                    onClick={() => onUnarchive(task)}
                  >
                    Unarchive
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    onClick={() => onDelete(task)}
                  >
                    Delete Permanently
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Group gap="xs" justify="space-between">
              <Group gap="xs">
                <Badge
                  size="xs"
                  color={getPriorityColor(task.priority)}
                  variant="light"
                >
                  {task.priority}
                </Badge>
                <Badge
                  size="xs"
                  color="gray"
                  variant="outline"
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </Group>

              <Group gap="xs">
                <Tooltip label="Archived">
                  <Badge size="xs" color="gray" variant="dot">
                    archived
                  </Badge>
                </Tooltip>
              </Group>
            </Group>

            {task.checklist && task.checklist.length > 0 && (
              <Group gap="xs" mt="xs">
                <Text size="xs" c="dimmed">
                  {task.checklist.filter(item => item.completed).length}/{task.checklist.length} tasks completed
                </Text>
              </Group>
            )}
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}