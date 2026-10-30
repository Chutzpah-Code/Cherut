'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Text, Group, SegmentedControl, Radio, ActionIcon, FileButton, Button, Loader, Alert } from '@mantine/core';
import { Play, Square, Upload, AlertCircle, X } from 'lucide-react';
import { audioValidation } from '@/lib/api/services/vision-board';
import { useUploadAudio } from '@/hooks/useVisionBoard';
import { SYSTEM_TRACKS } from '@/lib/vision-board/system-tracks';
import { EditDrawerFormState, SetField } from './types';

interface AudioPickerProps {
  formState: EditDrawerFormState;
  setField: SetField;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function AudioPicker({ formState, setField }: AudioPickerProps) {
  const t = useTranslations('visionBoard.audioPicker');
  const uploadAudioMutation = useUploadAudio();
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePreview = (trackId: string, url: string) => {
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
      previewAudioRef.current.loop = true;
      previewAudioRef.current.addEventListener('ended', () => setPlayingTrackId(null));
    }
    const audio = previewAudioRef.current;

    if (playingTrackId === trackId) {
      audio.pause();
      setPlayingTrackId(null);
      return;
    }

    audio.src = url;
    audio.play().catch(() => {});
    setPlayingTrackId(trackId);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setIsValidating(true);

    try {
      const validation = await audioValidation.validateFile(file);
      if (!validation.valid) {
        setError(t(`error${validation.error === 'tooLarge' ? 'TooLarge' : validation.error === 'tooLong' ? 'TooLong' : 'WrongFormat'}`));
        return;
      }

      const result = await uploadAudioMutation.mutateAsync({ file, durationSec: validation.durationSec || 0 });
      setField('audioFileUrl', result.audioFileUrl);
      setField('audioDurationSec', result.audioDurationSec);
      setField('audioSizeBytes', result.audioSizeBytes);
    } catch (err) {
      console.error('Error uploading audio:', err);
      setError(t('uploadFailed'));
    } finally {
      setIsValidating(false);
    }
  };

  const removeFile = () => {
    setField('audioFileUrl', undefined);
    setField('audioDurationSec', undefined);
    setField('audioSizeBytes', undefined);
  };

  return (
    <Box>
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text size="sm" fw={600}>{t('label')}</Text>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{t('hintPlaysOnVisualize')}</Text>
      </Group>

      <SegmentedControl
        fullWidth
        value={formState.audioType}
        onChange={(v) => setField('audioType', v as 'none' | 'system' | 'file')}
        data={[
          { value: 'none', label: t('none') },
          { value: 'system', label: t('system') },
          { value: 'file', label: t('file') },
        ]}
        radius={8}
      />

      {formState.audioType === 'system' && (
        <Radio.Group
          mt="sm"
          value={formState.audioTrackId ?? ''}
          onChange={(v) => setField('audioTrackId', v)}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SYSTEM_TRACKS.map((track) => (
              <Group key={track.id} justify="space-between" p="xs" style={{ border: '1px solid #E5E7EB', borderRadius: 8 }} wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Radio value={track.id} />
                  <Box>
                    <Text size="sm" fw={600}>{t(`tracks.${track.id}.label`)}</Text>
                    <Text size="xs" c="dimmed">{t(`tracks.${track.id}.description`)}</Text>
                  </Box>
                </Group>
                <ActionIcon
                  variant="light"
                  onClick={() => togglePreview(track.id, track.url)}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  aria-label={playingTrackId === track.id ? t('stopButton') : t('listenButton')}
                >
                  {playingTrackId === track.id ? <Square size={14} /> : <Play size={14} />}
                </ActionIcon>
              </Group>
            ))}
          </Box>
        </Radio.Group>
      )}

      {formState.audioType === 'file' && (
        <Box mt="sm">
          {!formState.audioFileUrl ? (
            <FileButton onChange={handleFileChange} accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav" disabled={isValidating || uploadAudioMutation.isPending}>
              {(props) => (
                <Button
                  {...props}
                  variant="outline"
                  fullWidth
                  radius={8}
                  leftSection={isValidating || uploadAudioMutation.isPending ? <Loader size={16} /> : <Upload size={16} />}
                >
                  {t('uploadButton')}
                </Button>
              )}
            </FileButton>
          ) : (
            <Group justify="space-between" p="xs" style={{ border: '1px solid #E5E7EB', borderRadius: 8 }} wrap="nowrap">
              <Box>
                <Text size="sm" fw={600}>{t('durationSizeFormat', {
                  duration: formatDuration(formState.audioDurationSec || 0),
                  size: formatSize(formState.audioSizeBytes || 0),
                })}</Text>
              </Box>
              <Group gap={4} wrap="nowrap">
                <ActionIcon variant="light" onClick={() => togglePreview('file', formState.audioFileUrl!)} aria-label={t('listenButton')}>
                  {playingTrackId === 'file' ? <Square size={14} /> : <Play size={14} />}
                </ActionIcon>
                <FileButton onChange={handleFileChange} accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav">
                  {(props) => <Button {...props} variant="subtle" size="xs">{t('replaceButton')}</Button>}
                </FileButton>
                <ActionIcon variant="light" color="red" onClick={removeFile} aria-label={t('removeButton')}>
                  <X size={14} />
                </ActionIcon>
              </Group>
            </Group>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} color="red" mt="xs" radius={8}>
              {error}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
