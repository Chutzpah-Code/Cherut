import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';
// Side-effect-only import so this file reliably resolves the ambient
// `Express.Multer.File` global declared by @types/multer, regardless of
// whether the package was otherwise pulled into this compilation unit.
import type {} from 'multer';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  UpdateCourseModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto';

type Plan = 'core' | 'method' | 'mentorship';

// Hierarchical — Mentorship includes everything Method does, which includes
// everything Core does. A user with no subscription is treated as rank 0
// (same as Core) for comparison purposes only — it doesn't grant Core
// content, it's just the floor of the scale.
const PLAN_RANK: Record<Plan, number> = { core: 0, method: 1, mentorship: 2 };

function cleanDto<T extends object>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);
  private readonly coursesCollection = 'courses';
  private readonly modulesCollection = 'courseModules';
  private readonly lessonsCollection = 'lessons';
  private readonly enrollmentsCollection = 'courseEnrollments';
  private readonly progressCollection = 'lessonProgress';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── Courses — admin authoring ──────────────────────────────────────────

  async createCourse(dto: CreateCourseDto) {
    const db = this.firebaseService.getFirestore();
    const now = new Date().toISOString();

    const course = {
      ...cleanDto(dto),
      isPublished: dto.isPublished ?? false,
      order: dto.order ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.coursesCollection).add(course);
    this.logger.log(`Course created: ${ref.id}`);
    return { id: ref.id, ...course };
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const db = this.firebaseService.getFirestore();
    await this.getCourseDocOrThrow(id);

    const updates = { ...cleanDto(dto), updatedAt: new Date().toISOString() };
    await db.collection(this.coursesCollection).doc(id).update(updates);

    this.logger.log(`Course updated: ${id}`);
    return this.getCourseRaw(id);
  }

  async uploadCourseCover(id: string, file: Express.Multer.File) {
    const db = this.firebaseService.getFirestore();
    await this.getCourseDocOrThrow(id);

    const coverImageUrl = await this.cloudinaryService.uploadCourseCover(file.buffer, id);
    await db.collection(this.coursesCollection).doc(id).update({
      coverImageUrl,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Course cover uploaded for ${id}`);
    return this.getCourseRaw(id);
  }

  async deleteCourse(id: string) {
    const db = this.firebaseService.getFirestore();
    await this.getCourseDocOrThrow(id);

    const [modulesSnap, lessonsSnap, enrollmentsSnap, progressSnap] = await Promise.all([
      db.collection(this.modulesCollection).where('courseId', '==', id).get(),
      db.collection(this.lessonsCollection).where('courseId', '==', id).get(),
      db.collection(this.enrollmentsCollection).where('courseId', '==', id).get(),
      db.collection(this.progressCollection).where('courseId', '==', id).get(),
    ]);

    const batch = db.batch();
    modulesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    lessonsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    enrollmentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    progressSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection(this.coursesCollection).doc(id));

    await batch.commit();
    this.logger.log(`Course ${id} and all its content deleted`);
    return { message: 'Course deleted successfully' };
  }

  // ─── Courses — reading (user + admin) ───────────────────────────────────

  async findAllCourses(userId: string, userPlan: Plan | undefined, isAdmin: boolean) {
    const db = this.firebaseService.getFirestore();

    const coursesQuery = isAdmin
      ? db.collection(this.coursesCollection)
      : db.collection(this.coursesCollection).where('isPublished', '==', true);

    const coursesSnap = await coursesQuery.get();
    const courses = sortByOrder(
      coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as any),
    );

    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);

    // Equality-only queries, joined/sorted in memory — same pattern used
    // across the app (getKanban, getTodayHabits) to avoid needing composite
    // indexes. `in` is capped at 30 values by Firestore; fine for a course
    // catalog (admin-authored content, not per-user volume).
    const [lessonsSnap, progressSnap] = await Promise.all([
      db.collection(this.lessonsCollection).where('courseId', 'in', courseIds.slice(0, 30)).get(),
      db.collection(this.progressCollection).where('userId', '==', userId).get(),
    ]);

    const lessonCountByCourse = new Map<string, number>();
    lessonsSnap.docs.forEach((doc) => {
      const courseId = (doc.data() as any).courseId;
      lessonCountByCourse.set(courseId, (lessonCountByCourse.get(courseId) ?? 0) + 1);
    });

    const completedCountByCourse = new Map<string, number>();
    progressSnap.docs.forEach((doc) => {
      const data = doc.data() as any;
      if (data.completed) {
        completedCountByCourse.set(data.courseId, (completedCountByCourse.get(data.courseId) ?? 0) + 1);
      }
    });

    return courses.map((course) => {
      const locked = this.isLocked(course.requiredPlan, userPlan);
      const totalLessons = lessonCountByCourse.get(course.id) ?? 0;
      const completedLessons = completedCountByCourse.get(course.id) ?? 0;
      const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return { ...course, locked, totalLessons, percentComplete };
    });
  }

  async findCourseDetail(userId: string, courseId: string, userPlan: Plan | undefined, isAdmin: boolean) {
    const db = this.firebaseService.getFirestore();
    const course: any = await this.getCourseDocOrThrow(courseId);

    if (!isAdmin && !course.isPublished) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const locked = this.isLocked(course.requiredPlan, userPlan);

    // Locked courses show up as a teaser (title/description/requiredPlan
    // already included via `...course`) but never expose paid content.
    if (locked && !isAdmin) {
      return { ...course, locked: true, modules: [] };
    }

    const [modulesSnap, lessonsSnap, progressSnap, enrollmentSnap] = await Promise.all([
      db.collection(this.modulesCollection).where('courseId', '==', courseId).get(),
      db.collection(this.lessonsCollection).where('courseId', '==', courseId).get(),
      db.collection(this.progressCollection).where('userId', '==', userId).where('courseId', '==', courseId).get(),
      db.collection(this.enrollmentsCollection).where('userId', '==', userId).where('courseId', '==', courseId).limit(1).get(),
    ]);

    const completedLessonIds = new Set(
      progressSnap.docs.filter((doc) => (doc.data() as any).completed).map((doc) => (doc.data() as any).lessonId),
    );

    const lessons = sortByOrder(lessonsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as any)).map(
      (lesson) => ({ ...lesson, completed: completedLessonIds.has(lesson.id) }),
    );

    const lessonsByModule = new Map<string, any[]>();
    lessons.forEach((lesson) => {
      const list = lessonsByModule.get(lesson.moduleId) ?? [];
      list.push(lesson);
      lessonsByModule.set(lesson.moduleId, list);
    });

    const modules = sortByOrder(modulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as any)).map(
      (courseModule) => ({ ...courseModule, lessons: lessonsByModule.get(courseModule.id) ?? [] }),
    );

    const totalLessons = lessons.length;
    const percentComplete = totalLessons > 0 ? Math.round((completedLessonIds.size / totalLessons) * 100) : 0;
    const enrollment = enrollmentSnap.empty ? null : { id: enrollmentSnap.docs[0].id, ...enrollmentSnap.docs[0].data() };

    return { ...course, locked: false, modules, totalLessons, percentComplete, enrollment };
  }

  // ─── Modules — admin authoring ──────────────────────────────────────────

  async createModule(courseId: string, dto: CreateCourseModuleDto) {
    const db = this.firebaseService.getFirestore();
    await this.getCourseDocOrThrow(courseId);

    const existing = await db.collection(this.modulesCollection).where('courseId', '==', courseId).get();
    const now = new Date().toISOString();

    const courseModule = {
      ...cleanDto(dto),
      courseId,
      order: dto.order ?? existing.size,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.modulesCollection).add(courseModule);
    this.logger.log(`Course module created: ${ref.id} for course ${courseId}`);
    return { id: ref.id, ...courseModule };
  }

  async updateModule(id: string, dto: UpdateCourseModuleDto) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.modulesCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Module ${id} not found`);

    const updates = { ...cleanDto(dto), updatedAt: new Date().toISOString() };
    await db.collection(this.modulesCollection).doc(id).update(updates);

    return { id, ...doc.data(), ...updates };
  }

  async deleteModule(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.modulesCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Module ${id} not found`);

    const [lessonsSnap, progressSnap] = await Promise.all([
      db.collection(this.lessonsCollection).where('moduleId', '==', id).get(),
      db.collection(this.progressCollection).where('moduleId', '==', id).get(),
    ]);

    const batch = db.batch();
    lessonsSnap.docs.forEach((d) => batch.delete(d.ref));
    progressSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection(this.modulesCollection).doc(id));
    await batch.commit();

    this.logger.log(`Module ${id} and its lessons deleted`);
    return { message: 'Module deleted successfully' };
  }

  // ─── Lessons — admin authoring ──────────────────────────────────────────

  async createLesson(moduleId: string, dto: CreateLessonDto) {
    const db = this.firebaseService.getFirestore();
    const moduleDoc = await db.collection(this.modulesCollection).doc(moduleId).get();
    if (!moduleDoc.exists) throw new NotFoundException(`Module ${moduleId} not found`);

    const courseId = (moduleDoc.data() as any).courseId;
    const existing = await db.collection(this.lessonsCollection).where('moduleId', '==', moduleId).get();
    const now = new Date().toISOString();

    const lesson = {
      ...cleanDto(dto),
      moduleId,
      courseId,
      order: dto.order ?? existing.size,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(this.lessonsCollection).add(lesson);
    this.logger.log(`Lesson created: ${ref.id} for module ${moduleId}`);
    return { id: ref.id, ...lesson };
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.lessonsCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Lesson ${id} not found`);

    const updates = { ...cleanDto(dto), updatedAt: new Date().toISOString() };
    await db.collection(this.lessonsCollection).doc(id).update(updates);

    return { id, ...doc.data(), ...updates };
  }

  async deleteLesson(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.lessonsCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Lesson ${id} not found`);

    const progressSnap = await db.collection(this.progressCollection).where('lessonId', '==', id).get();

    const batch = db.batch();
    progressSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection(this.lessonsCollection).doc(id));
    await batch.commit();

    this.logger.log(`Lesson ${id} deleted`);
    return { message: 'Lesson deleted successfully' };
  }

  // ─── Progress + enrollment — any authenticated user ─────────────────────

  async toggleLessonProgress(userId: string, lessonId: string) {
    const db = this.firebaseService.getFirestore();
    const lessonDoc = await db.collection(this.lessonsCollection).doc(lessonId).get();
    if (!lessonDoc.exists) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const courseId = (lessonDoc.data() as any).courseId;

    const existingSnap = await db
      .collection(this.progressCollection)
      .where('userId', '==', userId)
      .where('lessonId', '==', lessonId)
      .limit(1)
      .get();

    const now = new Date().toISOString();

    if (existingSnap.empty) {
      const progress = { userId, lessonId, courseId, completed: true, completedAt: now };
      const ref = await db.collection(this.progressCollection).add(progress);
      return { id: ref.id, ...progress };
    }

    const doc = existingSnap.docs[0];
    const completed = !(doc.data() as any).completed;
    const updates = { completed, completedAt: completed ? now : null };
    await doc.ref.update(updates);

    return { id: doc.id, ...doc.data(), ...updates };
  }

  async enrollInCourse(userId: string, courseId: string, pace: 7 | 14) {
    const db = this.firebaseService.getFirestore();
    await this.getCourseDocOrThrow(courseId);

    const existingSnap = await db
      .collection(this.enrollmentsCollection)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (existingSnap.empty) {
      const enrollment = { userId, courseId, pace, startedAt: new Date().toISOString() };
      const ref = await db.collection(this.enrollmentsCollection).add(enrollment);
      return { id: ref.id, ...enrollment };
    }

    const doc = existingSnap.docs[0];
    await doc.ref.update({ pace });
    return { id: doc.id, ...doc.data(), pace };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private isLocked(requiredPlan: Plan | undefined, userPlan: Plan | undefined): boolean {
    if (!requiredPlan) return false;
    const userRank = userPlan ? PLAN_RANK[userPlan] : 0;
    return userRank < PLAN_RANK[requiredPlan];
  }

  private async getCourseDocOrThrow(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.coursesCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Course ${id} not found`);
    return { id: doc.id, ...doc.data() };
  }

  private async getCourseRaw(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.coursesCollection).doc(id).get();
    return { id: doc.id, ...doc.data() };
  }
}
