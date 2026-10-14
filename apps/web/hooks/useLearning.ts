import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  learningApi,
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  UpdateCourseModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
} from '@/lib/api/services/learning';

// ── Reading ─────────────────────────────────────────────────────────────────

export const useCourses = () =>
  useQuery({
    queryKey: ['learning', 'courses'],
    queryFn: () => learningApi.getAllCourses(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useCourse = (id: string) =>
  useQuery({
    queryKey: ['learning', 'courses', id],
    queryFn: () => learningApi.getCourse(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

// ── Admin authoring — courses ────────────────────────────────────────────────

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCourseDto) => learningApi.createCourse(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning', 'courses'] }),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCourseDto }) => learningApi.updateCourse(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => learningApi.deleteCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning', 'courses'] }),
  });
};

// ── Admin authoring — modules ─────────────────────────────────────────────────

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, dto }: { courseId: string; dto: CreateCourseModuleDto }) =>
      learningApi.createModule(courseId, dto),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId, dto }: { id: string; courseId: string; dto: UpdateCourseModuleDto }) =>
      learningApi.updateModule(id, dto),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; courseId: string }) => learningApi.deleteModule(id),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

// ── Admin authoring — lessons ──────────────────────────────────────────────────

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, courseId, dto }: { moduleId: string; courseId: string; dto: CreateLessonDto }) =>
      learningApi.createLesson(moduleId, dto),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId, dto }: { id: string; courseId: string; dto: UpdateLessonDto }) =>
      learningApi.updateLesson(id, dto),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; courseId: string }) => learningApi.deleteLesson(id),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};

// ── Progress + enrollment ────────────────────────────────────────────────────

export const useToggleLessonProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: string; courseId: string }) =>
      learningApi.toggleLessonProgress(lessonId),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses'] });
    },
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, pace }: { courseId: string; pace: 7 | 14 }) => learningApi.enroll(courseId, pace),
    onSuccess: (_data, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: ['learning', 'courses', courseId] }),
  });
};
