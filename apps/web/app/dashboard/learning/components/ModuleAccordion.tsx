'use client';

import { useTranslations } from 'next-intl';
import { Course, CourseModule, Lesson } from '@/lib/api/services/learning';

interface ModuleAccordionProps {
  course: Course;
  currentLesson: Lesson | undefined;
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onToggleLessonComplete: (lessonId: string) => void;
}

export function ModuleAccordion({
  course,
  currentLesson,
  expandedModuleId,
  onToggleModule,
  onSelectLesson,
  onToggleLessonComplete,
}: ModuleAccordionProps) {
  const t = useTranslations('learning.course');

  return (
    <aside className="lrn-ol">
      <div className="lrn-ol-h">
        <b>{t('modules')}</b>
        <small style={{ color: 'var(--lrn-mute)', fontSize: 12.5 }}>{course.percentComplete}% {t('complete')}</small>
      </div>
      {(course.modules ?? []).map((courseModule: CourseModule, idx: number) => {
        const lessons = courseModule.lessons ?? [];
        const completedCount = lessons.filter((l) => l.completed).length;
        const modulePercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
        const isOpen = expandedModuleId === courseModule.id;

        return (
          <div key={courseModule.id} className={`lrn-mod${isOpen ? ' open' : ''}`}>
            <button type="button" onClick={() => onToggleModule(courseModule.id)}>
              <span className="lrn-n">{String(idx + 1).padStart(2, '0')}</span>
              <span>
                <b>{courseModule.title}</b>
                <small>{t('lessonCount', { count: lessons.length })}</small>
              </span>
              {modulePercent === 100 ? (
                <span className="lrn-sdot" title={t('complete')} />
              ) : (
                <span className={`lrn-pc${modulePercent > 0 ? ' go' : ''}`}>{modulePercent}%</span>
              )}
            </button>
            <div className="lrn-ls">
              <div>
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    className={lesson.id === currentLesson?.id ? 'cur' : ''}
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <i
                      className={lesson.completed ? 'y' : ''}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLessonComplete(lesson.id);
                      }}
                    />
                    <span className="lrn-lt">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
