'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const PLAN_OPTIONS = [
  { value: '', label: 'Any plan' },
  { value: 'core', label: 'Core' },
  { value: 'method', label: 'Method' },
  { value: 'mentorship', label: 'Mentorship' },
];

const emptyForm: CreateCourseDto = {
  title: '',
  description: '',
  isPublished: false,
  requiredPlan: undefined,
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadCover = useUploadCourseCover();

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
    if (!window.confirm(`Delete course "${course.title}"? This also deletes its modules and lessons.`)) return;
    await deleteCourse.mutateAsync(course.id);
  }

  async function handleCoverUpload(file: File | null) {
    if (!file || !editing) return;
    setCoverError(null);
    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setCoverError('Only JPEG, PNG or WebP images are allowed');
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setCoverError('Image must be under 2MB');
      return;
    }
    try {
      const updated = await uploadCover.mutateAsync({ id: editing.id, file });
      setEditing(updated);
    } catch {
      setCoverError('Failed to upload cover image');
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
        <Text>Loading courses...</Text>
      </Stack>
    );
  }

  return (
    <Surface p={{ base: 'md', sm: 'xl' }}>
      <Group justify="space-between" mb="xl" wrap="wrap">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed">Author courses, modules and lessons</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          New Course
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table.ScrollContainer minWidth={600}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Required Plan</Table.Th>
                <Table.Th>Lessons</Table.Th>
                <Table.Th>Actions</Table.Th>
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
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="outline">
                      {course.requiredPlan ? course.requiredPlan : 'Any'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{course.totalLessons}</Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon variant="light" size="sm" color="blue" onClick={() => handleEdit(course)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon variant="light" size="sm" color="red" onClick={() => handleDelete(course)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Manage modules & lessons">
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
            No courses yet
          </Text>
        )}
      </Card>

      <Modal opened={modalOpened} onClose={closeModal} title={editing ? 'Edit Course' : 'New Course'} size="md">
        <Stack>
          {editing ? (
            <Box>
              <Text size="sm" fw={500} mb={6}>Cover Image</Text>
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
                        Change
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
                          <Text size="sm" c="dimmed">Click to upload a cover image</Text>
                        </Stack>
                      )}
                    </Box>
                  )}
                </FileButton>
              )}
            </Box>
          ) : (
            <Alert color="gray" variant="light" icon={<IconAlertCircle size={16} />}>
              Save the course first to add a cover image.
            </Alert>
          )}

          <TextInput
            label="Title"
            placeholder="All In All The Time"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Short description of the course"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            autosize
            minRows={2}
          />
          <Select
            label="Required Plan"
            description="Minimum plan needed to unlock this course"
            value={form.requiredPlan || ''}
            onChange={(value) => setForm({ ...form, requiredPlan: (value || undefined) as RequiredPlan | undefined })}
            data={PLAN_OPTIONS}
          />
          <Select
            label="Status"
            value={form.isPublished ? 'published' : 'draft'}
            onChange={(value) => setForm({ ...form, isPublished: value === 'published' })}
            data={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Surface>
  );
}
