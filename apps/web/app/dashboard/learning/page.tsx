'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Title, Text, Stack, Box, SimpleGrid, Card, Group, Progress, Badge, Loader, Center } from '@mantine/core';
import { Lock, GraduationCap } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';
import { useCourses } from '@/hooks/useLearning';
import { RequiredPlan } from '@/lib/api/services/learning';

const PLAN_LABEL: Record<RequiredPlan, string> = {
  core: 'Core',
  method: 'Method',
  mentorship: 'Mentorship',
};

export default function LearningPage() {
  const t = useTranslations('learning.page');
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();

  return (
    <Surface p={{ base: 'md', sm: 'xl' }} style={{ fontFamily: 'Inter, sans-serif' }}>
      <Stack gap="xl">
        <Box>
          <Title
            order={1}
            mb="xs"
            style={{
              fontFamily: 'Inter Display, sans-serif',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </Title>
          <Text size="md" c="dimmed">
            {t('subtitle')}
          </Text>
        </Box>

        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" color="#4686FE" />
          </Center>
        ) : !courses || courses.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <GraduationCap size={32} color="#94A3B8" />
              <Text c="dimmed" size="sm">{t('empty')}</Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {courses.map((course) => (
              <Card
                key={course.id}
                radius="lg"
                withBorder
                padding="md"
                style={{ cursor: 'pointer', opacity: course.locked ? 0.7 : 1 }}
                onClick={() => router.push(`/dashboard/learning/${course.id}`)}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text fw={700} size="md" style={{ fontFamily: 'Inter Display, sans-serif' }}>
                      {course.title}
                    </Text>
                    {course.locked && <Lock size={16} color="#94A3B8" style={{ flexShrink: 0 }} />}
                  </Group>

                  {course.description && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {course.description}
                    </Text>
                  )}

                  {course.locked ? (
                    <Badge variant="light" color="gray" size="sm" style={{ alignSelf: 'flex-start' }}>
                      {t('availableOnPlan', { plan: PLAN_LABEL[course.requiredPlan!] })}
                    </Badge>
                  ) : (
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">{t('progress')}</Text>
                        <Text size="xs" fw={600}>{course.percentComplete}%</Text>
                      </Group>
                      <Progress value={course.percentComplete} size={6} radius={4} color="#4686FE" />
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Surface>
  );
}
