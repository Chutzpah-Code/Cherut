'use client';

import React, { useState } from 'react';
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
  ScrollArea,
  TextInput,
} from '@mantine/core';
import { Edit, Trash2, Calendar, Save, X } from 'lucide-react';
import { modals } from '@mantine/modals';
import { JournalEntry } from '@/lib/api/services/journal';
import { useUpdateJournalEntry, useDeleteJournalEntry } from '@/hooks/useJournal';
import { format } from 'date-fns';

interface EntryModalProps {
  entry: JournalEntry;
  opened: boolean;
  onClose: () => void;
}

export function EntryModal({ entry, opened, onClose }: EntryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editContent, setEditContent] = useState(entry.content);
  const [error, setError] = useState('');

  const updateMutation = useUpdateJournalEntry();
  const deleteMutation = useDeleteJournalEntry();

  const formattedCreatedAt = format(new Date(entry.createdAt), 'MMMM dd, yyyy \'at\' HH:mm');
  const formattedUpdatedAt = format(new Date(entry.updatedAt), 'MMMM dd, yyyy \'at\' HH:mm');
  const wasUpdated = new Date(entry.updatedAt) > new Date(entry.createdAt);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    if (!editContent.trim()) {
      setError('Content cannot be empty.');
      return;
    }

    if (editTitle.length > 200) {
      setError('Title is too long. Maximum 200 characters allowed.');
      return;
    }

    if (editContent.length > 20000) {
      setError('Content is too long. Maximum 20,000 characters allowed.');
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
      setError('Failed to update entry. Please try again.');
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
      title: 'Delete Journal Entry',
      children: (
        <Text size="sm">
          Are you sure you want to delete this journal entry? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
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

  const characterCount = editContent.length;
  const isOverLimit = characterCount > 20000;
  const characterCountColor = isOverLimit ? 'red' : characterCount > 18000 ? 'orange' : 'dimmed';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={{ base: 'full', sm: 'xl' }}
      fullScreen={{ base: true, sm: false }}
      title={
        <Group justify="space-between" w="100%" wrap="wrap">
          <Text fw={600} size={{ base: 'md', sm: 'lg' }} lineClamp={1} style={{ flex: 1 }}>
            {entry.title || 'Untitled Entry'}
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
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Date info */}
        <Group gap="xs" align="center">
          <Calendar size={16} />
          <Text size="sm" c="dimmed">
            Created {formattedCreatedAt}
          </Text>
          {wasUpdated && (
            <>
              <Badge size="sm" color="blue" variant="light">
                Edited
              </Badge>
              <Text size="sm" c="dimmed">
                Last updated {formattedUpdatedAt}
              </Text>
            </>
          )}
        </Group>

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Content */}
        {isEditing ? (
          <Stack gap="md">
            <TextInput
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={updateMutation.isPending}
            />

            <Textarea
              label="Content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              minRows={10}
              maxRows={20}
              autosize
              disabled={updateMutation.isPending}
            />

            <Group justify="space-between" align="center">
              <Text size="sm" c={characterCountColor}>
                {characterCount.toLocaleString()} / 20,000 characters
              </Text>

              <Group>
                <Button
                  variant="light"
                  leftSection={<X size={16} />}
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  leftSection={<Save size={16} />}
                  onClick={handleSaveEdit}
                  loading={updateMutation.isPending}
                  disabled={!editTitle?.trim() || !editContent.trim() || isOverLimit}
                  color="blue"
                >
                  Save Changes
                </Button>
              </Group>
            </Group>
          </Stack>
        ) : (
          <ScrollArea.Autosize mah={400}>
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {entry.content}
            </Text>
          </ScrollArea.Autosize>
        )}

        {/* Footer */}
        {!isEditing && (
          <Group justify="space-between" align="center" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Text size="xs" c="dimmed">
              {entry.content.length.toLocaleString()} characters
            </Text>
            <Button variant="light" onClick={onClose}>
              Close
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}