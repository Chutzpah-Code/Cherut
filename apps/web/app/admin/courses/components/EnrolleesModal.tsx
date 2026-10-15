'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useAdminCourseEnrollments } from '@/hooks/useAdmin';

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  return base.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function EnrolleesModal({ courseId, courseTitle, onClose }: { courseId: string; courseTitle: string; onClose: () => void }) {
  const t = useTranslations('adminCoursesPage.enrollees');
  const { data: enrollees, isLoading } = useAdminCourseEnrollments(courseId);

  return (
    <div className="adm-modal-ov on" onClick={onClose}>
      <div className="adm-box" onClick={(e) => e.stopPropagation()} style={{ width: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{t('title')}</h3>
            <p>{courseTitle}</p>
          </div>
          <button type="button" className="adm-ia" onClick={onClose} aria-label={t('close')}><X size={16} /></button>
        </div>

        {isLoading ? (
          <p className="adm-sub">{t('loading')}</p>
        ) : !enrollees || enrollees.length === 0 ? (
          <p className="adm-empty">{t('empty')}</p>
        ) : (
          <div className="adm-feed" style={{ maxHeight: 360, overflow: 'auto' }}>
            {enrollees.map((e) => (
              <div key={e.uid}>
                <span className="adm-av">{initials(e.displayName || e.email || '?')}</span>
                <p><b>{e.displayName || e.email || t('unknownUser')}</b></p>
                <small>{e.percentComplete}%</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
