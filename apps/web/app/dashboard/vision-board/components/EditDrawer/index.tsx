'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, Avatar, Button, Tabs } from '@mantine/core';
import { X, Play, Check, Loader2, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { useUpdateVisionBoardItem, useCreateVisionBoardItem, useUploadImage } from '@/hooks/useVisionBoard';
import { useDebounce } from '@/hooks/useDebounce';
import { countFilledVisualizationFields, VISUALIZATION_PROGRESS_TOTAL } from '@/lib/vision-board/visualization-fields';
import { EditDrawerFormState, toFormState, toDto, toCreateDto } from './types';
import { MetaTab } from './MetaTab';
import { VisualizationTab } from './VisualizationTab';

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  item: VisionBoardItem | null;
  initialTab?: 'meta' | 'visualization';
  onDelete: (id: string) => void;
  onVisualizeNow: (item: VisionBoardItem) => void;
  onCreated: (item: VisionBoardItem) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({ opened, onClose, item, initialTab = 'meta', onDelete, onVisualizeNow, onCreated }: EditDrawerProps) {
  const t = useTranslations('visionBoard.editDrawer');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const updateMutation = useUpdateVisionBoardItem();
  const createMutation = useCreateVisionBoardItem();
  const uploadImageMutation = useUploadImage();

  const mode: 'create' | 'edit' = item ? 'edit' : 'create';

  const [tab, setTab] = useState<'meta' | 'visualization'>(initialTab);
  const [formState, setFormState] = useState<EditDrawerFormState>(() => toFormState(item));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showErrors, setShowErrors] = useState(false);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  // Re-hydrate the form whenever the panel is opened for a (possibly new) item.
  useEffect(() => {
    if (!opened) return;
    setFormState(toFormState(item));
    setTab(initialTab);
    mountedRef.current = false;
    dirtyRef.current = false;
    setSaveStatus('idle');
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, item?.id]);

  // Mark dirty on genuine user edits only (skip the hydration update above).
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
    if (mode !== 'edit' || !item || !dirtyRef.current) return;
    dirtyRef.current = false;
    updateMutation.mutate(
      { id: item.id, dto: toDto(debouncedFormState) },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const setField: <K extends keyof EditDrawerFormState>(key: K, value: EditDrawerFormState[K]) => void = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const requiredFieldsFilled = !!formState.title.trim() && !!formState.imageUrl;

  const handleCreate = async () => {
    if (!requiredFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync(toCreateDto(formState));
      notifications.show({ title: t('createSuccessTitle'), message: t('createSuccessMessage'), color: 'green' });
      onCreated(created);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || t('createFailed');
      notifications.show({ title: t('createErrorTitle'), message, color: 'red' });
    }
  };

  const filledCount = countFilledVisualizationFields(formState);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? '100%' : 460}
      withOverlay={!!isMobile}
      withCloseButton={false}
      padding={0}
      styles={{
        content: {
          maxWidth: '100vw',
          height: isMobile ? '100dvh' : undefined,
          display: 'flex',
          flexDirection: 'column',
        },
        body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box px="md" py="sm" style={{ borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap" mb="xs">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar src={formState.imageUrl} radius={8} size={40} />
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? t('visualizationLabel') : t('newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>{formState.title || t('titlePlaceholder')}</Text>
            </Box>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose} aria-label={t('close')}>
            <X size={18} />
          </ActionIcon>
        </Group>

        <Tabs value={tab} onChange={(v) => setTab((v as 'meta' | 'visualization') || 'meta')}>
          <Tabs.List grow>
            <Tabs.Tab value="meta">{t('metaTabLabel')}</Tabs.Tab>
            <Tabs.Tab value="visualization">{t('visualizationTabLabel', { current: filledCount, total: VISUALIZATION_PROGRESS_TOTAL })}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'meta' ? (
          <MetaTab
            formState={formState}
            setField={setField}
            onUploadImage={(file) => uploadImageMutation.mutateAsync(file)}
            onDelete={mode === 'edit' && item ? () => onDelete(item.id) : undefined}
            showErrors={showErrors}
          />
        ) : (
          <VisualizationTab formState={formState} setField={setField} />
        )}
      </Box>

      <Box
        px="md"
        py="sm"
        style={{
          borderTop: '1px solid #E5E7EB',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          flexShrink: 0,
        }}
      >
        {mode === 'create' ? (
          <Box>
            {!requiredFieldsFilled && (
              <Text size="xs" c="dimmed" mb={6}>{t('fillTitleAndImageHint')}</Text>
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
                {t('createButton')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="spin" />}
              {saveStatus === 'saved' && <Check size={14} color="#16A34A" />}
              {saveStatus === 'error' && <AlertCircle size={14} color="#DC2626" />}
              <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                {saveStatus === 'error' ? t('errorStatus') : t('savedStatus')}
              </Text>
            </Group>
            <Button
              leftSection={<Play size={14} />}
              onClick={() => item && onVisualizeNow(item)}
              radius={8}
              style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}
            >
              {t('visualizeNowButton')}
            </Button>
          </Group>
        )}
      </Box>

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
