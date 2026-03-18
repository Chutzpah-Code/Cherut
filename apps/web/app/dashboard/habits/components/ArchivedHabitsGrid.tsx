'use client';

import React, { useState } from 'react';
import { SimpleGrid, Card, Text, Badge, Group, ActionIcon, Stack, Menu, Tooltip } from '@mantine/core';
import { MoreVertical, ArchiveRestore, Trash2, Eye } from 'lucide-react';
import { Habit } from '@/lib/api/services/habits';

interface ArchivedHabitsGridProps {
  habits: Habit[];
  onUnarchive: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onView: (habit: Habit) => void;
}

export function ArchivedHabitsGrid({ habits, onUnarchive, onDelete, onView }: ArchivedHabitsGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    return category === 'good' ? 'green' : 'red';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      boolean: 'Yes/No',
      counter: 'Counter',
      duration: 'Duration',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (habits.length === 0) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <Card p="xl" mt="lg" radius={12}>
          <Stack align="center">
            <Text
              size="lg"
              fw={500}
              c="dimmed"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#666666',
              }}
            >
              No archived habits
            </Text>
            <Text
              size="sm"
              c="dimmed"
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#999999',
              }}
            >
              Habits you archive will appear here. You can unarchive them at any time.
            </Text>
          </Stack>
        </Card>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            p="md"
            withBorder
            radius={12}
            style={{
              opacity: 0.8,
              filter: 'grayscale(0.3)',
              transition: 'all 0.2s ease',
              transform: hoveredCard === habit.id ? 'scale(1.02)' : 'scale(1)',
              borderLeft: `4px solid ${getCategoryColor(habit.category) === 'green' ? '#22C55E' : '#EF4444'}`,
              border: '1px solid #E2E8F0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            styles={{
              root: {
                '&:hover': {
                  borderColor: '#4686FE',
                  boxShadow: '0 4px 12px rgba(70, 134, 254, 0.15)',
                },
              },
            }}
            onMouseEnter={() => setHoveredCard(habit.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  fw={600}
                  size="sm"
                  lineClamp={2}
                  mb="xs"
                  style={{
                    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  {habit.title}
                </Text>
                {habit.description && (
                  <Text
                    size="xs"
                    c="dimmed"
                    lineClamp={2}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#666666',
                    }}
                  >
                    {habit.description}
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
                    onClick={() => onView(habit)}
                  >
                    View Details
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<ArchiveRestore size={16} />}
                    onClick={() => onUnarchive(habit)}
                  >
                    Unarchive
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    onClick={() => onDelete(habit.id)}
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
                  color={getCategoryColor(habit.category)}
                  variant="light"
                >
                  {habit.category}
                </Badge>
                <Badge
                  size="xs"
                  color="blue"
                  variant="outline"
                >
                  {getTypeLabel(habit.type)}
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

            {habit.frequency && (
              <Group gap="xs" mt="xs">
                <Text size="xs" c="dimmed">
                  Frequency: {habit.frequency}
                </Text>
              </Group>
            )}
          </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}