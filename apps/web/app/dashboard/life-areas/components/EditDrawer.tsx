'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, ThemeIcon, Button, TextInput, Textarea, Stack } from '@mantine/core';
import { X, TrendingUp, Check, Loader2, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateLifeArea, useUpdateLifeArea } from '@/hooks/useLifeAreas';
import { LifeArea } from '@/lib/api/services/lifeAreas';
import { getLifeAreaDisplayName, getLifeAreaDisplayDescription } from '@/lib/life-areas/display';

interface FormState {
  name: string;
  description: string;
}

type PresetsTranslator = (key: string) => string;

function toFormState(area: LifeArea | null, tPresets: PresetsTranslator): FormState {
  return {
    name: area ? getLifeAreaDisplayName(area, tPresets) : '',
    description: area ? (getLifeAreaDisplayDescription(area, tPresets) ?? '') : '',
  };
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  area: LifeArea | null;
  onCreated: (area: LifeArea) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({ opened, onClose, area, onCreated }: EditDrawerProps) {
  const t = useTranslations('lifeAreas');
  const te = useTranslations('lifeAreas.editDrawer');
  const tPresets = useTranslations('lifeAreas.presets');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const createMutation = useCreateLifeArea();
  const updateMutation = useUpdateLifeArea();

  const mode: 'create' | 'edit' = area ? 'edit' : 'create';

  const [formState, setFormState] = useState<FormState>(() => toFormState(area, tPresets));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(area, tPresets));
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, area?.id]);

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
    if (mode !== 'edit' || !area || !dirtyRef.current) return;
    dirtyRef.current = false;
    setSaveStatus('pending');
    // Preset life areas can only be renamed — their description is always
    // derived from the translation, and the backend rejects any other field.
    const dto = area.isSystemPreset
      ? { name: debouncedFormState.name }
      : { name: debouncedFormState.name, description: debouncedFormState.description || undefined };
    updateMutation.mutate(
      { id: area.id, dto },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const requiredFieldsFilled = !!formState.name.trim();

  const handleCreate = async () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
      });
      onCreated(created);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || te('createFailed');
      notifications.show({ title: te('createErrorTitle'), message, color: 'red' });
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
            <ThemeIcon size={40} radius={8} variant="light" color="blue">
              <TrendingUp size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? te('editLabel') : te('newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>{formState.name || t('namePlaceholder')}</Text>
            </Box>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={te('close')}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="md">
          {area?.isSystemPreset && (
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
              {te('systemReadOnlyHint')}
            </Text>
          )}
          <TextInput
            label={t('nameLabel')}
            placeholder={t('namePlaceholder')}
            value={formState.name}
            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
            required
            withAsterisk
            error={showErrors && !formState.name.trim() ? te('fieldRequired') : undefined}
            radius={8}
          />
          <Textarea
            label={t('description')}
            placeholder={t('descriptionPlaceholder')}
            value={formState.description}
            onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
            readOnly={area?.isSystemPreset}
            disabled={area?.isSystemPreset}
            rows={4}
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
              <Text size="xs" c="dimmed" mb={6}>{te('fillNameHint')}</Text>
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
              {saveStatus === 'pending' && <Loader2 size={14} className="life-area-drawer-spin" />}
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
        .life-area-drawer-spin { animation: life-area-drawer-spin 1s linear infinite; }
        @keyframes life-area-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
