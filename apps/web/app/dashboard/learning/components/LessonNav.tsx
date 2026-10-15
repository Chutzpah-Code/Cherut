'use client';

import { useTranslations } from 'next-intl';
import { Lesson } from '@/lib/api/services/learning';

export function LessonNav({
  previous,
  next,
  onSelect,
}: {
  previous: Lesson | undefined;
  next: Lesson | undefined;
  onSelect: (lesson: Lesson) => void;
}) {
  const t = useTranslations('learning.course');

  return (
    <div className="lrn-pn">
      <button type="button" disabled={!previous} onClick={() => previous && onSelect(previous)}>
        <small>{t('previous')}</small>
        <b>{previous ? previous.title : '—'}</b>
      </button>
      <button type="button" disabled={!next} onClick={() => next && onSelect(next)}>
        <small>{t('next')}</small>
        <b>{next ? next.title : '—'}</b>
      </button>
    </div>
  );
}
