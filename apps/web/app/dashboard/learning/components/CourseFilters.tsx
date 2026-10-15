'use client';

import { useTranslations } from 'next-intl';

export type CourseFilter = 'all' | 'inProgress' | 'completed' | 'notStarted';

export function CourseFilters({ value, onChange }: { value: CourseFilter; onChange: (v: CourseFilter) => void }) {
  const t = useTranslations('learning.page.filters');
  const options: CourseFilter[] = ['all', 'inProgress', 'completed', 'notStarted'];

  return (
    <div className="lrn-chips" role="tablist">
      {options.map((opt) => (
        <button key={opt} type="button" className={value === opt ? 'on' : ''} onClick={() => onChange(opt)}>
          {t(opt)}
        </button>
      ))}
    </div>
  );
}
