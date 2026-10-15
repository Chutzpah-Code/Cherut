'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lesson } from '@/lib/api/services/learning';
import { useSaveLessonProgressNotes } from '@/hooks/useLearning';

export type LessonTab = 'overview' | 'exercise' | 'notes';

interface LessonTabsProps {
  lesson: Lesson;
  courseId: string;
  activeTab: LessonTab;
  onTabChange: (tab: LessonTab) => void;
}

export function LessonTabs({ lesson, courseId, activeTab, onTabChange }: LessonTabsProps) {
  const t = useTranslations('learning.course');
  const saveNotes = useSaveLessonProgressNotes();

  const [exerciseAnswer, setExerciseAnswer] = useState(lesson.exerciseAnswer ?? '');
  const [notes, setNotes] = useState(lesson.notes ?? '');
  const [savedField, setSavedField] = useState<'exercise' | 'notes' | null>(null);

  useEffect(() => {
    setExerciseAnswer(lesson.exerciseAnswer ?? '');
    setNotes(lesson.notes ?? '');
    setSavedField(null);
  }, [lesson.id, lesson.exerciseAnswer, lesson.notes]);

  function save(field: 'exercise' | 'notes', dto: { exerciseAnswer?: string; notes?: string }) {
    saveNotes.mutate(
      { lessonId: lesson.id, courseId, dto },
      { onSuccess: () => setSavedField(field) },
    );
  }

  const tabs: LessonTab[] = ['overview', 'exercise', 'notes'];

  return (
    <>
      <div className="lrn-tabs">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={activeTab === tab ? 'on' : ''} onClick={() => onTabChange(tab)}>
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="lrn-tp">
          {lesson.content ? (
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{lesson.content}</p>
          ) : (
            <p style={{ color: 'var(--lrn-mute)', margin: 0 }}>{t('overviewEmpty')}</p>
          )}
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="lrn-tp">
          <div className="lrn-ex">
            {lesson.exerciseText ? (
              <>
                <h4>{t('tabs.exercise')}</h4>
                <p style={{ color: 'var(--lrn-mute)', fontSize: 14, margin: 0 }}>{lesson.exerciseText}</p>
                <textarea
                  value={exerciseAnswer}
                  onChange={(e) => setExerciseAnswer(e.target.value)}
                  placeholder={t('exercisePlaceholder')}
                />
                <div className="lrn-row">
                  <span className="lrn-saved">{savedField === 'exercise' ? t('saved') : ''}</span>
                  <button
                    type="button"
                    className="lrn-btn lrn-btn-acc"
                    style={{ height: 34 }}
                    disabled={saveNotes.isPending}
                    onClick={() => save('exercise', { exerciseAnswer })}
                  >
                    {t('saveAnswer')}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--lrn-mute)', margin: 0 }}>{t('exerciseEmpty')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="lrn-tp">
          <div className="lrn-ex">
            <h4>{t('tabs.notes')}</h4>
            <p style={{ color: 'var(--lrn-mute)', fontSize: 14, margin: 0 }}>{t('notesSubtitle')}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
            />
            <div className="lrn-row">
              <span className="lrn-saved">{savedField === 'notes' ? t('saved') : ''}</span>
              <button
                type="button"
                className="lrn-btn lrn-btn-acc"
                style={{ height: 34 }}
                disabled={saveNotes.isPending}
                onClick={() => save('notes', { notes })}
              >
                {t('saveNote')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
