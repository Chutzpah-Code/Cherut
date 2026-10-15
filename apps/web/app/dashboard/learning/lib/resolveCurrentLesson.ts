import { Lesson } from '@/lib/api/services/learning';

// First incomplete lesson, else the last one — used by both the player
// (default lesson on load / "Continue lesson") and the catalog's resume
// card (which lesson title to show for the in-progress course).
export function resolveCurrentLesson(lessons: Lesson[]): Lesson | undefined {
  return lessons.find((l) => !l.completed) ?? lessons[lessons.length - 1];
}
