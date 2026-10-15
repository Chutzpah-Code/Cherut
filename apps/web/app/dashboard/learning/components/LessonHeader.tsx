'use client';

import { useTranslations } from 'next-intl';
import { Lesson } from '@/lib/api/services/learning';

export function LessonHeader({ lesson, onToggleComplete }: { lesson: Lesson; onToggleComplete: () => void }) {
  const t = useTranslations('learning.course');

  return (
    <div className="lrn-lh">
      <h2>{lesson.title}</h2>
      <button type="button" className={`lrn-done${lesson.completed ? ' y' : ''}`} onClick={onToggleComplete}>
        <i />
        <span>{lesson.completed ? t('completed') : t('markComplete')}</span>
      </button>
    </div>
  );
}
