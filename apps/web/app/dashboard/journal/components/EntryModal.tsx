'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Modal,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Textarea,
  Stack,
  Alert,
  TextInput,
  Box,
} from '@mantine/core';
import { Edit, Trash2, Calendar, Save, X, Archive } from 'lucide-react';
import { modals } from '@mantine/modals';
import { JournalEntry } from '@/lib/api/services/journal';
import { useUpdateJournalEntry, useDeleteJournalEntry, useToggleJournalArchive } from '@/hooks/useJournal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EntryModalProps {
  entry: JournalEntry;
  opened: boolean;
  onClose: () => void;
}

export function EntryModal({ entry, opened, onClose }: EntryModalProps) {
  const t = useTranslations('journal.entryModal');
  const locale = useLocale();
  const dateFnsLocale = locale === 'pt-BR' ? ptBR : undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editContent, setEditContent] = useState(entry.content);
  const [error, setError] = useState('');

  const updateMutation = useUpdateJournalEntry();
  const deleteMutation = useDeleteJournalEntry();
  const archiveMutation = useToggleJournalArchive();

  const formattedCreatedAt = t('created', {
    date: format(new Date(entry.createdAt), 'MMMM dd, yyyy', { locale: dateFnsLocale }),
    time: format(new Date(entry.createdAt), 'HH:mm'),
  });
  const formattedUpdatedAt = t('lastUpdated', {
    date: format(new Date(entry.updatedAt), 'MMMM dd, yyyy', { locale: dateFnsLocale }),
    time: format(new Date(entry.updatedAt), 'HH:mm'),
  });
  const wasUpdated = new Date(entry.updatedAt) > new Date(entry.createdAt);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError(t('errorTitleRequired'));
      return;
    }

    if (!editContent.trim()) {
      setError(t('errorContentRequired'));
      return;
    }

    if (editTitle.length > 200) {
      setError(t('errorTitleTooLong'));
      return;
    }

    if (editContent.length > 20000) {
      setError(t('errorContentTooLong'));
      return;
    }

    try {
      setError('');
      await updateMutation.mutateAsync({
        id: entry.id,
        dto: {
          title: editTitle.trim(),
          content: editContent.trim()
        }
      });
      setIsEditing(false);
      onClose();
    } catch (error) {
      setError(t('errorUpdateFailed'));
      console.error('Error updating journal entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(entry.title || '');
    setEditContent(entry.content);
    setIsEditing(false);
    setError('');
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: t('deleteTitle'),
      children: (
        <Text size="sm">
          {t('deleteBody')}
        </Text>
      ),
      labels: { confirm: t('confirm'), cancel: t('cancelBtn') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(entry.id);
          onClose();
        } catch (error) {
          console.error('Error deleting journal entry:', error);
        }
      },
    });
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(entry.id);
      onClose();
    } catch (error) {
      console.error('Error archiving journal entry:', error);
    }
  };

  const characterCount = editContent.length;
  const isOverLimit = characterCount > 20000;
  const characterCountColor = isOverLimit ? 'red' : characterCount > 18000 ? 'orange' : 'dimmed';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group justify="space-between" w="100%" wrap="wrap">
          <Text fw={600} size="lg" lineClamp={1} style={{ flex: 1 }}>
            {entry.title || t('untitled')}
          </Text>
          {!isEditing && (
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                onClick={() => setIsEditing(true)}
                color="blue"
              >
                <Edit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                onClick={handleArchive}
                color="orange"
                loading={archiveMutation.isPending}
              >
                <Archive size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                onClick={handleDelete}
                color="red"
                loading={deleteMutation.isPending}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      }
      centered
      styles={{
        content: { display: 'flex', flexDirection: 'column', maxHeight: '85dvh', overflow: 'hidden' },
        body: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 },
      }}
    >
      {isEditing ? (
        <>
          <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <Stack gap="md">
              {/* Date info */}
              <Group gap="xs" align="center">
                <Calendar size={16} />
                <Text size="sm" c="dimmed">
                  {formattedCreatedAt}
                </Text>
                {wasUpdated && (
                  <>
                    <Badge size="sm" color="blue" variant="light">
                      {t('edited')}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {formattedUpdatedAt}
                    </Text>
                  </>
                )}
              </Group>

              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label={t('titleLabel')}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={updateMutation.isPending}
              />

              <Textarea
                label={t('contentLabel')}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                minRows={10}
                maxRows={20}
                autosize
                disabled={updateMutation.isPending}
              />
            </Stack>
          </Box>
          <Box px="md" py="sm" style={{
            borderTop: '1px solid #E2E8F0',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            flexShrink: 0,
          }}>
            <Group justify="space-between">
              <Text size="xs" c={characterCountColor}>
                {t('charCount', { count: characterCount.toLocaleString(locale) })}
              </Text>
              <Group>
                <Button
                  variant="light"
                  leftSection={<X size={16} />}
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  {t('cancel')}
                </Button>
                <Button
                  leftSection={<Save size={16} />}
                  onClick={handleSaveEdit}
                  loading={updateMutation.isPending}
                  disabled={!editTitle?.trim() || !editContent.trim() || isOverLimit}
                  color="blue"
                >
                  {t('saveChanges')}
                </Button>
              </Group>
            </Group>
          </Box>
        </>
      ) : (
        <>
          <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <Stack gap="md">
              {/* Date info */}
              <Group gap="xs" align="center">
                <Calendar size={16} />
                <Text size="sm" c="dimmed">
                  {formattedCreatedAt}
                </Text>
                {wasUpdated && (
                  <>
                    <Badge size="sm" color="blue" variant="light">
                      {t('edited')}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {formattedUpdatedAt}
                    </Text>
                  </>
                )}
              </Group>

              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                {entry.content}
              </Text>
            </Stack>
          </Box>
          <Box px="md" py="sm" style={{
            borderTop: '1px solid #E2E8F0',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            flexShrink: 0,
          }}>
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                {t('charCountPlain', { count: entry.content.length.toLocaleString(locale) })}
              </Text>
              <Button variant="light" onClick={onClose}>
                {t('close')}
              </Button>
            </Group>
          </Box>
        </>
      )}
    </Modal>
  );
}