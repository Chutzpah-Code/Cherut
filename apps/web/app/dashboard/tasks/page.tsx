'use client';

import { useState, useEffect } from 'react';
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
  Modal,
  Loader,
  Center,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Plus, Search } from 'lucide-react';
import { BoardCard } from './components/BoardCard';
import {
  useBoards,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
  useEnsureDefaultBoard,
} from '@/hooks/useBoards';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const isMobile = useMediaQuery('(max-width: 600px)');

  const { data: boards, isLoading } = useBoards();
  const ensureDefault = useEnsureDefaultBoard();
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
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

  const handleCreate = () => {
    if (!newBoardName.trim()) return;
    createBoard.mutate(
      { name: newBoardName.trim(), colorIndex: (boards?.length ?? 0) % 8 },
      {
        onSuccess: () => {
          setNewBoardName('');
          setCreateModalOpen(false);
        },
      }
    );
  };

  const handleRename = (id: string, name: string) => {
    updateBoard.mutate({ boardId: id, dto: { name } });
  };

  const handleDelete = (id: string) => {
    deleteBoard.mutate(id);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <Stack gap="xl" style={{ fontFamily: 'Inter, sans-serif' }}>
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
            Tasks
          </Title>
          <Text size="md" c="dimmed">
            Organize your work across multiple boards
          </Text>
        </Box>

        <Group
          justify="space-between"
          align="center"
          style={{ flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 10 }}
        >
          <TextInput
            placeholder="Search boards..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius={10}
            style={{ width: isMobile ? '100%' : 260 }}
          />
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            radius={10}
            fullWidth={isMobile}
            style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif' }}
          >
            New board
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
                onRename={handleRename}
                onDelete={handleDelete}
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
              onClick={() => setCreateModalOpen(true)}
            >
              <ActionIcon size={40} variant="light" color="blue" radius={12} mb="xs">
                <Plus size={20} />
              </ActionIcon>
              <Text size="sm" fw={500} c="dimmed">
                Create new board
              </Text>
            </Card>
          </SimpleGrid>
        )}

        {!isLoading && filtered.length === 0 && (boards?.length ?? 0) > 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No boards found for &quot;{search}&quot;
          </Text>
        )}
      </Stack>

      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setNewBoardName('');
        }}
        title={
          <Text fw={600} style={{ fontFamily: 'Inter Display, sans-serif' }}>
            Create new board
          </Text>
        }
        radius="lg"
        centered
      >
        <Stack>
          <TextInput
            label="Board name"
            placeholder="e.g. Work, Personal, Q2 Goals..."
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
            radius={10}
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setCreateModalOpen(false);
                setNewBoardName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={createBoard.isPending}
              disabled={!newBoardName.trim()}
              style={{ backgroundColor: '#4686FE' }}
            >
              Create board
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
