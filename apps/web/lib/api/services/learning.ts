import { apiClient } from '../client';

export type RequiredPlan = 'core' | 'method' | 'mentorship';

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  exerciseText?: string;
  templateText?: string;
  order: number;
  completed?: boolean; // only present on course-detail reads
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[]; // only present on course-detail reads
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  pace: 7 | 14;
  startedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  requiredPlan?: RequiredPlan;
  order: number;
  locked: boolean;
  totalLessons: number;
  percentComplete: number;
  modules?: CourseModule[]; // only present on course-detail reads
  enrollment?: CourseEnrollment | null; // only present on course-detail reads
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  isPublished?: boolean;
  requiredPlan?: RequiredPlan;
  order?: number;
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface CreateCourseModuleDto {
  title: string;
  description?: string;
  order?: number;
}

export type UpdateCourseModuleDto = Partial<CreateCourseModuleDto>;

export interface CreateLessonDto {
  title: string;
  content?: string;
  videoUrl?: string;
  exerciseText?: string;
  templateText?: string;
  order?: number;
}

export type UpdateLessonDto = Partial<CreateLessonDto>;

export const learningApi = {
  // Reading
  getAllCourses: async (): Promise<Course[]> => {
    const { data } = await apiClient.get('/learning/courses');
    return data;
  },

  getCourse: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get(`/learning/courses/${id}`);
    return data;
  },

  // Admin authoring — courses
  createCourse: async (dto: CreateCourseDto): Promise<Course> => {
    const { data } = await apiClient.post('/learning/courses', dto);
    return data;
  },

  updateCourse: async (id: string, dto: UpdateCourseDto): Promise<Course> => {
    const { data } = await apiClient.patch(`/learning/courses/${id}`, dto);
    return data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/courses/${id}`);
  },

  // Admin authoring — modules
  createModule: async (courseId: string, dto: CreateCourseModuleDto): Promise<CourseModule> => {
    const { data } = await apiClient.post(`/learning/courses/${courseId}/modules`, dto);
    return data;
  },

  updateModule: async (id: string, dto: UpdateCourseModuleDto): Promise<CourseModule> => {
    const { data } = await apiClient.patch(`/learning/modules/${id}`, dto);
    return data;
  },

  deleteModule: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/modules/${id}`);
  },

  // Admin authoring — lessons
  createLesson: async (moduleId: string, dto: CreateLessonDto): Promise<Lesson> => {
    const { data } = await apiClient.post(`/learning/modules/${moduleId}/lessons`, dto);
    return data;
  },

  updateLesson: async (id: string, dto: UpdateLessonDto): Promise<Lesson> => {
    const { data } = await apiClient.patch(`/learning/lessons/${id}`, dto);
    return data;
  },

  deleteLesson: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/lessons/${id}`);
  },

  // Progress + enrollment
  toggleLessonProgress: async (lessonId: string): Promise<{ completed: boolean }> => {
    const { data } = await apiClient.post(`/learning/lessons/${lessonId}/toggle`);
    return data;
  },

  enroll: async (courseId: string, pace: 7 | 14): Promise<CourseEnrollment> => {
    const { data } = await apiClient.post(`/learning/courses/${courseId}/enroll`, { pace });
    return data;
  },
};
