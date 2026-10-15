'use client';

import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { Course, CourseModule, Lesson } from '@/lib/api/services/learning';

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

interface LessonVideoProps {
  course: Course;
  lesson: Lesson;
  module: CourseModule;
  lessonIndex: number;
  onOpenExercise: () => void;
}

export function LessonVideo({ course, lesson, module, lessonIndex, onOpenExercise }: LessonVideoProps) {
  const t = useTranslations('learning.course');
  const embed = lesson.videoUrl ? embedUrl(lesson.videoUrl) : null;

  return (
    <div className="lrn-vcard">
      <div className="lrn-video">
        {lesson.videoUrl ? (
          embed ? (
            <iframe
              src={embed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video controls src={lesson.videoUrl} poster={course.coverImageUrl} />
          )
        ) : (
          <span className="lrn-play" />
        )}
        <div className="lrn-cap">
          <span className="lrn-mono">{t('moduleLessonLabel', { module: String((module.order ?? 0) + 1).padStart(2, '0'), lesson: lessonIndex + 1 })}</span>
          <h2>{lesson.title}</h2>
        </div>
      </div>
      <div className="lrn-vfoot">
        <div className="lrn-bar"><i style={{ width: lesson.completed ? '100%' : '0%' }} /></div>
        {lesson.exerciseText && (
          <div className="lrn-vrow">
            <span>{t('tabs.exercise')}: {lesson.exerciseText}</span>
            <button type="button" className="lrn-lnk" onClick={onOpenExercise}>{t('openExercise')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
