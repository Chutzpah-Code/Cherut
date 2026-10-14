'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Title,
  Table,
  Badge,
  Group,
  Text,
  Button,
  TextInput,
  Textarea,
  Select,
  Card,
  Stack,
  Loader,
  Modal,
  ActionIcon,
  Tooltip,
  FileButton,
  Image,
  Box,
  Alert,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconChevronRight, IconPhoto, IconAlertCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Surface } from '@/components/ui/Surface';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useUploadCourseCover } from '@/hooks/useLearning';
import { Course, CreateCourseDto, RequiredPlan } from '@/lib/api/services/learning';

const MAX_COVER_SIZE = 2 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const emptyForm: CreateCourseDto = {
  title: '',
  description: '',
  isPublished: false,
  requiredPlan: undefined,
};

export default function AdminCoursesPage() {
  const t = useTranslations('adminCoursesPage');
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadCover = useUploadCourseCover();

  const planOptions = [
    { value: '', label: t('planOptions.any') },
    { value: 'core', label: t('planOptions.core') },
    { value: 'method', label: t('planOptions.method') },
    { value: 'mentorship', label: t('planOptions.mentorship') },
  ];

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CreateCourseDto>(emptyForm);
  const [coverError, setCoverError] = useState<string | null>(null);

  function handleCreate() {
    setEditing(null);
    setForm(emptyForm);
    setCoverError(null);
    openModal();
  }

  function handleEdit(course: Course) {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description || '',
      isPublished: course.isPublished,
      requiredPlan: course.requiredPlan,
    });
    setCoverError(null);
    openModal();
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(t('confirmDelete', { title: course.title }))) return;
    await deleteCourse.mutateAsync(course.id);
  }

  async function handleCoverUpload(file: File | null) {
    if (!file || !editing) return;
    setCoverError(null);
    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setCoverError(t('cover.errorType'));
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setCoverError(t('cover.errorSize'));
      return;
    }
    try {
      const updated = await uploadCover.mutateAsync({ id: editing.id, file });
      setEditing(updated);
    } catch {
      setCoverError(t('cover.errorUpload'));
    }
  }

  async function handleSave() {
    const dto: CreateCourseDto = {
      ...form,
      requiredPlan: form.requiredPlan || undefined,
    };
    if (editing) {
      await updateCourse.mutateAsync({ id: editing.id, dto });
    } else {
      await createCourse.mutateAsync(dto);
    }
    closeModal();
  }

  if (isLoading) {
    return (
      <Stack align="center" mt="xl">
        <Loader size="lg" />
        <Text>{t('loading')}</Text>
      </Stack>
    );
  }

  return (
    <Surface p={{ base: 'md', sm: 'xl' }}>
      <Group justify="space-between" mb="xl" wrap="wrap">
        <div>
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">{t('subtitle')}</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          {t('newCourse')}
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table.ScrollContainer minWidth={600}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('table.title')}</Table.Th>
                <Table.Th>{t('table.status')}</Table.Th>
                <Table.Th>{t('table.requiredPlan')}</Table.Th>
                <Table.Th>{t('table.lessons')}</Table.Th>
                <Table.Th>{t('table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(courses ?? []).map((course) => (
                <Table.Tr key={course.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/courses/${course.id}`)}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      {course.coverImageUrl ? (
                        <Image src={course.coverImageUrl} w={48} h={32} radius={4} fit="cover" />
                      ) : (
                        <Box w={48} h={32} style={{ borderRadius: 4, background: '#F1F5F9', flexShrink: 0 }} />
                      )}
                      <div>
                        <Text fw={500}>{course.title}</Text>
                        {course.description && (
                          <Text size="sm" c="dimmed" lineClamp={1}>{course.description}</Text>
                        )}
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={course.isPublished ? 'green' : 'gray'} variant="light">
                      {course.isPublished ? t('status.published') : t('status.draft')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="outline">
                      {course.requiredPlan ? course.requiredPlan : t('plan.any')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{course.totalLessons}</Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs">
                      <Tooltip label={t('actions.edit')}>
                        <ActionIcon variant="light" size="sm" color="blue" onClick={() => handleEdit(course)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('actions.delete')}>
                        <ActionIcon variant="light" size="sm" color="red" onClick={() => handleDelete(course)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('actions.manage')}>
                        <ActionIcon variant="light" size="sm" onClick={() => router.push(`/admin/courses/${course.id}`)}>
                          <IconChevronRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {(courses ?? []).length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            {t('empty')}
          </Text>
        )}
      </Card>

      <Modal opened={modalOpened} onClose={closeModal} title={editing ? t('modal.editTitle') : t('modal.newTitle')} size="md">
        <Stack>
          {editing ? (
            <Box>
              <Text size="sm" fw={500} mb={6}>{t('cover.label')}</Text>
              {coverError && (
                <Alert color="red" icon={<IconAlertCircle size={16} />} mb="xs" onClose={() => setCoverError(null)} withCloseButton>
                  {coverError}
                </Alert>
              )}
              {editing.coverImageUrl ? (
                <Box pos="relative">
                  <Image src={editing.coverImageUrl} radius="md" h={140} fit="cover" />
                  <FileButton onChange={handleCoverUpload} accept="image/jpeg,image/png,image/webp">
                    {(props) => (
                      <Button {...props} variant="white" size="xs" pos="absolute" bottom={8} right={8} loading={uploadCover.isPending}>
                        {t('cover.change')}
                      </Button>
                    )}
                  </FileButton>
                </Box>
              ) : (
                <FileButton onChange={handleCoverUpload} accept="image/jpeg,image/png,image/webp">
                  {(props) => (
                    <Box
                      {...props}
                      style={{
                        border: '2px dashed #CBD5E1',
                        borderRadius: 8,
                        padding: 24,
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {uploadCover.isPending ? (
                        <Loader size="sm" mx="auto" />
                      ) : (
                        <Stack align="center" gap={4}>
                          <IconPhoto size={24} color="#94A3B8" />
                          <Text size="sm" c="dimmed">{t('cover.upload')}</Text>
                        </Stack>
                      )}
                    </Box>
                  )}
                </FileButton>
              )}
            </Box>
          ) : (
            <Alert color="gray" variant="light" icon={<IconAlertCircle size={16} />}>
              {t('cover.saveFirst')}
            </Alert>
          )}

          <TextInput
            label={t('form.titleLabel')}
            placeholder={t('form.titlePlaceholder')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label={t('form.descriptionLabel')}
            placeholder={t('form.descriptionPlaceholder')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            autosize
            minRows={2}
          />
          <Select
            label={t('form.requiredPlanLabel')}
            description={t('form.requiredPlanDesc')}
            value={form.requiredPlan || ''}
            onChange={(value) => setForm({ ...form, requiredPlan: (value || undefined) as RequiredPlan | undefined })}
            data={planOptions}
          />
          <Select
            label={t('form.statusLabel')}
            value={form.isPublished ? 'published' : 'draft'}
            onChange={(value) => setForm({ ...form, isPublished: value === 'published' })}
            data={[
              { value: 'draft', label: t('status.draft') },
              { value: 'published', label: t('status.published') },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeModal}>
              {t('form.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {t('form.save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Surface>
  );
}
