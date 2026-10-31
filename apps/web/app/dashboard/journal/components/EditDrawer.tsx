'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, ThemeIcon, Button, TextInput, Textarea, Stack, Badge } from '@mantine/core';
import { X, BookOpen, Check, Loader2, AlertCircle, Archive, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateJournalEntry, useUpdateJournalEntry, useToggleJournalArchive } from '@/hooks/useJournal';
import { JournalEntry } from '@/lib/api/services/journal';

interface FormState {
  title: string;
  content: string;
}

function toFormState(entry: JournalEntry | null): FormState {
  return { title: entry?.title ?? '', content: entry?.content ?? '' };
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onDelete: (id: string) => void;
  onCreated: (entry: JournalEntry) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({ opened, onClose, entry, onDelete, onCreated }: EditDrawerProps) {
  const t = useTranslations('journal.entryModal');
  const tf = useTranslations('journal.entryForm');
  const te = useTranslations('journal.editDrawer');
  const locale = useLocale();
  const dateFnsLocale = locale === 'pt-BR' ? ptBR : undefined;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();
  const archiveMutation = useToggleJournalArchive();

  const mode: 'create' | 'edit' = entry ? 'edit' : 'create';

  const [formState, setFormState] = useState<FormState>(() => toFormState(entry));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(entry));
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, entry?.id]);

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
    if (mode !== 'edit' || !entry || !dirtyRef.current) return;
    if (!debouncedFormState.title.trim() || !debouncedFormState.content.trim()) return; // wait for both to be non-empty
    dirtyRef.current = false;
    setSaveStatus('pending');
    updateMutation.mutate(
      { id: entry.id, dto: { title: debouncedFormState.title.trim(), content: debouncedFormState.content.trim() } },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const requiredFieldsFilled = !!formState.title.trim() && !!formState.content.trim();
  const characterCount = formState.content.length;
  const isOverLimit = characterCount > 20000;
  const characterCountColor = isOverLimit ? 'red' : characterCount > 18000 ? 'orange' : 'dimmed';

  const handleCreate = async () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        title: formState.title.trim(),
        content: formState.content.trim(),
      });
      onCreated(created);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || te('createFailed');
      // eslint-disable-next-line no-console
      console.error('Error creating journal entry:', message);
    }
  };

  const formattedCreatedAt = entry
    ? t('created', {
        date: format(new Date(entry.createdAt), 'MMMM dd, yyyy', { locale: dateFnsLocale }),
        time: format(new Date(entry.createdAt), 'HH:mm'),
      })
    : null;
  const wasUpdated = entry ? new Date(entry.updatedAt) > new Date(entry.createdAt) : false;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 520}
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
            <ThemeIcon size={40} radius={8} variant="light" color="blue">
              <BookOpen size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? te('editLabel') : te('newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>{formState.title || t('untitled')}</Text>
            </Box>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={te('close')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="md">
          {entry && (
            <Group gap="xs" align="center">
              <Calendar size={16} />
              <Text size="sm" c="dimmed">{formattedCreatedAt}</Text>
              {wasUpdated && <Badge size="sm" color="blue" variant="light">{t('edited')}</Badge>}
            </Group>
          )}

          <TextInput
            label={mode === 'edit' ? t('titleLabel') : tf('titleLabel')}
            placeholder={tf('titlePlaceholder')}
            value={formState.title}
            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
            required
            withAsterisk
            maxLength={200}
            error={showErrors && !formState.title.trim() ? te('fieldRequired') : undefined}
            radius={8}
          />

          <Textarea
            label={mode === 'edit' ? t('contentLabel') : tf('contentLabel')}
            placeholder={tf('contentPlaceholder')}
            value={formState.content}
            onChange={(e) => setFormState((prev) => ({ ...prev, content: e.target.value }))}
            required
            minRows={10}
            maxRows={24}
            autosize
            maxLength={20000}
            error={showErrors && !formState.content.trim() ? te('fieldRequired') : undefined}
            radius={8}
          />

          <Text size="xs" c={characterCountColor} ta="right">
            {t('charCount', { count: characterCount.toLocaleString(locale) })}
          </Text>

          {entry && (
            <Group grow>
              <Button
                variant="outline"
                leftSection={<Archive size={16} />}
                onClick={() => archiveMutation.mutate(entry.id)}
                loading={archiveMutation.isPending}
                radius={8}
                style={{ whiteSpace: 'nowrap' }}
              >
                {te('archiveEntry')}
              </Button>
              <Button
                variant="outline"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() => onDelete(entry.id)}
                radius={8}
                style={{ whiteSpace: 'nowrap' }}
              >
                {te('deleteEntry')}
              </Button>
            </Group>
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
              <Text size="xs" c="dimmed" mb={6}>{te('fillRequiredHint')}</Text>
            )}
            <Group justify="space-between" wrap="nowrap">
              <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
                {tf('cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                disabled={!requiredFieldsFilled || isOverLimit}
                radius={8}
                style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}
              >
                {tf('saveEntry')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="journal-drawer-spin" />}
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
        .journal-drawer-spin { animation: journal-drawer-spin 1s linear infinite; }
        @keyframes journal-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
