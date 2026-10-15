'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useCourses, useCourse } from '@/hooks/useLearning';
import { CourseCard } from './components/CourseCard';
import { CourseFilters, CourseFilter } from './components/CourseFilters';
import { ResumeCard } from './components/ResumeCard';
import { resolveCurrentLesson } from './lib/resolveCurrentLesson';

export default function LearningPage() {
  const t = useTranslations('learning.page');
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const [filter, setFilter] = useState<CourseFilter>('all');

  // Resume target: the enrolled, in-progress course most recently touched.
  const resumeCourseId = useMemo(() => {
    const inProgress = (courses ?? []).filter((c) => !c.locked && c.percentComplete > 0 && c.percentComplete < 100);
    if (inProgress.length === 0) return null;
    return inProgress.sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''))[0].id;
  }, [courses]);

  const { data: resumeCourseDetail } = useCourse(resumeCourseId ?? '');

  const resumeLesson = useMemo(() => {
    if (!resumeCourseDetail?.modules) return undefined;
    return resolveCurrentLesson(resumeCourseDetail.modules.flatMap((m) => m.lessons ?? []));
  }, [resumeCourseDetail]);

  const resumeModule = useMemo(
    () => resumeCourseDetail?.modules?.find((m) => m.id === resumeLesson?.moduleId),
    [resumeCourseDetail, resumeLesson],
  );

  const filteredCourses = useMemo(() => {
    return (courses ?? []).filter((c) => {
      if (filter === 'all') return true;
      if (filter === 'completed') return c.percentComplete === 100;
      if (filter === 'notStarted') return c.percentComplete === 0;
      return c.percentComplete > 0 && c.percentComplete < 100;
    });
  }, [courses, filter]);

  if (isLoading) {
    return (
      <div className="lrn">
        <p className="lrn-sub">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="lrn">
      <h1 className="lrn-h1">{t('title')}</h1>
      <p className="lrn-sub">{t('subtitle')}</p>

      {resumeCourseDetail && resumeLesson && resumeModule && (
        <ResumeCard
          course={resumeCourseDetail}
          moduleTitle={resumeModule.title}
          lessonTitle={resumeLesson.title}
          onContinue={() => router.push(`/dashboard/learning/${resumeCourseDetail.id}`)}
        />
      )}

      <div className="lrn-sec-h">
        <h3>{t('sectionTitle')}</h3>
        <CourseFilters value={filter} onChange={setFilter} />
      </div>

      {!courses || courses.length === 0 ? (
        <div className="lrn-empty">
          <GraduationCap size={28} color="var(--lrn-faint)" />
          <p>{t('empty')}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="lrn-empty">
          <p>{t('noMatch')}</p>
        </div>
      ) : (
        <div className="lrn-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onClick={() => router.push(`/dashboard/learning/${course.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
