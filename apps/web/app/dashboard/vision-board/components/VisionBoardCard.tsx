'use client';

import { Card, Box, Text, Badge, Group, Image, ActionIcon, Menu } from '@mantine/core';
import { MoreVertical, Archive, Trash2, Eye, Edit } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { useState } from 'react';

interface VisionBoardCardProps {
  item: VisionBoardItem;
  onClick: () => void;
  onEdit?: (item: VisionBoardItem) => void;
  onArchive?: (item: VisionBoardItem) => void;
  onDelete?: (itemId: string) => void;
}

export function VisionBoardCard({ item, onClick, onEdit, onArchive, onDelete }: VisionBoardCardProps) {
  const [hoveredCard, setHoveredCard] = useState(false);
  // Calcular se está próximo do due date
  const getDueDateBadge = () => {
    if (!item.dueDate) return null;

    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge color="red" variant="filled">Overdue</Badge>;
    } else if (diffDays === 0) {
      return <Badge color="orange" variant="filled">Today</Badge>;
    } else if (diffDays <= 7) {
      return <Badge color="yellow" variant="filled">{diffDays} days left</Badge>;
    } else if (diffDays <= 30) {
      return <Badge color="cyan" variant="filled">{diffDays} days</Badge>;
    } else {
      // Always show days count, even after 30 days
      return <Badge color="violet" variant="filled">{diffDays} days</Badge>;
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Card
        shadow="none"
        padding={0}
        radius={16}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #CCCCCC',
          background: 'white',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          setHoveredCard(true);
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#4686FE';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          setHoveredCard(false);
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#CCCCCC';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
      {/* Imagem */}
      <Box style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }} onClick={onClick}>
        <Image
          src={item.imageUrl}
          alt={item.title}
          fit="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Menu Button */}
        {(onEdit || onArchive || onDelete) && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="filled"
                color="white"
                size="md"
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#666666',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  opacity: hoveredCard ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Eye size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                View Details
              </Menu.Item>
              {onEdit && (
                <Menu.Item
                  leftSection={<Edit size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  Edit
                </Menu.Item>
              )}
              {onArchive && (
                <Menu.Item
                  leftSection={<Archive size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(item);
                  }}
                >
                  Archive
                </Menu.Item>
              )}
              {onDelete && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<Trash2 size={16} />}
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}

        {/* Badge do due date no canto superior direito */}
        {getDueDateBadge() && (
          <Box
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            {getDueDateBadge()}
          </Box>
        )}
      </Box>

      {/* Conteúdo */}
      <Box p="lg" style={{ flex: 1, display: 'flex', flexDirection: 'column' }} onClick={onClick}>
        <Text
          lineClamp={2}
          mb="xs"
          style={{
            fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#000000',
            lineHeight: '24px',
          }}
        >
          {item.title}
        </Text>

        {item.description && (
          <Text
            lineClamp={2}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#666666',
              lineHeight: '20px',
            }}
          >
            {item.description}
          </Text>
        )}
      </Box>
    </Card>
    </>
  );
}
