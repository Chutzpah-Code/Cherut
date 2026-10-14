'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Title,
  Text,
  Stack,
  Box,
  Group,
  Checkbox,
  Progress,
  SegmentedControl,
  Button,
  Loader,
  Center,
  Badge,
  Anchor,
  Collapse,
} from '@mantine/core';
import { ArrowLeft, Lock, CheckCircle2, ChevronDown, ChevronRight, Play, FileText } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';
import { useCourse, useToggleLessonProgress, useEnroll } from '@/hooks/useLearning';
import { RequiredPlan, Lesson, CourseModule } from '@/lib/api/services/learning';

const PLAN_LABEL: Record<RequiredPlan, string> = {
  core: 'Core',
  method: 'Method',
  mentorship: 'Mentorship',
};

function dayOfPath(startedAt: string, pace: 7 | 14): number {
  const diffMs = Date.now() - new Date(startedAt).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(diffDays + 1, pace);
}

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function CourseDetailPage() {
  const t = useTranslations('learning.course');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useCourse(courseId);
  const toggleProgress = useToggleLessonProgress();
  const enroll = useEnroll();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [showExercise, setShowExercise] = useState(false);

  const allLessons = useMemo(
    () => (course?.modules ?? []).flatMap((m) => m.lessons ?? []),
    [course],
  );

  const currentLesson: Lesson | undefined = useMemo(() => {
    if (currentLessonId) {
      const found = allLessons.find((l) => l.id === currentLessonId);
      if (found) return found;
    }
    return allLessons.find((l) => !l.completed) ?? allLessons[allLessons.length - 1];
  }, [allLessons, currentLessonId]);

  const currentModule: CourseModule | undefined = useMemo(
    () => (course?.modules ?? []).find((m) => m.id === currentLesson?.moduleId),
    [course, currentLesson],
  );

  const templatesCount = useMemo(
    () => allLessons.filter((l) => !!l.templateText).length,
    [allLessons],
  );

  function handleSelectLesson(lesson: Lesson) {
    setCurrentLessonId(lesson.id);
    setShowExercise(false);
  }

  function handleContinue() {
    const next = allLessons.find((l) => !l.completed) ?? allLessons[allLessons.length - 1];
    if (next) {
      setCurrentLessonId(next.id);
      setExpandedModuleId(next.moduleId);
      setShowExercise(false);
    }
  }

  if (isLoading) {
    return (
      <Surface p="xl">
        <Center py="xl">
          <Loader size="sm" color="#4686FE" />
        </Center>
      </Surface>
    );
  }

  if (!course) return null;

  return (
    <Surface p={{ base: 'md', sm: 'xl' }} style={{ fontFamily: 'Inter, sans-serif' }}>
      <Stack gap="xl">
        <Group gap="xs">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<ArrowLeft size={14} />}
            onClick={() => router.push('/dashboard/learning')}
          >
            {t('back')}
          </Button>
        </Group>

        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Box>
            <Title
              order={1}
              mb={4}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: 'clamp(22px, 5vw, 32px)',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              {course.title}
            </Title>
            {!course.locked && (
              <Text size="sm" c="dimmed">
                {t('summaryLine', { lessons: course.totalLessons, modules: (course.modules ?? []).length })}
                {course.enrollment &&
                  ' · ' + t('dayOfPath', { day: dayOfPath(course.enrollment.startedAt, course.enrollment.pace), pace: course.enrollment.pace })}
              </Text>
            )}
          </Box>
          {!course.locked && allLessons.length > 0 && (
            <Button
              onClick={handleContinue}
              style={{ backgroundColor: '#0052CC' }}
            >
              {t('continueLesson')}
            </Button>
          )}
        </Group>

        {course.locked ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Lock size={32} color="#94A3B8" />
              <Badge variant="light" color="gray">
                {t('availableOnPlan', { plan: PLAN_LABEL[course.requiredPlan!] })}
              </Badge>
              <Text size="sm" c="dimmed" ta="center" maw={360}>
                {t('lockedBody')}
              </Text>
            </Stack>
          </Center>
        ) : !course.enrollment ? (
          <Box>
            <Text size="sm" fw={600} mb={6}>{t('pace')}</Text>
            <SegmentedControl
              onChange={(v) => enroll.mutate({ courseId, pace: Number(v) as 7 | 14 })}
              data={[
                { value: '7', label: t('pace7') },
                { value: '14', label: t('pace14') },
              ]}
              radius={8}
            />
          </Box>
        ) : (
          <Group align="flex-start" gap="xl" wrap="wrap">
            {/* Left — current lesson */}
            <Stack gap="md" style={{ flex: '2 1 480px', minWidth: 320 }}>
              <Box
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  background: course.coverImageUrl
                    ? `url(${course.coverImageUrl}) center/cover`
                    : 'linear-gradient(135deg, #312E81 0%, #6D28D9 100%)',
                }}
              >
                {currentLesson?.videoUrl ? (
                  embedUrl(currentLesson.videoUrl) ? (
                    <iframe
                      src={embedUrl(currentLesson.videoUrl)!}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 0 }}
                    />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      controls
                      src={currentLesson.videoUrl}
                      poster={course.coverImageUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )
                ) : (
                  <Center style={{ position: 'absolute', inset: 0 }}>
                    <Box
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={24} color="#fff" fill="#fff" />
                    </Box>
                  </Center>
                )}
              </Box>

              {currentLesson && currentModule && (
                <Box>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                    {t('moduleLessonLabel', {
                      module: String((currentModule.order ?? 0) + 1).padStart(2, '0'),
                      lesson: currentModule.lessons?.findIndex((l) => l.id === currentLesson.id)! + 1,
                    })}
                  </Text>
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Text fw={700} size="lg">{currentLesson.title}</Text>
                    <Checkbox
                      checked={!!currentLesson.completed}
                      onChange={() => toggleProgress.mutate({ lessonId: currentLesson.id, courseId })}
                      label={t('markComplete')}
                      labelPosition="left"
                    />
                  </Group>
                  {currentLesson.content && (
                    <Text size="sm" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>{currentLesson.content}</Text>
                  )}
                  {currentLesson.exerciseText && (
                    <Box mt="sm">
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed" lineClamp={showExercise ? undefined : 1} style={{ flex: 1 }}>
                          {t('exercise')}: {currentLesson.exerciseText}
                        </Text>
                        <Anchor size="sm" fw={600} onClick={() => setShowExercise((s) => !s)} style={{ flexShrink: 0 }}>
                          {showExercise ? t('close') : t('openExercise')}
                        </Anchor>
                      </Group>
                    </Box>
                  )}
                  {currentLesson.templateText && (
                    <Box mt="sm" style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>{t('template')}</Text>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{currentLesson.templateText}</Text>
                    </Box>
                  )}
                </Box>
              )}

              {allLessons.length === 0 && (
                <Text c="dimmed" size="sm">{t('noModules')}</Text>
              )}
            </Stack>

            {/* Right — modules sidebar */}
            <Stack gap="md" style={{ flex: '1 1 280px', minWidth: 260 }}>
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fw={700}>{t('modules')}</Text>
                  <Text size="sm" c="dimmed">{course.percentComplete}% {t('complete')}</Text>
                </Group>
                <Stack gap={6}>
                  {(course.modules ?? []).map((courseModule, idx) => {
                    const lessons = courseModule.lessons ?? [];
                    const completedCount = lessons.filter((l) => l.completed).length;
                    const modulePercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
                    const isExpanded = expandedModuleId === courseModule.id;

                    return (
                      <Box key={courseModule.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                        <Group
                          justify="space-between"
                          wrap="nowrap"
                          p="sm"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedModuleId(isExpanded ? null : courseModule.id)}
                        >
                          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <Box style={{ minWidth: 0 }}>
                              <Text size="sm" fw={600} truncate>
                                {String(idx + 1).padStart(2, '0')} · {courseModule.title}
                              </Text>
                              <Text size="xs" c="dimmed">{t('lessonCount', { count: lessons.length })}</Text>
                            </Box>
                          </Group>
                          {modulePercent === 100 ? (
                            <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                          ) : (
                            <Text size="xs" fw={700} c={modulePercent > 0 ? '#D97706' : 'dimmed'} style={{ flexShrink: 0 }}>
                              {modulePercent}%
                            </Text>
                          )}
                        </Group>
                        <Collapse in={isExpanded}>
                          <Stack gap={0} px="sm" pb="sm">
                            {lessons.map((lesson) => (
                              <Group
                                key={lesson.id}
                                justify="space-between"
                                wrap="nowrap"
                                py={6}
                                style={{ cursor: 'pointer', opacity: lesson.id === currentLesson?.id ? 1 : 0.8 }}
                                onClick={() => handleSelectLesson(lesson)}
                              >
                                <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                                  {lesson.videoUrl ? <Play size={12} color="#94A3B8" /> : <FileText size={12} color="#94A3B8" />}
                                  <Text
                                    size="xs"
                                    truncate
                                    fw={lesson.id === currentLesson?.id ? 700 : 400}
                                  >
                                    {lesson.title}
                                  </Text>
                                </Group>
                                <Checkbox
                                  size="xs"
                                  checked={!!lesson.completed}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleProgress.mutate({ lessonId: lesson.id, courseId });
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Group>
                            ))}
                          </Stack>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {templatesCount > 0 && (
                <Box style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                  <Text size="xl" fw={700}>{templatesCount}</Text>
                  <Text size="xs" c="dimmed">{t('templatesReady')}</Text>
                </Box>
              )}

              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">{t('overallProgress')}</Text>
                  <Text size="xs" c="dimmed">{course.percentComplete}%</Text>
                </Group>
                <Progress value={course.percentComplete} size={6} radius={4} color="#4686FE" />
              </Box>
            </Stack>
          </Group>
        )}
      </Stack>
    </Surface>
  );
}
