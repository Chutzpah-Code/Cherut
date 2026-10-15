'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useUploadCourseCover } from '@/hooks/useLearning';
import { useAdminModuleUsage } from '@/hooks/useAdmin';
import { Course, CreateCourseDto, RequiredPlan } from '@/lib/api/services/learning';
import { EnrolleesModal } from './components/EnrolleesModal';

const MAX_COVER_SIZE = 2 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#3E63F5,#1B2E8F)',
  'linear-gradient(135deg,#14141C,#3A3D4E)',
  'linear-gradient(135deg,#1F9D6B,#0E5C3E)',
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

const emptyForm: CreateCourseDto = { title: '', description: '', isPublished: false, requiredPlan: undefined };

export default function AdminCoursesPage() {
  const t = useTranslations('adminCoursesPage');
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const { data: usage } = useAdminModuleUsage();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadCover = useUploadCourseCover();

  const usageByCourse = useMemo(() => new Map((usage ?? []).map((u) => [u.id, u])), [usage]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CreateCourseDto>(emptyForm);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [enrolleesCourse, setEnrolleesCourse] = useState<Course | null>(null);

  function handleCreate() {
    setEditing(null);
    setForm(emptyForm);
    setCoverError(null);
    setModalOpen(true);
  }

  function handleEdit(course: Course, e: React.MouseEvent) {
    e.stopPropagation();
    setEditing(course);
    setForm({ title: course.title, description: course.description || '', isPublished: course.isPublished, requiredPlan: course.requiredPlan });
    setCoverError(null);
    setModalOpen(true);
  }

  async function handleCoverUpload(file: File | null) {
    if (!file || !editing) return;
    setCoverError(null);
    if (!ALLOWED_COVER_TYPES.includes(file.type)) return setCoverError(t('cover.errorType'));
    if (file.size > MAX_COVER_SIZE) return setCoverError(t('cover.errorSize'));
    try {
      const updated = await uploadCover.mutateAsync({ id: editing.id, file });
      setEditing(updated);
    } catch {
      setCoverError(t('cover.errorUpload'));
    }
  }

  async function handleSave() {
    const dto: CreateCourseDto = { ...form, requiredPlan: form.requiredPlan || undefined };
    if (editing) await updateCourse.mutateAsync({ id: editing.id, dto });
    else await createCourse.mutateAsync(dto);
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(t('confirmDelete', { title: editing.title }))) return;
    await deleteCourse.mutateAsync(editing.id);
    setModalOpen(false);
  }

  if (isLoading) return <p className="adm-sub">{t('loading')}</p>;

  return (
    <div>
      <div className="adm-top">
        <div>
          <div className="adm-crumb adm-mono">{t('crumb')}</div>
          <h1 className="adm-h1">{t('title')}</h1>
          <p className="adm-sub">{t('subtitle')}</p>
        </div>
        <button type="button" className="adm-btn adm-btn-acc" onClick={handleCreate}><Plus size={15} />{t('newCourse')}</button>
      </div>

      <div className="adm-courses">
        {(courses ?? []).map((course) => {
          const u = usageByCourse.get(course.id);
          return (
            <div key={course.id} className="adm-course" onClick={() => router.push(`/admin/courses/${course.id}`)}>
              <div
                className="adm-cv"
                style={{ background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : gradientFor(course.id) }}
              >
                <span className="adm-mono">{course.requiredPlan ? t(`planOptions.${course.requiredPlan}`) : t('plan.any')}</span>
                <b>{course.title}</b>
              </div>
              <div className="adm-cb">
                <small style={{ color: 'var(--adm-mute)' }}>{t('card.lessons', { count: course.totalLessons })}</small>
                <div className="adm-cstats">
                  <div
                    onClick={(e) => { e.stopPropagation(); setEnrolleesCourse(course); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <b>{u?.enrolled ?? 0}</b>{t('card.enrolled')}
                  </div>
                  <div><b>{u ? `${u.averageProgress}%` : '—'}</b>{t('card.avgProgress')}</div>
                </div>
                <div className="adm-bar"><i style={{ width: `${u?.averageProgress ?? 0}%` }} /></div>
                <div className="adm-cf">
                  <span className={`adm-pill${course.isPublished ? ' ok' : ''}`}>{course.isPublished ? t('status.published') : t('status.draft')}</span>
                  <button type="button" className="adm-btn adm-btn-l" style={{ height: 32 }} onClick={(e) => handleEdit(course, e)}>{t('actions.edit')}</button>
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" className="adm-course adm-course-add" onClick={handleCreate}>
          <Plus size={18} />{t('newCourse')}
        </button>
      </div>

      {(courses ?? []).length === 0 && <p className="adm-empty">{t('empty')}</p>}

      {enrolleesCourse && (
        <EnrolleesModal
          courseId={enrolleesCourse.id}
          courseTitle={enrolleesCourse.title}
          onClose={() => setEnrolleesCourse(null)}
        />
      )}

      {modalOpen && (
        <div className="adm-modal-ov on" onClick={() => setModalOpen(false)}>
          <div className="adm-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? t('modal.editTitle') : t('modal.newTitle')}</h3>

            {editing ? (
              <label>
                {t('cover.label')}
                {coverError && <p style={{ color: 'var(--adm-bad)', fontSize: 12.5, margin: '4px 0' }}>{coverError}</p>}
                <div
                  className="adm-cover"
                  style={editing.coverImageUrl ? { backgroundImage: `url(${editing.coverImageUrl})` } : undefined}
                >
                  {!editing.coverImageUrl && (
                    uploadCover.isPending ? <span>…</span> : <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><ImageIcon size={20} />{t('cover.upload')}</span>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleCoverUpload(e.target.files?.[0] ?? null)} />
                  {editing.coverImageUrl && <span className="adm-btn adm-btn-l" style={{ position: 'absolute', right: 10, bottom: 10, height: 30, pointerEvents: 'none' }}>{t('cover.change')}</span>}
                </div>
              </label>
            ) : (
              <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--adm-soft)', border: '1px solid var(--adm-line)', borderRadius: 10, padding: 10, fontSize: 12.5, color: 'var(--adm-mute)' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{t('cover.saveFirst')}
              </p>
            )}

            <label>
              {t('form.titleLabel')} <span className="adm-req">*</span>
              <input className="adm-in" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('form.titlePlaceholder')} />
            </label>
            <label>
              {t('form.descriptionLabel')}
              <textarea className="adm-in" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('form.descriptionPlaceholder')} />
            </label>
            <div className="adm-two">
              <label>
                {t('form.requiredPlanLabel')}
                <select className="adm-in" value={form.requiredPlan ?? ''} onChange={(e) => setForm({ ...form, requiredPlan: (e.target.value || undefined) as RequiredPlan | undefined })}>
                  <option value="">{t('planOptions.any')}</option>
                  <option value="core">{t('planOptions.core')}</option>
                  <option value="method">{t('planOptions.method')}</option>
                  <option value="mentorship">{t('planOptions.mentorship')}</option>
                </select>
              </label>
              <label>
                {t('form.statusLabel')}
                <select className="adm-in" value={form.isPublished ? 'published' : 'draft'} onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'published' })}>
                  <option value="draft">{t('status.draft')}</option>
                  <option value="published">{t('status.published')}</option>
                </select>
              </label>
            </div>

            <div className="adm-f">
              {editing && <button type="button" className="adm-btn adm-btn-bad" style={{ marginRight: 'auto' }} onClick={handleDelete}>{t('actions.delete')}</button>}
              <button type="button" className="adm-btn adm-btn-l" onClick={() => setModalOpen(false)}>{t('form.cancel')}</button>
              <button type="button" className="adm-btn adm-btn-acc" disabled={!form.title.trim()} onClick={handleSave}>{t('form.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
