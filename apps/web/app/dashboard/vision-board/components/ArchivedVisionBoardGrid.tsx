'use client';

import React, { useState } from 'react';
import { SimpleGrid, Card, Text, Badge, Group, ActionIcon, Stack, Menu, Tooltip, Image } from '@mantine/core';
import { MoreVertical, ArchiveRestore, Trash2, Eye } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';

interface ArchivedVisionBoardGridProps {
  items: VisionBoardItem[];
  onUnarchive: (item: VisionBoardItem) => void;
  onDelete: (itemId: string) => void;
  onView: (item: VisionBoardItem) => void;
}

export function ArchivedVisionBoardGrid({ items, onUnarchive, onDelete, onView }: ArchivedVisionBoardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getDueDateBadge = (dueDate?: string) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge color="red" variant="filled" size="sm">Overdue</Badge>;
    } else if (diffDays === 0) {
      return <Badge color="orange" variant="filled" size="sm">Today</Badge>;
    } else if (diffDays <= 7) {
      return <Badge color="yellow" variant="filled" size="sm">{diffDays} days left</Badge>;
    } else if (diffDays <= 30) {
      return <Badge color="cyan" variant="filled" size="sm">{diffDays} days</Badge>;
    } else {
      return <Badge color="violet" variant="filled" size="sm">{diffDays} days</Badge>;
    }
  };

  if (items.length === 0) {
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
              No archived vision board items
            </Text>
            <Text
              size="sm"
              c="dimmed"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#888888',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              Archived items will appear here when you archive vision board items.
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
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing="lg"
        mt="md"
      >
        {items.map((item) => (
          <Card
            key={item.id}
            shadow="none"
            padding={0}
            radius={16}
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: '1px solid #E5E7EB',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)',
              opacity: 0.8,
            }}
          >
            {/* Image Section */}
            <div style={{
              position: 'relative',
              height: '200px',
              overflow: 'hidden',
              background: '#f8f9fa',
            }}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(50%) opacity(0.8)',
                }}
              />

              {/* Menu Button */}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    variant="filled"
                    color="white"
                    size="md"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#666666',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      opacity: hoveredCard === item.id ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Eye size={16} />}
                    onClick={() => onView(item)}
                  >
                    View Details
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<ArchiveRestore size={16} />}
                    onClick={() => onUnarchive(item)}
                  >
                    Unarchive
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<Trash2 size={16} />}
                    color="red"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete Permanently
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>

            {/* Content Section */}
            <div
              style={{
                padding: '16px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => onView(item)}
            >
              <Stack gap={8}>
                <Text
                  fw={600}
                  size="sm"
                  style={{
                    fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </Text>

                {item.description && (
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#6B7280',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </Text>
                )}
              </Stack>

              {/* Due Date Badge */}
              {item.dueDate && (
                <Group justify="flex-end" mt="xs">
                  {getDueDateBadge(item.dueDate)}
                </Group>
              )}
            </div>

            {/* Archived Indicator */}
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(107, 114, 128, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}>
              Archived
            </div>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}