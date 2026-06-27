'use client';

import { useState, use, useEffect } from 'react';
import { Stack, Group, Title, ActionIcon, TextInput, Loader } from '@mantine/core';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BoardKanbanView } from './components/BoardKanbanView';
import { ViewSwitcher, TaskView } from '../components/ViewSwitcher';
import { useBoard, useUpdateBoard } from '@/hooks/useBoards';

export default function BoardDetailPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const router = useRouter();
  const [currentView, setCurrentView] = useState<TaskView>('kanban');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  const { data: board, isLoading } = useBoard(boardId);
  const updateBoard = useUpdateBoard();

  useEffect(() => {
    if (board) setNameValue(board.name);
  }, [board]);

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== board?.name) {
      updateBoard.mutate({ boardId, dto: { name: trimmed } });
    }
    setIsEditingName(false);
  };

  const displayName = board?.name ?? '';

  return (
    <Stack
      gap={0}
      style={{ fontFamily: 'Inter, sans-serif', height: '100%' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <Group gap="md" align="center" mb="sm">
        <ActionIcon
          variant="subtle"
          color="gray"
          size={36}
          radius={10}
          onClick={() => router.push('/dashboard/tasks')}
        >
          <ArrowLeft size={18} />
        </ActionIcon>

        {isLoading ? (
          <Loader size="xs" color="gray" />
        ) : isEditingName ? (
          <Group gap="xs">
            <TextInput
              value={nameValue}
              onChange={(e) => setNameValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setNameValue(displayName);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              size="md"
              radius={8}
              styles={{
                input: {
                  fontFamily: 'Inter Display, sans-serif',
                  fontWeight: 700,
                  fontSize: '22px',
                  letterSpacing: '-0.02em',
                },
              }}
            />
            <ActionIcon size={32} color="green" onClick={handleSaveName}>
              <Check size={16} />
            </ActionIcon>
            <ActionIcon
              size={32}
              color="gray"
              variant="subtle"
              onClick={() => { setNameValue(displayName); setIsEditingName(false); }}
            >
              <X size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Title
            order={1}
            style={{
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(18px, 4vw, 28px)',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
              cursor: 'pointer',
            }}
            onClick={() => {
              setNameValue(displayName);
              setIsEditingName(true);
            }}
          >
            {displayName || 'Board'}
          </Title>
        )}
      </Group>

      <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

      <BoardKanbanView boardId={boardId} />
    </Stack>
  );
}
