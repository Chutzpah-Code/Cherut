'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, ThemeIcon, Button, TextInput, Stack } from '@mantine/core';
import { X, LayoutGrid, Check, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateBoard, useUpdateBoard } from '@/hooks/useBoards';
import { Board, BOARD_COLORS } from './BoardCard';

interface FormState {
  name: string;
  colorIndex: number;
}

function toFormState(board: Board | null): FormState {
  return { name: board?.name ?? '', colorIndex: board?.colorIndex ?? 0 };
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  board: Board | null;
  isOwner?: boolean;
  onDelete: (id: string) => void;
  onCreated: (board: { id: string; name: string; colorIndex: number }) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({ opened, onClose, board, isOwner = true, onDelete, onCreated }: EditDrawerProps) {
  const t = useTranslations('tasks.boardCard');
  const tl = useTranslations('tasks.boardList');
  const te = useTranslations('tasks.editDrawer');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const createMutation = useCreateBoard();
  const updateMutation = useUpdateBoard();

  const mode: 'create' | 'edit' = board ? 'edit' : 'create';

  const [formState, setFormState] = useState<FormState>(() => toFormState(board));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(board));
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, board?.id]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (mode === 'edit') dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const debouncedFormState = useDebounce(formState, 500);

  useEffect(() => {
    if (mode !== 'edit' || !board || !dirtyRef.current) return;
    if (!debouncedFormState.name.trim()) return; // wait for a non-empty name
    dirtyRef.current = false;
    setSaveStatus('pending');
    updateMutation.mutate(
      { boardId: board.id, dto: { name: debouncedFormState.name.trim(), colorIndex: debouncedFormState.colorIndex } },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const requiredFieldsFilled = !!formState.name.trim();

  const handleCreate = () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    createMutation.mutate(
      { name: formState.name.trim(), colorIndex: formState.colorIndex },
      { onSuccess: (created) => onCreated(created) },
    );
  };

  const accentColor = BOARD_COLORS[formState.colorIndex % BOARD_COLORS.length].accent;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 420}
      withOverlay={!isDesktop}
      closeOnClickOutside={!isDesktop}
      withCloseButton={false}
      padding={0}
      styles={{
        content: {
          maxWidth: '100vw',
          height: isFullScreen ? '100dvh' : undefined,
          display: 'flex',
          flexDirection: 'column',
        },
        body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box px="md" py="sm" style={{ borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon size={40} radius={8} variant="light" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
              <LayoutGrid size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? te('editLabel') : te('newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>{formState.name || tl('boardNamePlaceholder')}</Text>
            </Box>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={te('close')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="md">
          <TextInput
            label={tl('boardNameLabel')}
            placeholder={tl('boardNamePlaceholder')}
            value={formState.name}
            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
            required
            withAsterisk
            error={showErrors && !formState.name.trim() ? te('fieldRequired') : undefined}
            autoFocus
            radius={8}
          />

          <Box>
            <Text size="sm" fw={600} mb={6}>{t('boardColor')}</Text>
            <Group gap="sm">
              {BOARD_COLORS.map((swatch, index) => {
                const selected = index === formState.colorIndex % BOARD_COLORS.length;
                return (
                  <ActionIcon
                    key={index}
                    aria-label={t('colorAriaLabel', { index: index + 1 })}
                    onClick={() => setFormState((prev) => ({ ...prev, colorIndex: index }))}
                    radius="xl"
                    size={40}
                    style={{
                      backgroundColor: swatch.accent,
                      border: selected ? '2px solid #111' : '2px solid transparent',
                      outline: selected ? '2px solid #fff' : 'none',
                      outlineOffset: selected ? -4 : 0,
                    }}
                  >
                    {selected && <Check size={18} color="#fff" strokeWidth={3} />}
                  </ActionIcon>
                );
              })}
            </Group>
          </Box>

          {board && isOwner && (
            <Button
              variant="outline"
              color="red"
              leftSection={<Trash2 size={16} />}
              onClick={() => onDelete(board.id)}
              radius={8}
            >
              {t('delete')}
            </Button>
          )}
        </Stack>
      </Box>

      <Box
        px="md"
        py="sm"
        style={{ borderTop: '1px solid #E5E7EB', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}
      >
        {mode === 'create' ? (
          <Box>
            {!requiredFieldsFilled && (
              <Text size="xs" c="dimmed" mb={6}>{te('fillNameHint')}</Text>
            )}
            <Group justify="space-between" wrap="nowrap">
              <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
                {tl('cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                disabled={!requiredFieldsFilled}
                radius={8}
                style={{ whiteSpace: 'nowrap', backgroundColor: accentColor, border: 'none' }}
              >
                {tl('createBoard')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="board-drawer-spin" />}
              {saveStatus === 'saved' && <Check size={14} color="#16A34A" />}
              {saveStatus === 'error' && <AlertCircle size={14} color="#DC2626" />}
              <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                {saveStatus === 'error' ? te('errorStatus') : te('savedStatus')}
              </Text>
            </Group>
            <Button onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}>
              {te('finishEditing')}
            </Button>
          </Group>
        )}
      </Box>

      <style jsx global>{`
        .board-drawer-spin { animation: board-drawer-spin 1s linear infinite; }
        @keyframes board-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
