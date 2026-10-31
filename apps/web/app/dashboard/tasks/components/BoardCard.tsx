'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  Text,
  Group,
  Stack,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { MoreHorizontal, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Board {
  id: string;
  name: string;
  colorIndex: number;
}

export const BOARD_COLORS = [
  { accent: '#4686FE', bg: '#EEF3FF' },
  { accent: '#7C3AED', bg: '#F5F3FF' },
  { accent: '#0D9488', bg: '#F0FDFA' },
  { accent: '#EA580C', bg: '#FFF7ED' },
  { accent: '#16A34A', bg: '#F0FDF4' },
  { accent: '#DB2777', bg: '#FDF2F8' },
  { accent: '#D97706', bg: '#FFFBEB' },
  { accent: '#475569', bg: '#F8FAFC' },
];

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (id: string) => void;
  isOwner?: boolean;
  isOpenInDrawer?: boolean;
}

export function BoardCard({ board, onEdit, onDelete, isOwner = true, isOpenInDrawer = false }: BoardCardProps) {
  const t = useTranslations('tasks.boardCard');
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const color = BOARD_COLORS[board.colorIndex % BOARD_COLORS.length];

  return (
    <>
      <Card
        radius="lg"
        withBorder
        padding={0}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          borderColor: isOpenInDrawer ? color.accent : isHovered ? color.accent : '#E9ECEF',
          boxShadow: isHovered
            ? `0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px ${color.accent}30`
            : '0 1px 3px rgba(0,0,0,0.06)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => router.push(`/dashboard/tasks/${board.id}`)}
      >
        <div style={{ height: 4, backgroundColor: color.accent, width: '100%' }} />

        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: color.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LayoutGrid size={18} color={color.accent} />
            </div>

            <Menu shadow="md" width={160} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={28}
                  radius={8}
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Edit2 size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(board);
                  }}
                >
                  {t('edit')}
                </Menu.Item>
                {isOwner && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<Trash2 size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(board.id);
                      }}
                    >
                      {t('delete')}
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Text
            fw={600}
            size="md"
            style={{
              fontFamily: 'Inter Display, sans-serif',
              letterSpacing: '-0.01em',
              color: '#111',
            }}
          >
            {board.name}
          </Text>
        </Stack>
      </Card>
    </>
  );
}
