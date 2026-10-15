'use client';

import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { Course } from '@/lib/api/services/learning';

interface ResumeCardProps {
  course: Course;
  moduleTitle: string;
  lessonTitle: string;
  onContinue: () => void;
}

export function ResumeCard({ course, moduleTitle, lessonTitle, onContinue }: ResumeCardProps) {
  const t = useTranslations('learning.page.resume');

  return (
    <div className="lrn-resume">
      <div className="lrn-resume-l">
        <span className="lrn-mono">{t('label')}</span>
        <h2>{course.title}</h2>
        <p>{moduleTitle} · {lessonTitle}</p>
        <div className="lrn-bar"><i style={{ width: `${course.percentComplete}%` }} /></div>
        <div className="lrn-row">
          <button type="button" className="lrn-btn lrn-btn-w" onClick={onContinue}>{t('cta')} →</button>
          <small>{t('meta', { percent: course.percentComplete, lessons: course.totalLessons })}</small>
        </div>
      </div>
      <div
        className="lrn-resume-r"
        onClick={onContinue}
        style={course.coverImageUrl ? { background: `url(${course.coverImageUrl}) center/cover` } : undefined}
      >
        <span className="lrn-play" />
      </div>
    </div>
  );
}
