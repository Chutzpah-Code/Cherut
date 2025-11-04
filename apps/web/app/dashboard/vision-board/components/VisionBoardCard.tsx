'use client';

import { Card, Box, Text, Badge, Group, Image } from '@mantine/core';
import { VisionBoardItem } from '@/lib/api/services/vision-board';

interface VisionBoardCardProps {
  item: VisionBoardItem;
  onClick: () => void;
}

export function VisionBoardCard({ item, onClick }: VisionBoardCardProps) {
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
    <Card
      shadow="sm"
      padding={0}
      radius="md"
      withBorder
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Imagem */}
      <Box style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
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
      <Box p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Text fw={600} size="lg" lineClamp={2} mb="xs">
          {item.title}
        </Text>

        {item.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {item.description}
          </Text>
        )}
      </Box>
    </Card>
  );
}
