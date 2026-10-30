'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Modal, Box, Group, ActionIcon, Text, Button, Stack } from '@mantine/core';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { useSessionState, useLogPracticeSession } from '@/hooks/useVisionBoard';
import { SYSTEM_TRACKS } from '@/lib/vision-board/system-tracks';
import { VisualizationSteps, VisualizationStep } from './VisualizationSteps';
import { CheckInStep } from './CheckInStep';

interface SessionPlayerProps {
  opened: boolean;
  onClose: () => void;
  items: VisionBoardItem[];
}

const STEPS: VisualizationStep[] = ['state', 'outcome', 'process'];

function resolveAudio(item: VisionBoardItem | undefined): { url: string; label?: string } | null {
  if (!item) return null;
  if (item.audioType === 'system' && item.audioTrackId) {
    const track = SYSTEM_TRACKS.find((t) => t.id === item.audioTrackId);
    return track ? { url: track.url, label: track.id } : null;
  }
  if (item.audioType === 'file' && item.audioFileUrl) {
    return { url: item.audioFileUrl };
  }
  return null;
}

function fadeVolume(audio: HTMLAudioElement, to: number, durationMs: number, onDone?: () => void) {
  const from = audio.volume;
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    audio.volume = from + (to - from) * progress;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  requestAnimationFrame(step);
}

export function SessionPlayer({ opened, onClose, items }: SessionPlayerProps) {
  const t = useTranslations('visionBoard.sessionPlayer');
  const tFeelings = useTranslations('visionBoard.editDrawer.feelings');
  const tAudioTracks = useTranslations('visionBoard.audioPicker.tracks');
  const locale = useLocale();
  const { data: sessionState } = useSessionState();
  const logSessionMutation = useLogPracticeSession();

  const [phase, setPhase] = useState<'checkin' | 'steps' | 'final'>('checkin');
  const [goalIndex, setGoalIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [confidence, setConfidence] = useState(5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setPhase('checkin');
    setGoalIndex(0);
    setStepIndex(0);
    setFeeling(sessionState?.lastFeeling ?? null);
    setEnergy(sessionState?.lastEnergy ?? 5);
    setConfidence(sessionState?.lastConfidence ?? 5);
  }, [opened, sessionState]);

  useEffect(() => {
    if (!opened) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const currentItem = items[goalIndex];
  const currentAudio = useMemo(() => resolveAudio(currentItem), [currentItem]);

  // Swap/fade audio whenever the active goal's track changes.
  useEffect(() => {
    if (!opened || phase === 'checkin') return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
    const audio = audioRef.current;

    if (!currentAudio) {
      loadedUrlRef.current = null;
      fadeVolume(audio, 0, 400, () => audio.pause());
      setIsPlaying(false);
      return;
    }

    if (loadedUrlRef.current !== currentAudio.url) {
      loadedUrlRef.current = currentAudio.url;
      fadeVolume(audio, 0, 250, () => {
        audio.src = currentAudio.url;
        audio.muted = isMuted;
        audio.play().then(() => {
          setIsPlaying(true);
          fadeVolume(audio, 0.7, 500);
        }).catch(() => {});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, phase, currentAudio?.url]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    if (audioRef.current) {
      fadeVolume(audioRef.current, 0, 300, () => audioRef.current?.pause());
    }
    onClose();
  };

  const handleBeginSession = () => {
    setPhase('steps');
    setGoalIndex(0);
    setStepIndex(0);
  };

  const todayStr = () => new Date().toISOString().split('T')[0];

  const finishSession = () => {
    logSessionMutation.mutate({
      entries: items.map((i) => ({ itemId: i.id, date: todayStr() })),
      feeling: feeling || 'calm',
      energy,
      confidence,
    });
    if (audioRef.current) {
      fadeVolume(audioRef.current, 0, 500, () => audioRef.current?.pause());
    }
    setPhase('final');
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    if (goalIndex < items.length - 1) {
      setGoalIndex((i) => i + 1);
      setStepIndex(0);
      return;
    }
    finishSession();
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      return;
    }
    if (goalIndex > 0) {
      setGoalIndex((i) => i - 1);
      setStepIndex(STEPS.length - 1);
      return;
    }
    setPhase('checkin');
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  if (!opened) return null;

  const totalSegments = items.length * STEPS.length;
  const filledSegments = phase === 'steps' ? goalIndex * STEPS.length + stepIndex + 1 : 0;
  const isLastGoalLastStep = goalIndex === items.length - 1 && stepIndex === STEPS.length - 1;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      radius={0}
      styles={{
        content: { background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh' },
        body: { flex: 1, minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column' },
      }}
    >
      {phase !== 'checkin' && phase !== 'final' && (
        <Box style={{ position: 'fixed', top: 16, left: 16, zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentAudio && (
            <>
              <ActionIcon variant="subtle" size={36} radius="xl" onClick={togglePlayPause} style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }} aria-label={isPlaying ? t('pauseAudio') : t('playAudio')}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </ActionIcon>
              <ActionIcon variant="subtle" size={36} radius="xl" onClick={toggleMute} style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }} aria-label={isMuted ? t('unmuteAudio') : t('muteAudio')}>
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </ActionIcon>
              {currentAudio.label && (
                <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>{tAudioTracks(`${currentAudio.label}.label`)}</Text>
              )}
            </>
          )}
        </Box>
      )}

      <ActionIcon
        aria-label={t('close')}
        onClick={handleClose}
        variant="subtle"
        size={44}
        radius="xl"
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 2, color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }}
      >
        <X size={22} />
      </ActionIcon>

      {phase !== 'final' && (
        <Box style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: 'min(90vw, 420px)' }}>
          <Group gap={4} mb={6}>
            {Array.from({ length: totalSegments }, (_, i) => (
              <Box
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i < filledSegments ? '#4686FE' : 'rgba(255,255,255,0.18)',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </Group>
          <Text ta="center" size="sm" fw={600} style={{ color: 'rgba(255,255,255,0.75)' }}>
            {phase === 'checkin'
              ? t('checkinLegend', { count: items.length })
              : t('stepLegend', { goalCurrent: goalIndex + 1, goalTotal: items.length, stepCurrent: stepIndex + 1, stepTotal: STEPS.length })}
          </Text>
        </Box>
      )}

      <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '96px 24px 24px' }}>
        {phase === 'checkin' && (
          <CheckInStep
            feeling={feeling}
            energy={energy}
            confidence={confidence}
            onFeelingChange={setFeeling}
            onEnergyChange={setEnergy}
            onConfidenceChange={setConfidence}
            onBegin={handleBeginSession}
            wasPrefilled={!!sessionState?.lastSessionAt}
          />
        )}

        {phase === 'steps' && currentItem && (
          <VisualizationSteps
            step={STEPS[stepIndex]}
            imageUrl={currentItem.imageUrl}
            title={currentItem.title}
            currentEmotion={currentItem.currentEmotion ? tFeelings(currentItem.currentEmotion) : undefined}
            currentEnergy={currentItem.currentEnergy ?? 5}
            currentConfidence={currentItem.currentConfidence ?? 5}
            desiredState={currentItem.desiredState || ''}
            empoweringBelief={currentItem.empoweringBelief || ''}
            outcomeVisualizationText={currentItem.outcomeVisualizationText || ''}
            processVisualizationText={currentItem.processVisualizationText || ''}
            likelyObstacle={currentItem.likelyObstacle || ''}
            obstacleResponse={currentItem.obstacleResponse || ''}
            nextAction={currentItem.nextAction || ''}
            nextActionDueDate={
              currentItem.nextActionDueDate
                ? `${t('dueDatePrefix')} ${new Date(currentItem.nextActionDueDate + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}`
                : undefined
            }
          />
        )}

        {phase === 'final' && (
          <Stack gap="xl" align="center" style={{ maxWidth: 520, width: '100%' }}>
            <Stack gap={4} align="center">
              <Text ta="center" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('finalTitle')}
              </Text>
              <Text ta="center" fw={700} style={{ color: '#fff', fontFamily: 'Inter Display, sans-serif', fontSize: 'clamp(22px, 4vw, 30px)' }}>
                {t('finalSubtitle')}
              </Text>
            </Stack>

            <Stack gap="sm" style={{ width: '100%' }}>
              {items.map((item) => (
                <Group key={item.id} wrap="nowrap" p="sm" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <Box style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} truncate style={{ color: 'rgba(255,255,255,0.55)' }}>{item.title}</Text>
                    <Text size="sm" fw={700} style={{ color: '#fff' }} truncate>
                      {item.nextAction || t('fallbackNextAction')}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>

            <Button onClick={handleClose} radius={999} size="md" style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif', fontWeight: 600, minWidth: 180 }}>
              {t('backToBoard')}
            </Button>
          </Stack>
        )}
      </Box>

      {phase === 'steps' && (
        <Group justify="center" py="lg" gap="sm" style={{ flexShrink: 0 }}>
          <Button onClick={goBack} variant="outline" radius={999} size="md" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {t('backButton')}
          </Button>
          <Button onClick={goNext} radius={999} size="md" style={{ backgroundColor: '#4686FE', fontFamily: 'Inter, sans-serif', fontWeight: 600, minWidth: 160 }}>
            {stepIndex < STEPS.length - 1
              ? t('continueButton')
              : isLastGoalLastStep
                ? t('finishButton')
                : t('nextGoalButton')}
          </Button>
        </Group>
      )}
    </Modal>
  );
}
