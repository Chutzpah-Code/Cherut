'use client';

import { useTranslations } from 'next-intl';
import { Card, Box, Text, Badge, Group, Image, ActionIcon, Menu } from '@mantine/core';
import { MoreVertical, Archive, Trash2, Eye, Play, Pencil, Check } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { PracticeSummaryEntry } from '@/lib/api/services/vision-board';
import { countFilledVisualizationFields, VISUALIZATION_PROGRESS_TOTAL } from '@/lib/vision-board/visualization-fields';
import { classifyLastPracticed } from '@/lib/vision-board/practice-format';
import { useState } from 'react';

interface VisionBoardCardProps {
  item: VisionBoardItem;
  practiceSummary?: PracticeSummaryEntry;
  onVisualize: (item: VisionBoardItem) => void;
  onEdit: (item: VisionBoardItem, tab: 'meta' | 'visualization') => void;
  onArchive?: (item: VisionBoardItem) => void;
  onDelete?: (itemId: string) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (item: VisionBoardItem) => void;
}

export function VisionBoardCard({
  item,
  practiceSummary,
  onVisualize,
  onEdit,
  onArchive,
  onDelete,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: VisionBoardCardProps) {
  const t = useTranslations('visionBoard.card');
  const td = useTranslations('visionBoard.dueDateBadge');
  const tp = useTranslations('visionBoard.practiceHistory');
  const [hoveredCard, setHoveredCard] = useState(false);

  const getDueDateBadge = () => {
    if (item.completed) {
      return <Badge color="green" variant="filled" style={{ whiteSpace: 'nowrap' }}>{td('completed')}</Badge>;
    }
    if (!item.dueDate) return null;

    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge color="red" variant="filled" style={{ whiteSpace: 'nowrap' }}>{td('overdue')}</Badge>;
    }
    return <Badge color="violet" variant="filled" style={{ whiteSpace: 'nowrap' }}>{td('days', { count: diffDays })}</Badge>;
  };

  const filledCount = countFilledVisualizationFields(item);
  const isComplete = filledCount >= VISUALIZATION_PROGRESS_TOTAL;
  const lastPracticed = classifyLastPracticed(practiceSummary?.lastPracticedAt ?? null);

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect?.(item);
    }
  };

  return (
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
        border: selectionMode && selected ? '2px solid #4686FE' : '1px solid #CCCCCC',
        background: 'white',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}
      onMouseEnter={() => setHoveredCard(true)}
      onMouseLeave={() => setHoveredCard(false)}
    >
      <Box style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }} onClick={handleCardClick}>
        <Image
          src={item.imageUrl}
          alt={item.title}
          fit="cover"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {selectionMode ? (
          <Box
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 26,
              height: 26,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selected ? '#4686FE' : 'rgba(255,255,255,0.85)',
              border: selected ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
            }}
          >
            {selected && <Check size={15} color="white" />}
          </Box>
        ) : (
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
                  onClick={(e) => { e.stopPropagation(); onEdit(item, 'meta'); }}
                >
                  {t('viewDetails')}
                </Menu.Item>
                {onArchive && (
                  <Menu.Item
                    leftSection={<Archive size={16} />}
                    onClick={(e) => { e.stopPropagation(); onArchive(item); }}
                  >
                    {t('archive')}
                  </Menu.Item>
                )}
                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<Trash2 size={16} />}
                      color="red"
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    >
                      {t('delete')}
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
        )}

        {getDueDateBadge() && (
          <Box style={{ position: 'absolute', top: 8, right: 8 }}>
            {getDueDateBadge()}
          </Box>
        )}
      </Box>

      <Box p="lg" pb="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column' }} onClick={handleCardClick}>
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

        <Box style={{ flex: 1 }} />

        <Group gap={4} mt="sm" mb={4}>
          {Array.from({ length: 7 }, (_, i) => (
            <Box
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: practiceSummary?.last7Days?.[i] ? '#4686FE' : '#E5E7EB',
              }}
            />
          ))}
        </Group>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {practiceSummary && practiceSummary.totalCount > 0
            ? tp('practicesCount', {
                count: practiceSummary.totalCount,
                when: lastPracticed
                  ? lastPracticed.kind === 'today'
                    ? tp('lastPracticedToday')
                    : lastPracticed.kind === 'yesterday'
                      ? tp('lastPracticedYesterday')
                      : tp('lastPracticedDaysAgo', { count: lastPracticed.days })
                  : '',
              })
            : tp('noPracticeYet')}
        </Text>
      </Box>

      {!selectionMode && (
        <Group gap={0} style={{ borderTop: '1px solid #E5E7EB' }} wrap="nowrap">
          <Box
            onClick={(e) => { e.stopPropagation(); onVisualize(item); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#4686FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <Play size={14} /> {t('visualizeButton')}
          </Box>
          <Box style={{ width: 1, background: '#E5E7EB', alignSelf: 'stretch' }} />
          <Box
            onClick={(e) => { e.stopPropagation(); onEdit(item, isComplete ? 'meta' : 'visualization'); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <Pencil size={14} />
            {t('editButton')}
          </Box>
        </Group>
      )}
    </Card>
  );
}
