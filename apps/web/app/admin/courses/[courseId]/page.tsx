'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, Play } from 'lucide-react';
import {
  useCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/hooks/useLearning';
import { CourseModule, Lesson, CreateCourseModuleDto, CreateLessonDto } from '@/lib/api/services/learning';

const emptyModuleForm: CreateCourseModuleDto = { title: '', description: '' };
const emptyLessonForm: CreateLessonDto = { title: '', content: '', videoUrl: '', exerciseText: '', templateText: '' };

export default function AdminCourseDetailPage() {
  const t = useTranslations('adminCourseEditorPage');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useCourse(courseId);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<CreateCourseModuleDto>(emptyModuleForm);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<CreateLessonDto>(emptyLessonForm);

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCreateModule() {
    setEditingModule(null);
    setModuleForm(emptyModuleForm);
    setModuleModalOpen(true);
  }

  function handleEditModule(courseModule: CourseModule, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingModule(courseModule);
    setModuleForm({ title: courseModule.title, description: courseModule.description || '' });
    setModuleModalOpen(true);
  }

  async function handleDeleteModule(courseModule: CourseModule, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(t('confirmDeleteModule', { title: courseModule.title }))) return;
    await deleteModule.mutateAsync({ id: courseModule.id, courseId });
  }

  async function handleSaveModule() {
    if (editingModule) await updateModule.mutateAsync({ id: editingModule.id, courseId, dto: moduleForm });
    else await createModule.mutateAsync({ courseId, dto: moduleForm });
    setModuleModalOpen(false);
  }

  function handleCreateLesson(moduleId: string) {
    setEditingLesson(null);
    setLessonModuleId(moduleId);
    setLessonForm(emptyLessonForm);
    setLessonModalOpen(true);
  }

  async function handleDeleteLesson(lesson: Lesson) {
    await deleteLesson.mutateAsync({ id: lesson.id, courseId });
  }

  async function handleSaveLesson() {
    if (!lessonModuleId) return;
    if (editingLesson) await updateLesson.mutateAsync({ id: editingLesson.id, courseId, dto: lessonForm });
    else await createLesson.mutateAsync({ moduleId: lessonModuleId, courseId, dto: lessonForm });
    setLessonModalOpen(false);
  }

  if (isLoading) return <p className="adm-sub">{t('loading') ?? '…'}</p>;
  if (!course) return null;

  return (
    <div>
      <button type="button" className="adm-back" onClick={() => router.push('/admin/courses')}>
        <ArrowLeft size={14} />{t('backToCourses')}
      </button>

      <div className="adm-chead">
        <div
          className="adm-cv"
          style={{ background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : 'radial-gradient(110% 110% at 0% 0%,#3E63F5 0%,#1B2E8F 60%,#0A0D1E 100%)' }}
        />
        <div>
          <h1 className="adm-h1">{course.title}</h1>
          <p className="adm-sub">{course.description || t('noModules')}</p>
          <div className="adm-cmeta">
            <span className={`adm-pill${course.isPublished ? ' ok' : ''}`}>{course.isPublished ? t('status.published') : t('status.draft')}</span>
            <span className="adm-pill acc">{course.requiredPlan ? t(`planOptions.${course.requiredPlan}`) : t('plan.any')}</span>
          </div>
        </div>
        <div className="adm-acts">
          <button type="button" className="adm-btn adm-btn-acc" onClick={handleCreateModule}><Plus size={15} />{t('newModule')}</button>
        </div>
      </div>

      {(course.modules ?? []).length === 0 ? (
        <div className="adm-mempty">
          <b style={{ color: 'var(--adm-ink)' }}>{t('noModules')}</b>
          <button type="button" className="adm-btn adm-btn-acc" onClick={handleCreateModule}><Plus size={15} />{t('newModule')}</button>
        </div>
      ) : (
        (course.modules ?? []).map((courseModule, idx) => {
          const isOpen = openModules.has(courseModule.id);
          return (
            <div key={courseModule.id} className={`adm-mod${isOpen ? ' open' : ''}`}>
              <div className="adm-mod-h" onClick={() => toggleModule(courseModule.id)}>
                <span className="adm-n">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <b>{courseModule.title}</b>
                  <small>{t('lessonCount', { count: (courseModule.lessons ?? []).length })}{courseModule.description ? ' · ' + courseModule.description : ''}</small>
                </div>
                <div className="adm-mod-a">
                  <button type="button" className="adm-ia" aria-label={t('editModule')} onClick={(e) => handleEditModule(courseModule, e)}><Edit2 size={14} /></button>
                  <button type="button" className="adm-ia" aria-label={t('deleteModule')} onClick={(e) => handleDeleteModule(courseModule, e)}><Trash2 size={14} /></button>
                </div>
                <ChevronDown size={16} className="adm-chev" />
              </div>
              <div className="adm-mod-b">
                <div>
                  <div className="adm-lessons">
                    {(courseModule.lessons ?? []).map((lesson) => (
                      <div key={lesson.id} className="adm-les">
                        <span className="adm-k"><Play size={11} /></span>
                        <span>{lesson.title}</span>
                        <button
                          type="button"
                          className="adm-ia del"
                          aria-label={t('deleteLesson')}
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {(courseModule.lessons ?? []).length === 0 && <p className="adm-nol">{t('noLessons')}</p>}
                    <button type="button" className="adm-addl" onClick={() => handleCreateLesson(courseModule.id)}>
                      <Plus size={14} />{t('addLesson')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {moduleModalOpen && (
        <div className="adm-modal-ov on" onClick={() => setModuleModalOpen(false)}>
          <div className="adm-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editingModule ? t('moduleModal.editTitle') : t('moduleModal.newTitle')}</h3>
            <label>
              {t('moduleModal.titleLabel')} <span className="adm-req">*</span>
              <input className="adm-in" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder={t('moduleModal.titlePlaceholder')} />
            </label>
            <label>
              {t('moduleModal.descriptionLabel')}
              <textarea className="adm-in" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
            </label>
            <div className="adm-f">
              <button type="button" className="adm-btn adm-btn-l" onClick={() => setModuleModalOpen(false)}>{t('cancel')}</button>
              <button type="button" className="adm-btn adm-btn-acc" disabled={!moduleForm.title.trim()} onClick={handleSaveModule}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {lessonModalOpen && (
        <div className="adm-modal-ov on" onClick={() => setLessonModalOpen(false)}>
          <div className="adm-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editingLesson ? t('lessonModal.editTitle') : t('lessonModal.newTitle')}</h3>
            <label>
              {t('lessonModal.titleLabel')} <span className="adm-req">*</span>
              <input className="adm-in" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
            </label>
            <label>
              {t('lessonModal.contentLabel')}
              <textarea className="adm-in" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
            </label>
            <label>
              {t('lessonModal.videoUrlLabel')}
              <input className="adm-in" value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder={t('lessonModal.videoUrlPlaceholder')} />
            </label>
            <label>
              {t('lessonModal.exerciseLabel')}
              <textarea className="adm-in" value={lessonForm.exerciseText} onChange={(e) => setLessonForm({ ...lessonForm, exerciseText: e.target.value })} />
            </label>
            <label>
              {t('lessonModal.templateLabel')}
              <textarea className="adm-in" value={lessonForm.templateText} onChange={(e) => setLessonForm({ ...lessonForm, templateText: e.target.value })} />
            </label>
            <div className="adm-f">
              <button type="button" className="adm-btn adm-btn-l" onClick={() => setLessonModalOpen(false)}>{t('cancel')}</button>
              <button type="button" className="adm-btn adm-btn-acc" disabled={!lessonForm.title.trim()} onClick={handleSaveLesson}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
