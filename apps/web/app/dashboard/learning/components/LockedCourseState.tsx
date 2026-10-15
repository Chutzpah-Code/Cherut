'use client';

import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { RequiredPlan } from '@/lib/api/services/learning';

const PLAN_LABEL: Record<RequiredPlan, string> = {
  core: 'Core',
  method: 'Method',
  mentorship: 'Mentorship',
};

export function LockedCourseState({ requiredPlan }: { requiredPlan: RequiredPlan }) {
  const t = useTranslations('learning.course');

  return (
    <div className="lrn-locked">
      <Lock size={30} color="var(--lrn-faint)" />
      <span className="lrn-st locked">{t('availableOnPlan', { plan: PLAN_LABEL[requiredPlan] })}</span>
      <p style={{ color: 'var(--lrn-mute)', fontSize: 13.5, maxWidth: 340, margin: 0 }}>{t('lockedBody')}</p>
    </div>
  );
}
