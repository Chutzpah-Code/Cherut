'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useCourse, useToggleLessonProgress, useEnroll } from '@/hooks/useLearning';
import { Lesson } from '@/lib/api/services/learning';
import { resolveCurrentLesson } from '../lib/resolveCurrentLesson';
import { LessonVideo } from '../components/LessonVideo';
import { LessonHeader } from '../components/LessonHeader';
import { LessonTabs, LessonTab } from '../components/LessonTabs';
import { LessonNav } from '../components/LessonNav';
import { ModuleAccordion } from '../components/ModuleAccordion';
import { PaceSelector } from '../components/PaceSelector';
import { LockedCourseState } from '../components/LockedCourseState';

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
  const [activeTab, setActiveTab] = useState<LessonTab>('overview');

  const allLessons = useMemo(() => (course?.modules ?? []).flatMap((m) => m.lessons ?? []), [course]);

  const currentLesson: Lesson | undefined = useMemo(() => {
    if (currentLessonId) {
      const found = allLessons.find((l) => l.id === currentLessonId);
      if (found) return found;
    }
    return resolveCurrentLesson(allLessons);
  }, [allLessons, currentLessonId]);

  const currentModule = useMemo(
    () => (course?.modules ?? []).find((m) => m.id === currentLesson?.moduleId),
    [course, currentLesson],
  );

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const lessonIndexInModule = currentModule?.lessons?.findIndex((l) => l.id === currentLesson?.id) ?? 0;

  function handleSelectLesson(lesson: Lesson) {
    setCurrentLessonId(lesson.id);
    setActiveTab('overview');
  }

  function handleContinue() {
    const next = resolveCurrentLesson(allLessons);
    if (next) {
      setCurrentLessonId(next.id);
      setExpandedModuleId(next.moduleId);
      setActiveTab('overview');
    }
  }

  if (isLoading) {
    return <div className="lrn" />;
  }

  if (!course) return null;

  return (
    <div className="lrn">
      <a
        href="/dashboard/learning"
        className="lrn-back"
        onClick={(e) => {
          e.preventDefault();
          router.push('/dashboard/learning');
        }}
      >
        <ArrowLeft size={14} /> {t('back')}
      </a>

      <div className="lrn-ph">
        <div>
          <h1 className="lrn-h1">{course.title}</h1>
          {!course.locked && (
            <p className="lrn-sub">
              {t('summaryLine', { lessons: course.totalLessons, modules: (course.modules ?? []).length })}
            </p>
          )}
        </div>
        {!course.locked && allLessons.length > 0 && (
          <button type="button" className="lrn-btn lrn-btn-acc" onClick={handleContinue}>
            {t('continueLesson')} →
          </button>
        )}
      </div>

      {course.locked ? (
        <LockedCourseState requiredPlan={course.requiredPlan!} />
      ) : !course.enrollment ? (
        <PaceSelector onSelect={(pace) => enroll.mutate({ courseId, pace })} />
      ) : allLessons.length === 0 ? (
        <p className="lrn-sub" style={{ marginTop: 24 }}>{t('noModules')}</p>
      ) : (
        <div className="lrn-pl">
          <div>
            {currentLesson && currentModule && (
              <>
                <LessonVideo
                  course={course}
                  lesson={currentLesson}
                  module={currentModule}
                  lessonIndex={lessonIndexInModule}
                  onOpenExercise={() => setActiveTab('exercise')}
                />
                <LessonHeader
                  lesson={currentLesson}
                  onToggleComplete={() => toggleProgress.mutate({ lessonId: currentLesson.id, courseId })}
                />
                <LessonTabs lesson={currentLesson} courseId={courseId} activeTab={activeTab} onTabChange={setActiveTab} />
                <LessonNav
                  previous={currentIndex > 0 ? allLessons[currentIndex - 1] : undefined}
                  next={currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined}
                  onSelect={handleSelectLesson}
                />
              </>
            )}
          </div>

          <ModuleAccordion
            course={course}
            currentLesson={currentLesson}
            expandedModuleId={expandedModuleId}
            onToggleModule={(moduleId) => setExpandedModuleId((id) => (id === moduleId ? null : moduleId))}
            onSelectLesson={handleSelectLesson}
            onToggleLessonComplete={(lessonId) => toggleProgress.mutate({ lessonId, courseId })}
          />
        </div>
      )}
    </div>
  );
}
