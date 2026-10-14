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
  Button,
  TextInput,
  Textarea,
  Modal,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Surface } from '@/components/ui/Surface';
import {
  useCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/hooks/useLearning';
import { CourseModule, Lesson, CreateCourseModuleDto, CreateLessonDto } from '@/lib/api/services/learning';

const emptyModuleForm: CreateCourseModuleDto = { title: '', description: '' };
const emptyLessonForm: CreateLessonDto = { title: '', content: '', videoUrl: '', exerciseText: '', templateText: '' };

export default function AdminCourseDetailPage() {
  const t = useTranslations('adminCourseEditorPage');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useCourse(courseId);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [moduleModalOpened, { open: openModuleModal, close: closeModuleModal }] = useDisclosure();
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<CreateCourseModuleDto>(emptyModuleForm);

  const [lessonModalOpened, { open: openLessonModal, close: closeLessonModal }] = useDisclosure();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<CreateLessonDto>(emptyLessonForm);

  function handleCreateModule() {
    setEditingModule(null);
    setModuleForm(emptyModuleForm);
    openModuleModal();
  }

  function handleEditModule(courseModule: CourseModule) {
    setEditingModule(courseModule);
    setModuleForm({ title: courseModule.title, description: courseModule.description || '' });
    openModuleModal();
  }

  async function handleDeleteModule(courseModule: CourseModule) {
    if (!window.confirm(t('confirmDeleteModule', { title: courseModule.title }))) return;
    await deleteModule.mutateAsync({ id: courseModule.id, courseId });
  }

  async function handleSaveModule() {
    if (editingModule) {
      await updateModule.mutateAsync({ id: editingModule.id, courseId, dto: moduleForm });
    } else {
      await createModule.mutateAsync({ courseId, dto: moduleForm });
    }
    closeModuleModal();
  }

  function handleCreateLesson(moduleId: string) {
    setEditingLesson(null);
    setLessonModuleId(moduleId);
    setLessonForm(emptyLessonForm);
    openLessonModal();
  }

  function handleEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setLessonModuleId(lesson.moduleId);
    setLessonForm({
      title: lesson.title,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      exerciseText: lesson.exerciseText || '',
      templateText: lesson.templateText || '',
    });
    openLessonModal();
  }

  async function handleDeleteLesson(lesson: Lesson) {
    if (!window.confirm(t('confirmDeleteLesson', { title: lesson.title }))) return;
    await deleteLesson.mutateAsync({ id: lesson.id, courseId });
  }

  async function handleSaveLesson() {
    if (!lessonModuleId) return;
    if (editingLesson) {
      await updateLesson.mutateAsync({ id: editingLesson.id, courseId, dto: lessonForm });
    } else {
      await createLesson.mutateAsync({ moduleId: lessonModuleId, courseId, dto: lessonForm });
    }
    closeLessonModal();
  }

  if (isLoading) {
    return (
      <Surface p="xl">
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      </Surface>
    );
  }

  if (!course) return null;

  return (
    <Surface p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="xl">
        <Group gap="xs">
          <Button variant="subtle" size="xs" leftSection={<IconArrowLeft size={14} />} onClick={() => router.push('/admin/courses')}>
            {t('backToCourses')}
          </Button>
        </Group>

        <Group justify="space-between" wrap="wrap">
          <Box>
            <Title order={1}>{course.title}</Title>
            {course.description && <Text c="dimmed">{course.description}</Text>}
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreateModule}>
            {t('newModule')}
          </Button>
        </Group>

        <Accordion variant="separated" radius="md">
          {(course.modules ?? []).map((courseModule) => (
            <Accordion.Item key={courseModule.id} value={courseModule.id}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" pr="sm">
                  <Box>
                    <Text fw={600}>{courseModule.title}</Text>
                    {courseModule.description && <Text size="xs" c="dimmed">{courseModule.description}</Text>}
                  </Box>
                  <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <Tooltip label={t('editModule')}>
                      <ActionIcon variant="light" size="sm" color="blue" onClick={() => handleEditModule(courseModule)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('deleteModule')}>
                      <ActionIcon variant="light" size="sm" color="red" onClick={() => handleDeleteModule(courseModule)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  {(courseModule.lessons ?? []).map((lesson) => (
                    <Group key={lesson.id} justify="space-between" wrap="nowrap" style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: 12 }}>
                      <Text size="sm">{lesson.title}</Text>
                      <Group gap="xs">
                        <Tooltip label={t('editLesson')}>
                          <ActionIcon variant="light" size="sm" color="blue" onClick={() => handleEditLesson(lesson)}>
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('deleteLesson')}>
                          <ActionIcon variant="light" size="sm" color="red" onClick={() => handleDeleteLesson(lesson)}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  ))}
                  {(courseModule.lessons ?? []).length === 0 && (
                    <Text size="sm" c="dimmed">{t('noLessons')}</Text>
                  )}
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => handleCreateLesson(courseModule.id)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {t('addLesson')}
                  </Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        {(course.modules ?? []).length === 0 && (
          <Text c="dimmed" ta="center" py="xl">{t('noModules')}</Text>
        )}
      </Stack>

      <Modal opened={moduleModalOpened} onClose={closeModuleModal} title={editingModule ? t('moduleModal.editTitle') : t('moduleModal.newTitle')}>
        <Stack>
          <TextInput
            label={t('moduleModal.titleLabel')}
            placeholder={t('moduleModal.titlePlaceholder')}
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            required
          />
          <Textarea
            label={t('moduleModal.descriptionLabel')}
            value={moduleForm.description}
            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
            autosize
            minRows={2}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeModuleModal}>{t('cancel')}</Button>
            <Button onClick={handleSaveModule} disabled={!moduleForm.title.trim()}>{t('save')}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={lessonModalOpened} onClose={closeLessonModal} title={editingLesson ? t('lessonModal.editTitle') : t('lessonModal.newTitle')} size="lg">
        <Stack>
          <TextInput
            label={t('lessonModal.titleLabel')}
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            required
          />
          <Textarea
            label={t('lessonModal.contentLabel')}
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            autosize
            minRows={3}
          />
          <TextInput
            label={t('lessonModal.videoUrlLabel')}
            placeholder={t('lessonModal.videoUrlPlaceholder')}
            value={lessonForm.videoUrl}
            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
          />
          <Textarea
            label={t('lessonModal.exerciseLabel')}
            value={lessonForm.exerciseText}
            onChange={(e) => setLessonForm({ ...lessonForm, exerciseText: e.target.value })}
            autosize
            minRows={2}
          />
          <Textarea
            label={t('lessonModal.templateLabel')}
            value={lessonForm.templateText}
            onChange={(e) => setLessonForm({ ...lessonForm, templateText: e.target.value })}
            autosize
            minRows={2}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeLessonModal}>{t('cancel')}</Button>
            <Button onClick={handleSaveLesson} disabled={!lessonForm.title.trim()}>{t('save')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Surface>
  );
}
