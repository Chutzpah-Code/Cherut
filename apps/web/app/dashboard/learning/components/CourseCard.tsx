'use client';

import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { Course, RequiredPlan } from '@/lib/api/services/learning';

const PLAN_LABEL: Record<RequiredPlan, string> = {
  core: 'Core',
  method: 'Method',
  mentorship: 'Mentorship',
};

// Deterministic per-course gradient (no real "kind" field to key off of —
// cycles through a small fixed palette by id so cards stay visually
// distinct without fabricating data).
const COVER_GRADIENTS = [
  'linear-gradient(135deg,#3E63F5,#1B2E8F)',
  'linear-gradient(135deg,#14141C,#3A3D4E)',
  'linear-gradient(135deg,#1F9D6B,#0E5C3E)',
  'linear-gradient(135deg,#D97706,#92400E)',
  'linear-gradient(135deg,#9333EA,#581C87)',
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

export function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const t = useTranslations('learning.page');

  return (
    <button type="button" className={`lrn-cc${course.locked ? ' locked' : ''}`} onClick={onClick}>
      <div
        className="lrn-cover"
        style={{
          background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : gradientFor(course.id),
        }}
      >
        <span className="lrn-n">{course.title}</span>
        {course.percentComplete === 100 && <span className="lrn-tag">{t('card.completed')}</span>}
      </div>
      <div className="lrn-cc-b">
        <h4>{course.title}</h4>
        {course.description && <p>{course.description}</p>}
        <div className="lrn-cc-f">
          {course.locked ? (
            <span className="lrn-st locked">
              <Lock size={11} /> {t('availableOnPlan', { plan: PLAN_LABEL[course.requiredPlan!] })}
            </span>
          ) : course.percentComplete === 0 ? (
            <>
              <span className="lrn-st new">{t('card.notStarted')}</span>
              <span>{t('card.lessons', { count: course.totalLessons })}</span>
            </>
          ) : course.percentComplete === 100 ? (
            <>
              <span className="lrn-st ok">{t('card.completed')}</span>
              <span>{t('card.lessons', { count: course.totalLessons })}</span>
            </>
          ) : (
            <>
              <div className="lrn-bar"><i style={{ width: `${course.percentComplete}%` }} /></div>
              <b>{course.percentComplete}%</b>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
