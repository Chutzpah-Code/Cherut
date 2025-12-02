'use client';

import React, { useState } from 'react';
import { Textarea, Button, Group, Paper, Text, Alert, Stack, TextInput } from '@mantine/core';
import { useCreateJournalEntry } from '@/hooks/useJournal';

interface JournalEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JournalEntryForm({ onSuccess, onCancel, isLoading }: JournalEntryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateJournalEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title for your entry.');
      return;
    }

    if (!content.trim()) {
      setError('Please write something before saving.');
      return;
    }

    if (title.length > 200) {
      setError('Title is too long. Maximum 200 characters allowed.');
      return;
    }

    if (content.length > 20000) {
      setError('Entry is too long. Maximum 20,000 characters allowed.');
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
      setError('Failed to save entry. Please try again.');
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
            New Journal Entry
          </Text>

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Title"
            placeholder="Enter a title for your journal entry..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading || createMutation.isPending}
          />

          <Textarea
            label="Content"
            placeholder="Write your thoughts here... What's on your mind today?"
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
              {characterCount.toLocaleString()} / 20,000 characters
            </Text>

            <Group gap="sm" grow justify="flex-end">
              <Button
                variant="light"
                onClick={onCancel}
                disabled={isLoading || createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading || createMutation.isPending}
                disabled={!title.trim() || !content.trim() || isOverLimit}
                color="blue"
              >
                Save Entry
              </Button>
            </Group>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}