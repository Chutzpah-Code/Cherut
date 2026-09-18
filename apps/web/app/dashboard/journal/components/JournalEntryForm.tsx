'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Textarea, Button, Group, Paper, Text, Alert, Stack, TextInput } from '@mantine/core';
import { useCreateJournalEntry } from '@/hooks/useJournal';

interface JournalEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JournalEntryForm({ onSuccess, onCancel, isLoading }: JournalEntryFormProps) {
  const t = useTranslations('journal.entryForm');
  const locale = useLocale();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateJournalEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t('errorTitleRequired'));
      return;
    }

    if (!content.trim()) {
      setError(t('errorContentRequired'));
      return;
    }

    if (title.length > 200) {
      setError(t('errorTitleTooLong'));
      return;
    }

    if (content.length > 20000) {
      setError(t('errorContentTooLong'));
      return;
    }

    try {
      setError('');
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim()
      });
      setTitle('');
      setContent('');
      onSuccess();
    } catch (error) {
      setError(t('errorSaveFailed'));
      console.error('Error creating journal entry:', error);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 20000;
  const characterCountColor = isOverLimit ? 'red' : characterCount > 18000 ? 'orange' : 'dimmed';

  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text fw={600} size="lg">
            {t('newEntry')}
          </Text>

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading || createMutation.isPending}
          />

          <Textarea
            label={t('contentLabel')}
            placeholder={t('contentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minRows={8}
            maxRows={15}
            autosize
            required
            disabled={isLoading || createMutation.isPending}
          />

          <Stack gap="sm">
            <Text size="sm" c={characterCountColor} ta="center">
              {t('charCount', { count: characterCount.toLocaleString(locale) })}
            </Text>

            <Group gap="sm" grow justify="flex-end">
              <Button
                variant="light"
                onClick={onCancel}
                disabled={isLoading || createMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                loading={isLoading || createMutation.isPending}
                disabled={!title.trim() || !content.trim() || isOverLimit}
                color="blue"
              >
                {t('saveEntry')}
              </Button>
            </Group>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}