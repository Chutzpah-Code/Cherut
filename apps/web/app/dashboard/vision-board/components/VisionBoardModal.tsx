'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Image,
  Box,
  Text,
  FileButton,
  Loader,
  Alert,
  Checkbox,
  Select,
  SegmentedControl,
  Divider,
  Slider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Trash2, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { imageValidation } from '@/lib/api/services/vision-board';
import { useObjectives } from '@/hooks/useObjectives';
import { VisionBoardStateView } from './VisionBoardStateView';

const FEELING_OPTIONS = [
  'calm', 'confidence', 'courage', 'clarity', 'gratitude',
  'motivation', 'security', 'freedom', 'focus', 'joy',
] as const;

interface VisionBoardModalProps {
  opened: boolean;
  onClose: () => void;
  item: VisionBoardItem | null;
  onSave: (id: string, updates: {
    title: string;
    description?: string;
    fullDescription?: string;
    dueDate?: string;
    imageUrl?: string;
    completed?: boolean;
    objectiveId?: string;
    plannedPracticeDurationMinutes?: 5 | 10 | 15;
    currentEmotion?: string;
    currentEnergy?: number;
    currentConfidence?: number;
    desiredState?: string;
    empoweringBelief?: string;
    outcomeVisualizationText?: string;
    processVisualizationText?: string;
    likelyObstacle?: string;
    obstacleResponse?: string;
    nextAction?: string;
    nextActionDueDate?: string;
  }) => Promise<void>;
  onDelete: (id: string) => void;
  onUploadImage: (file: File) => Promise<{ imageUrl: string }>;
  isSaving: boolean;
}

export function VisionBoardModal({
  opened,
  onClose,
  item,
  onSave,
  onDelete,
  onUploadImage,
  isSaving,
}: VisionBoardModalProps) {
  const t = useTranslations('visionBoard.editModal');
  const { data: objectives } = useObjectives(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [dueDateValue, setDueDateValue] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Visualization practice ("Visualizar e agir") — state / belief /
  // outcome+process / obstacle+response / action
  const [objectiveId, setObjectiveId] = useState<string | undefined>(undefined);
  const [plannedPracticeDurationMinutes, setPlannedPracticeDurationMinutes] = useState<5 | 10 | 15>(10);
  const [currentEmotion, setCurrentEmotion] = useState<string | undefined>(undefined);
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [currentConfidence, setCurrentConfidence] = useState(5);
  const [desiredState, setDesiredState] = useState('');
  const [empoweringBelief, setEmpoweringBelief] = useState('');
  const [outcomeVisualizationText, setOutcomeVisualizationText] = useState('');
  const [processVisualizationText, setProcessVisualizationText] = useState('');
  const [likelyObstacle, setLikelyObstacle] = useState('');
  const [obstacleResponse, setObstacleResponse] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDueDateValue, setNextActionDueDateValue] = useState<Date | null>(null);
  const [stateViewOpen, setStateViewOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setFullDescription(item.fullDescription || '');
      setNewImageUrl(null);
      setUploadError(null);
      setSaveError(null);
      setCompleted(!!item.completed);

      if (item.dueDate) {
        setDueDateValue(new Date(item.dueDate + 'T00:00:00'));
      } else {
        setDueDateValue(null);
      }

      setObjectiveId(item.objectiveId);
      setPlannedPracticeDurationMinutes(item.plannedPracticeDurationMinutes ?? 10);
      setCurrentEmotion(item.currentEmotion);
      setCurrentEnergy(item.currentEnergy ?? 5);
      setCurrentConfidence(item.currentConfidence ?? 5);
      setDesiredState(item.desiredState || '');
      setEmpoweringBelief(item.empoweringBelief || '');
      setOutcomeVisualizationText(item.outcomeVisualizationText || '');
      setProcessVisualizationText(item.processVisualizationText || '');
      setLikelyObstacle(item.likelyObstacle || '');
      setObstacleResponse(item.obstacleResponse || '');
      setNextAction(item.nextAction || '');
      setNextActionDueDateValue(item.nextActionDueDate ? new Date(item.nextActionDueDate + 'T00:00:00') : null);
    }
  }, [item]);

  if (!item) return null;

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);

    // Validar arquivo
    const validation = imageValidation.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || t('invalidFile'));
      return;
    }

    setIsUploadingImage(true);

    try {
      const { imageUrl } = await onUploadImage(file);
      setNewImageUrl(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(t('uploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);

    try {
      await onSave(item.id, {
        title,
        description: description.trim() || undefined,
        fullDescription: fullDescription.trim() || undefined,
        dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
        imageUrl: newImageUrl || undefined,
        completed,
        objectiveId: objectiveId || undefined,
        plannedPracticeDurationMinutes,
        currentEmotion: currentEmotion || undefined,
        currentEnergy,
        currentConfidence,
        desiredState: desiredState.trim() || undefined,
        empoweringBelief: empoweringBelief.trim() || undefined,
        outcomeVisualizationText: outcomeVisualizationText.trim() || undefined,
        processVisualizationText: processVisualizationText.trim() || undefined,
        likelyObstacle: likelyObstacle.trim() || undefined,
        obstacleResponse: obstacleResponse.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        nextActionDueDate: nextActionDueDateValue ? nextActionDueDateValue.toISOString().split('T')[0] : undefined,
      });
    } catch (error: any) {
      let errorMessage = t('saveFailed');

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSaveError(errorMessage);
    }
  };

  const currentImageUrl = newImageUrl || item.imageUrl;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            {t('title')}
          </Text>
        }
        size="xl"
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85dvh',
            overflow: 'hidden',
          },
          body: {
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
          },
        }}
      >
        <Box px="md" py="xs" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <Stack gap="lg">
        {/* Imagem Preview */}
        <Box>
          <Text
            mb="xs"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            {t('image')}
          </Text>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#F5F5F5',
              border: '1px solid #CCCCCC',
            }}
          >
            <Image
              src={currentImageUrl}
              alt={title}
              fit="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>

          {/* Upload novo */}
          <FileButton
            onChange={handleImageChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={isUploadingImage}
          >
            {(props) => (
              <Button
                {...props}
                variant="outline"
                leftSection={isUploadingImage ? <Loader size={16} color="#4686FE" /> : <Upload size={16} />}
                fullWidth
                mt="sm"
                disabled={isUploadingImage}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#CCCCCC',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      color: '#4686FE',
                    },
                  },
                }}
              >
                {isUploadingImage ? t('uploading') : t('replaceImage')}
              </Button>
            )}
          </FileButton>

          {uploadError && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              mt="xs"
              radius={16}
              styles={{
                root: {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                },
                title: { color: '#dc2626', fontWeight: 600, fontFamily: 'Inter, sans-serif' },
                message: { color: '#dc2626', fontFamily: 'Inter, sans-serif' },
              }}
            >
              {uploadError}
            </Alert>
          )}
        </Box>

        {/* Form */}
        <TextInput
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveError(null); // Clear error when user types
          }}
          required
          withAsterisk
          size="md"
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              height: '48px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <Textarea
          label={t('shortDescription')}
          placeholder={t('shortDescriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <Textarea
          label={t('fullDescription')}
          placeholder={t('fullDescriptionPlaceholder')}
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <DateInput
          label={t('dueDate')}
          description={t('dueDateDesc')}
          placeholder={t('dueDatePlaceholder')}
          value={dueDateValue}
          onChange={setDueDateValue}
          clearable
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              height: '48px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
            description: {
              fontFamily: 'Inter, sans-serif',
              color: '#666666',
              fontSize: '14px',
            },
          }}
        />

        <Checkbox
          label={t('completed')}
          checked={completed}
          onChange={(e) => setCompleted(e.currentTarget.checked)}
          color="green"
          size="md"
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              fontSize: '14px',
            },
          }}
        />

        <Divider my={4} />

        {/* Visualization practice ("Visualizar e agir") — state, belief,
            outcome+process, obstacle+response, action — modeled after the
            state/strategy structure from "Unlimited Power" rather than a
            single feeling + a single affirmation. */}
        <Box>
          <Text
            mb="sm"
            style={{
              fontFamily: 'Inter Display, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: '#000000',
            }}
          >
            {t('visualizationSectionTitle')}
          </Text>

          <Stack gap="md">
            <Select
              label={t('relatedObjective')}
              placeholder={t('relatedObjectivePlaceholder')}
              value={objectiveId ?? null}
              onChange={(value) => setObjectiveId(value || undefined)}
              data={objectives?.map((obj) => ({ value: obj.id, label: obj.title })) || []}
              searchable
              clearable
              radius={8}
            />

            <Box>
              <Text size="sm" fw={600} mb={6}>{t('practiceDuration')}</Text>
              <SegmentedControl
                fullWidth
                value={String(plannedPracticeDurationMinutes)}
                onChange={(v) => setPlannedPracticeDurationMinutes(Number(v) as 5 | 10 | 15)}
                data={[
                  { value: '5', label: t('duration5min') },
                  { value: '10', label: t('duration10min') },
                  { value: '15', label: t('duration15min') },
                ]}
                radius={8}
              />
            </Box>

            <Divider label={t('stateGroupTitle')} labelPosition="left" />

            <Select
              label={t('currentEmotion')}
              placeholder={t('currentEmotionPlaceholder')}
              value={currentEmotion ?? null}
              onChange={(value) => setCurrentEmotion(value || undefined)}
              data={FEELING_OPTIONS.map((f) => ({ value: f, label: t(`feelings.${f}`) }))}
              clearable
              radius={8}
            />

            <Box>
              <Text size="sm" fw={600} mb={6}>{t('currentEnergy')} — {currentEnergy}/10</Text>
              <Slider min={1} max={10} step={1} value={currentEnergy} onChange={setCurrentEnergy} color="blue" />
            </Box>

            <Box>
              <Text size="sm" fw={600} mb={6}>{t('currentConfidence')} — {currentConfidence}/10</Text>
              <Slider min={1} max={10} step={1} value={currentConfidence} onChange={setCurrentConfidence} color="blue" />
            </Box>

            <Textarea
              label={t('desiredState')}
              placeholder={t('desiredStatePlaceholder')}
              value={desiredState}
              onChange={(e) => setDesiredState(e.target.value)}
              autosize
              minRows={1}
              maxRows={3}
              maxLength={500}
              radius={8}
            />

            <Textarea
              label={t('empoweringBelief')}
              placeholder={t('empoweringBeliefPlaceholder')}
              value={empoweringBelief}
              onChange={(e) => setEmpoweringBelief(e.target.value)}
              autosize
              minRows={2}
              maxRows={5}
              maxLength={1000}
              radius={8}
            />

            <Divider label={t('visualizationGroupTitle')} labelPosition="left" />

            <Textarea
              label={t('outcomeVisualizationText')}
              placeholder={t('outcomeVisualizationTextPlaceholder')}
              value={outcomeVisualizationText}
              onChange={(e) => setOutcomeVisualizationText(e.target.value)}
              autosize
              minRows={3}
              maxRows={8}
              maxLength={2000}
              radius={8}
            />

            <Textarea
              label={t('processVisualizationText')}
              placeholder={t('processVisualizationTextPlaceholder')}
              value={processVisualizationText}
              onChange={(e) => setProcessVisualizationText(e.target.value)}
              autosize
              minRows={2}
              maxRows={6}
              maxLength={2000}
              radius={8}
            />

            <Textarea
              label={t('likelyObstacle')}
              placeholder={t('likelyObstaclePlaceholder')}
              value={likelyObstacle}
              onChange={(e) => setLikelyObstacle(e.target.value)}
              autosize
              minRows={2}
              maxRows={5}
              maxLength={1000}
              radius={8}
            />

            <Textarea
              label={t('obstacleResponse')}
              placeholder={t('obstacleResponsePlaceholder')}
              value={obstacleResponse}
              onChange={(e) => setObstacleResponse(e.target.value)}
              autosize
              minRows={2}
              maxRows={5}
              maxLength={1000}
              radius={8}
            />

            <Divider label={t('actionGroupTitle')} labelPosition="left" />

            <Textarea
              label={t('nextAction')}
              placeholder={t('nextActionPlaceholder')}
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              autosize
              minRows={1}
              maxRows={4}
              maxLength={500}
              radius={8}
            />

            <DateInput
              label={t('nextActionDueDate')}
              placeholder={t('dueDatePlaceholder')}
              value={nextActionDueDateValue}
              onChange={setNextActionDueDateValue}
              clearable
              radius={8}
            />

            <Button
              variant="light"
              leftSection={<Sparkles size={16} />}
              onClick={() => setStateViewOpen(true)}
              disabled={!outcomeVisualizationText.trim()}
              radius={8}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              {t('enterState')}
            </Button>
          </Stack>
        </Box>

        {/* Save Error Alert */}
        {saveError && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            mt="xs"
            radius={16}
            styles={{
              root: {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              },
              title: { color: '#dc2626', fontWeight: 600, fontFamily: 'Inter, sans-serif' },
              message: { color: '#dc2626', fontFamily: 'Inter, sans-serif' },
            }}
          >
            {saveError}
          </Alert>
        )}

        </Stack>
        </Box>
        <Box px="md" py="sm" style={{ borderTop: '1px solid #E2E8F0', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
          <Group justify="space-between">
            <Button
              variant="outline"
              color="red"
              leftSection={<Trash2 size={16} />}
              onClick={() => onDelete(item.id)}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: '#dc2626',
                color: '#dc2626',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                background: 'white',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  },
                },
              }}
            >
              {t('delete')}
            </Button>

            <Group>
              <Button
                variant="outline"
                onClick={onClose}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#CCCCCC',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      color: '#4686FE',
                    },
                  },
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={!title.trim() || isUploadingImage}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#4686FE',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  height: '48px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#3366E5',
                    },
                  },
                }}
              >
                {t('saveChanges')}
              </Button>
            </Group>
          </Group>
        </Box>
    </Modal>

    <VisionBoardStateView
      opened={stateViewOpen}
      onClose={() => setStateViewOpen(false)}
      imageUrl={currentImageUrl}
      title={title}
      currentEmotion={currentEmotion ? t(`feelings.${currentEmotion}`) : undefined}
      currentEnergy={currentEnergy}
      currentConfidence={currentConfidence}
      desiredState={desiredState}
      empoweringBelief={empoweringBelief}
      outcomeVisualizationText={outcomeVisualizationText}
      processVisualizationText={processVisualizationText}
      likelyObstacle={likelyObstacle}
      obstacleResponse={obstacleResponse}
      nextAction={nextAction}
    />
    </>
  );
}
