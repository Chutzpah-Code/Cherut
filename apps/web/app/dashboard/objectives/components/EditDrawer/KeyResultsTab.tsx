'use client';

import { useTranslations } from 'next-intl';
import { Accordion, Box, Button, Text } from '@mantine/core';
import { Plus } from 'lucide-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useDeleteKeyResult } from '@/hooks/useObjectives';
import { KeyResultDraft, emptyDraft } from './types';
import { KeyResultRow } from './KeyResultRow';

interface KeyResultsTabProps {
  drafts: KeyResultDraft[];
  setDrafts: React.Dispatch<React.SetStateAction<KeyResultDraft[]>>;
  mode: 'create' | 'edit';
  objectiveId?: string;
  openedValue: string | null;
  onOpenedChange: (value: string | null) => void;
  reportSaveStart: () => void;
  reportSaveEnd: (ok: boolean) => void;
}

export function KeyResultsTab({
  drafts,
  setDrafts,
  mode,
  objectiveId,
  openedValue,
  onOpenedChange,
  reportSaveStart,
  reportSaveEnd,
}: KeyResultsTabProps) {
  const t = useTranslations('objectives');
  const deleteMutation = useDeleteKeyResult();

  const handleChange = (localId: string, patch: Partial<KeyResultDraft>) => {
    setDrafts((prev) => prev.map((d) => (d.localId === localId ? { ...d, ...patch } : d)));
  };

  const handlePersisted = (localId: string, id: string) => {
    setDrafts((prev) => prev.map((d) => (d.localId === localId ? { ...d, id } : d)));
  };

  const handleAdd = () => {
    const draft = emptyDraft();
    setDrafts((prev) => [...prev, draft]);
    onOpenedChange(draft.localId);
  };

  const removeLocally = (localId: string) => {
    setDrafts((prev) => prev.filter((d) => d.localId !== localId));
  };

  const handleRemove = (draft: KeyResultDraft) => {
    if (!draft.id || !objectiveId) {
      // Never persisted — just drop it from the local draft list.
      removeLocally(draft.localId);
      return;
    }

    modals.openConfirmModal({
      title: t('removeKeyResult'),
      children: <Text size="sm" c="dimmed">{t('removeKeyResultBody', { title: draft.title })}</Text>,
      labels: { confirm: t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync({ objectiveId, keyResultId: draft.id! });
          removeLocally(draft.localId);
        } catch (error) {
          console.error('Error removing key result:', error);
          notifications.show({ title: t('notifications.error'), message: t('notifications.krUpdateFailed'), color: 'red' });
        }
      },
    });
  };

  return (
    <Box>
      <Accordion
        value={openedValue}
        onChange={onOpenedChange}
        variant="separated"
      >
        {drafts.map((draft, index) => (
          <KeyResultRow
            key={draft.localId}
            draft={draft}
            index={index}
            mode={mode}
            objectiveId={objectiveId}
            onChange={handleChange}
            onPersisted={handlePersisted}
            onRemove={handleRemove}
            reportSaveStart={reportSaveStart}
            reportSaveEnd={reportSaveEnd}
          />
        ))}
      </Accordion>

      <Button
        variant="outline"
        fullWidth
        mt="md"
        radius={8}
        leftSection={<Plus size={16} />}
        onClick={handleAdd}
        style={{ borderStyle: 'dashed' }}
      >
        {t('addKeyResult')}
      </Button>
    </Box>
  );
}
