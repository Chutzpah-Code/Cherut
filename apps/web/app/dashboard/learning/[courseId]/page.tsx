'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Title,
  Text,
  Stack,
  Box,
  Group,
  Accordion,
  Checkbox,
  Progress,
  SegmentedControl,
  Button,
  Loader,
  Center,
  Badge,
  Anchor,
} from '@mantine/core';
import { ArrowLeft, Lock, PlayCircle } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';
import { useCourse, useToggleLessonProgress, useEnroll } from '@/hooks/useLearning';
import { RequiredPlan } from '@/lib/api/services/learning';

const PLAN_LABEL: Record<RequiredPlan, string> = {
  core: 'Core',
  method: 'Method',
  mentorship: 'Mentorship',
};

function targetDate(startedAt: string, pace: 7 | 14): string {
  const d = new Date(startedAt);
  d.setDate(d.getDate() + pace);
  return d.toLocaleDateString();
}

export default function CourseDetailPage() {
  const t = useTranslations('learning.course');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useCourse(courseId);
  const toggleProgress = useToggleLessonProgress();
  const enroll = useEnroll();
  const [pace, setPace] = useState<'7' | '14'>('7');

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

        <Box>
          <Title
            order={1}
            mb="xs"
            style={{
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: '#000000',
            }}
          >
            {course.title}
          </Title>
          {course.description && (
            <Text size="md" c="dimmed">
              {course.description}
            </Text>
          )}
        </Box>

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
        ) : (
          <>
            <Box>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={600}>{t('overallProgress')}</Text>
                <Text size="sm" c="dimmed">{course.percentComplete}%</Text>
              </Group>
              <Progress value={course.percentComplete} size={8} radius={4} color="#4686FE" />
            </Box>

            <Group justify="space-between" wrap="wrap" gap="md">
              <Box>
                <Text size="sm" fw={600} mb={6}>{t('pace')}</Text>
                <SegmentedControl
                  value={course.enrollment ? String(course.enrollment.pace) : pace}
                  onChange={(v) => {
                    setPace(v as '7' | '14');
                    enroll.mutate({ courseId, pace: Number(v) as 7 | 14 });
                  }}
                  data={[
                    { value: '7', label: t('pace7') },
                    { value: '14', label: t('pace14') },
                  ]}
                  radius={8}
                />
              </Box>
              {course.enrollment && (
                <Text size="sm" c="dimmed">
                  {t('targetDate', { date: targetDate(course.enrollment.startedAt, course.enrollment.pace) })}
                </Text>
              )}
            </Group>

            <Accordion variant="separated" radius="md" defaultValue={course.modules?.[0]?.id}>
              {course.modules?.map((courseModule) => (
                <Accordion.Item key={courseModule.id} value={courseModule.id}>
                  <Accordion.Control>
                    <Text fw={600}>{courseModule.title}</Text>
                    {courseModule.description && (
                      <Text size="xs" c="dimmed">{courseModule.description}</Text>
                    )}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="md">
                      {(courseModule.lessons ?? []).map((lesson) => (
                        <Box key={lesson.id} style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: 12 }}>
                          <Group gap="sm" align="flex-start" wrap="nowrap">
                            <Checkbox
                              checked={!!lesson.completed}
                              onChange={() => toggleProgress.mutate({ lessonId: lesson.id, courseId })}
                              mt={2}
                            />
                            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                              <Text
                                fw={600}
                                size="sm"
                                style={{ textDecoration: lesson.completed ? 'line-through' : 'none', color: lesson.completed ? '#94A3B8' : undefined }}
                              >
                                {lesson.title}
                              </Text>
                              {lesson.content && (
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</Text>
                              )}
                              {lesson.videoUrl && (
                                <Anchor href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" size="sm">
                                  <Group gap={4}>
                                    <PlayCircle size={14} />
                                    {t('watchVideo')}
                                  </Group>
                                </Anchor>
                              )}
                              {lesson.exerciseText && (
                                <Box style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>{t('exercise')}</Text>
                                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{lesson.exerciseText}</Text>
                                </Box>
                              )}
                              {lesson.templateText && (
                                <Box style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>{t('template')}</Text>
                                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{lesson.templateText}</Text>
                                </Box>
                              )}
                            </Stack>
                          </Group>
                        </Box>
                      ))}
                      {(courseModule.lessons ?? []).length === 0 && (
                        <Text size="sm" c="dimmed">{t('noLessons')}</Text>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            {(course.modules ?? []).length === 0 && (
              <Text c="dimmed" size="sm">{t('noModules')}</Text>
            )}
          </>
        )}
      </Stack>
    </Surface>
  );
}
