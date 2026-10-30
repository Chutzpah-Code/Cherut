'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, Button, TextInput, Textarea, Stack } from '@mantine/core';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateValue, useUpdateValue } from '@/hooks/useValues';
import { Value } from '@/lib/api/services/values';

interface FormState {
  title: string;
  shortDescription: string;
  behaviors: string;
}

function toFormState(value: Value | null): FormState {
  return {
    title: value?.title ?? '',
    shortDescription: value?.shortDescription ?? '',
    behaviors: value?.behaviors ?? '',
  };
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  value: Value | null;
  onCreated: (value: Value) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({ opened, onClose, value, onCreated }: EditDrawerProps) {
  const t = useTranslations('values');
  const te = useTranslations('values.editDrawer');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const createMutation = useCreateValue();
  const updateMutation = useUpdateValue();

  const mode: 'create' | 'edit' = value ? 'edit' : 'create';

  const [formState, setFormState] = useState<FormState>(() => toFormState(value));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(value));
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, value?.id]);

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
    if (mode !== 'edit' || !value || !dirtyRef.current) return;
    dirtyRef.current = false;
    setSaveStatus('pending');
    updateMutation.mutate(
      {
        id: value.id,
        dto: {
          title: debouncedFormState.title,
          shortDescription: debouncedFormState.shortDescription || undefined,
          behaviors: debouncedFormState.behaviors || undefined,
        },
      },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const requiredFieldsFilled = !!formState.title.trim();

  const handleCreate = async () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        title: formState.title.trim(),
        shortDescription: formState.shortDescription.trim() || undefined,
        behaviors: formState.behaviors.trim() || undefined,
      });
      notifications.show({ title: t('valueCreatedTitle'), message: t('valueCreatedMessage'), color: 'green' });
      onCreated(created);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || t('saveFailed');
      notifications.show({ title: t('error'), message, color: 'red' });
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 460}
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
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? te('editLabel') : te('newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>{formState.title || t('titlePlaceholder')}</Text>
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
            label={t('titleLabel')}
            placeholder={t('titlePlaceholder')}
            value={formState.title}
            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
            required
            withAsterisk
            error={showErrors && !formState.title.trim() ? te('fieldRequired') : undefined}
            radius={8}
          />
          <TextInput
            label={t('shortDescription')}
            placeholder={t('shortDescriptionPlaceholder')}
            value={formState.shortDescription}
            onChange={(e) => setFormState((prev) => ({ ...prev, shortDescription: e.target.value }))}
            radius={8}
          />
          <Textarea
            label={t('reinforcingBehaviors')}
            placeholder={t('behaviorsPlaceholder')}
            value={formState.behaviors}
            onChange={(e) => setFormState((prev) => ({ ...prev, behaviors: e.target.value }))}
            autosize
            minRows={4}
            maxRows={8}
            radius={8}
          />
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
              <Text size="xs" c="dimmed" mb={6}>{te('fillTitleHint')}</Text>
            )}
            <Group justify="space-between" wrap="nowrap">
              <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                disabled={!requiredFieldsFilled}
                radius={8}
                style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}
              >
                {t('create')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="value-drawer-spin" />}
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
        .value-drawer-spin { animation: value-drawer-spin 1s linear infinite; }
        @keyframes value-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
