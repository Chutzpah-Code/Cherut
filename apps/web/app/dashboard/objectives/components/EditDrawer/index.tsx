'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@mantine/hooks';
import { Drawer, Group, Box, Text, ActionIcon, ThemeIcon, Button, Tabs, Indicator } from '@mantine/core';
import { X, Target, Check, Loader2, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { Objective } from '@/lib/api/services/objectives';
import { useUpdateObjective, useCreateObjective } from '@/hooks/useObjectives';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ObjectiveFormState,
  toObjectiveFormState,
  toObjectiveDto,
  KeyResultDraft,
  emptyDraft,
  toDraft,
  isDraftFilled,
} from './types';
import { ObjectiveTab } from './ObjectiveTab';
import { KeyResultsTab } from './KeyResultsTab';

interface LifeAreaOption {
  id: string;
  name: string;
}

interface EditDrawerProps {
  opened: boolean;
  onClose: () => void;
  objective: Objective | null;
  lifeAreas: LifeAreaOption[];
  initialTab?: 'objective' | 'keyResults';
  initialExpandedKrId?: string;
  onCreated: (objective: Objective) => void;
}

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

export function EditDrawer({
  opened,
  onClose,
  objective,
  lifeAreas,
  initialTab = 'objective',
  initialExpandedKrId,
  onCreated,
}: EditDrawerProps) {
  const t = useTranslations('objectives');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isFullScreen = useMediaQuery('(max-width: 639px)');

  const updateMutation = useUpdateObjective();
  const createMutation = useCreateObjective();

  const mode: 'create' | 'edit' = objective ? 'edit' : 'create';

  const [tab, setTab] = useState<'objective' | 'keyResults'>(initialTab);
  const [formState, setFormState] = useState<ObjectiveFormState>(() => toObjectiveFormState(objective));
  const [drafts, setDrafts] = useState<KeyResultDraft[]>([]);
  const [openedKrValue, setOpenedKrValue] = useState<string | null>(initialExpandedKrId ?? null);
  const [showErrors, setShowErrors] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pendingCountRef = useRef(0);

  const mountedRef = useRef(false);
  const dirtyRef = useRef(false);

  // (Re)hydrate whenever the panel opens, or when a create just turned into an edit.
  useEffect(() => {
    if (!opened) return;
    setFormState(toObjectiveFormState(objective));
    setTab(initialTab);
    setOpenedKrValue(initialExpandedKrId ?? null);
    setShowErrors(false);
    setSaveStatus('idle');
    pendingCountRef.current = 0;
    mountedRef.current = false;
    dirtyRef.current = false;

    if (objective) {
      const seeded = (objective.keyResults || []).map(toDraft);
      setDrafts(seeded.length > 0 ? seeded : []);
    } else {
      setDrafts([emptyDraft()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, objective?.id]);

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
    if (mode !== 'edit' || !objective || !dirtyRef.current) return;
    dirtyRef.current = false;
    reportSaveStart();
    updateMutation.mutate(
      { id: objective.id, dto: toObjectiveDto(debouncedFormState) },
      {
        onSuccess: () => reportSaveEnd(true),
        onError: () => reportSaveEnd(false),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormState]);

  const reportSaveStart = useCallback(() => {
    pendingCountRef.current += 1;
    setSaveStatus('pending');
  }, []);

  const reportSaveEnd = useCallback((ok: boolean) => {
    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
    if (!ok) {
      setSaveStatus('error');
      return;
    }
    setSaveStatus(pendingCountRef.current === 0 ? 'saved' : 'pending');
  }, []);

  const setField: <K extends keyof ObjectiveFormState>(key: K, value: ObjectiveFormState[K]) => void = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const requiredObjectiveFieldsFilled = !!formState.title.trim() && !!formState.lifeAreaId && !!formState.startDate && !!formState.endDate;

  const handleCreate = async () => {
    if (!requiredObjectiveFieldsFilled) {
      setShowErrors(true);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        lifeAreaId: formState.lifeAreaId,
        startDate: formState.startDate!.toISOString().split('T')[0],
        endDate: formState.endDate!.toISOString().split('T')[0],
        keyResults: drafts
          .filter(isDraftFilled)
          .map((d) => ({
            title: d.title.trim(),
            description: d.description.trim() || undefined,
            targetValue: d.targetValue,
            currentValue: d.currentValue,
            unit: d.unit.trim(),
          })),
      });
      notifications.show({ title: t('notifications.success'), message: t('notifications.objectiveCreated'), color: 'green' });
      onCreated(created);
    } catch (error: any) {
      console.error('Error creating objective:', error);
      const message = error?.response?.data?.message || error?.message || t('notifications.saveFailed');
      notifications.show({ title: t('notifications.error'), message, color: 'red' });
    }
  };

  const keyResultsCount = mode === 'edit' ? (objective?.keyResults?.length ?? 0) : drafts.filter(isDraftFilled).length;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isFullScreen ? '100%' : 500}
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
        <Group justify="space-between" wrap="nowrap" mb="xs">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon size={40} radius={8} variant="light" color="blue">
              <Target size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                {mode === 'edit' ? t('editDrawer.editLabel') : t('editDrawer.newLabel')}
              </Text>
              <Text size="sm" fw={600} truncate>
                {formState.title || t('titlePlaceholder')}
              </Text>
            </Box>
          </Group>
          <ActionIcon size={44} variant="subtle" onClick={onClose} aria-label={t('editDrawer.close')}>
            <X size={20} />
          </ActionIcon>
        </Group>

        <Tabs value={tab} onChange={(v) => setTab((v as 'objective' | 'keyResults') || 'objective')}>
          <Tabs.List grow>
            <Tabs.Tab value="objective">
              {showErrors && !requiredObjectiveFieldsFilled ? (
                <Indicator color="red" size={8} offset={-2}>
                  <span>{t('editDrawer.objectiveTabLabel')}</span>
                </Indicator>
              ) : (
                t('editDrawer.objectiveTabLabel')
              )}
            </Tabs.Tab>
            <Tabs.Tab value="keyResults">{t('editDrawer.keyResultsTabLabel', { count: keyResultsCount })}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      <Box px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'objective' ? (
          <ObjectiveTab
            formState={formState}
            setField={setField}
            lifeAreas={lifeAreas}
            objective={objective}
            keyResultsCount={keyResultsCount}
            showErrors={showErrors}
            onGoToKeyResults={() => setTab('keyResults')}
          />
        ) : (
          <KeyResultsTab
            drafts={drafts}
            setDrafts={setDrafts}
            mode={mode}
            objectiveId={objective?.id}
            openedValue={openedKrValue}
            onOpenedChange={setOpenedKrValue}
            reportSaveStart={reportSaveStart}
            reportSaveEnd={reportSaveEnd}
          />
        )}
      </Box>

      <Box
        px="md"
        py="sm"
        style={{ borderTop: '1px solid #E5E7EB', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}
      >
        {mode === 'create' ? (
          <Box>
            {!requiredObjectiveFieldsFilled && (
              <Text size="xs" c="dimmed" mb={6}>{t('editDrawer.fillTitleAndDatesHint')}</Text>
            )}
            <Group justify="space-between" wrap="nowrap">
              <Button variant="outline" onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap' }}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                disabled={!requiredObjectiveFieldsFilled}
                radius={8}
                style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}
              >
                {t('createObjectiveBtn')}
              </Button>
            </Group>
          </Box>
        ) : (
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              {saveStatus === 'pending' && <Loader2 size={14} className="obj-drawer-spin" />}
              {saveStatus === 'saved' && <Check size={14} color="#16A34A" />}
              {saveStatus === 'error' && <AlertCircle size={14} color="#DC2626" />}
              <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                {saveStatus === 'error' ? t('editDrawer.errorStatus') : t('editDrawer.savedStatus')}
              </Text>
            </Group>
            <Button onClick={onClose} radius={8} style={{ whiteSpace: 'nowrap', background: '#4686FE', border: 'none' }}>
              {t('editDrawer.finishEditing')}
            </Button>
          </Group>
        )}
      </Box>

      <style jsx global>{`
        .obj-drawer-spin { animation: obj-drawer-spin 1s linear infinite; }
        @keyframes obj-drawer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Drawer>
  );
}
