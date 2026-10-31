'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Title,
  Text,
  Stack,
  Box,
  SimpleGrid,
  Card,
  Group,
  TextInput,
  ActionIcon,
  Button,
  Loader,
  Center,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Plus, Search } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';
import { BoardCard, Board } from './components/BoardCard';
import { EditDrawer } from './components/EditDrawer';
import { PendingInvitationsList } from './components/PendingInvitationsList';
import { useAuth } from '@/contexts/AuthContext';
import {
  useBoards,
  useDeleteBoard,
  useEnsureDefaultBoard,
} from '@/hooks/useBoards';

export default function TasksPage() {
  const t = useTranslations('tasks.boardList');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { user } = useAuth();
  const { data: boards, isLoading } = useBoards();
  const ensureDefault = useEnsureDefaultBoard();
  const deleteBoard = useDeleteBoard();

  // Ensure user has at least a default board on first visit
  useEffect(() => {
    if (!isLoading && boards?.length === 0) {
      ensureDefault.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, boards?.length]);

  const filtered = (boards ?? []).filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNew = () => {
    setEditingBoard(null);
    setDrawerOpen(true);
  };

  const handleBoardCreated = (board: Board) => {
    // Keeps the drawer open, now in edit mode, for the board just created.
    setEditingBoard(board);
  };

  const handleEdit = (board: Board) => {
    setEditingBoard(board);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBoard.mutate(id);
    setDrawerOpen(false);
    setEditingBoard(null);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <Surface p={{ base: 'md', sm: 'xl' }} style={{ fontFamily: 'Inter, sans-serif', paddingRight: drawerOpen && isDesktop ? 420 : undefined, transition: 'padding-right 0.2s ease' }}>
      <Stack gap="xl">
        <Box>
          <Title
            order={1}
            mb="xs"
            style={{
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </Title>
          <Text size="md" c="dimmed">
            {t('subtitle')}
          </Text>
        </Box>

        <PendingInvitationsList />

        <Group
          justify="space-between"
          align="center"
          style={{ flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 10 }}
        >
          <TextInput
            placeholder={t('searchPlaceholder')}
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius={10}
            style={{ width: isMobile ? '100%' : 260 }}
          />
          <Button
            leftSection={<Plus size={16} />}
            onClick={handleCreateNew}
            radius={10}
            fullWidth={isMobile}
            style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif' }}
          >
            {t('newBoard')}
          </Button>
        </Group>

        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" color="#4686FE" />
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={{ id: board.id, name: board.name, colorIndex: board.colorIndex }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isOwner={board.userId === user?.uid}
                isOpenInDrawer={drawerOpen && editingBoard?.id === board.id}
              />
            ))}

            <Card
              radius="lg"
              padding="md"
              style={{
                cursor: 'pointer',
                border: '2px dashed #E9ECEF',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 148,
                transition: 'all 0.2s ease',
              }}
              onClick={handleCreateNew}
            >
              <ActionIcon size={40} variant="light" color="blue" radius={12} mb="xs">
                <Plus size={20} />
              </ActionIcon>
              <Text size="sm" fw={500} c="dimmed">
                {t('createNewBoard')}
              </Text>
            </Card>
          </SimpleGrid>
        )}

        {!isLoading && filtered.length === 0 && (boards?.length ?? 0) > 0 && (
          <Text ta="center" c="dimmed" py="xl">
            {t('noResults', { search })}
          </Text>
        )}
      </Stack>
      </Surface>

      <EditDrawer
        opened={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingBoard(null); }}
        board={editingBoard}
        isOwner={editingBoard ? boards?.find((b) => b.id === editingBoard.id)?.userId === user?.uid : true}
        onDelete={handleDelete}
        onCreated={handleBoardCreated}
      />
    </>
  );
}
