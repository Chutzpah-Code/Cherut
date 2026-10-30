import { Objective, KeyResult, UpdateObjectiveDto } from '@/lib/api/services/objectives';

export interface ObjectiveFormState {
  title: string;
  description: string;
  lifeAreaId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function toObjectiveFormState(objective: Objective | null): ObjectiveFormState {
  if (!objective) {
    return {
      title: '',
      description: '',
      lifeAreaId: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }
  const parseDate = (value: string) => {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  return {
    title: objective.title,
    description: objective.description || '',
    lifeAreaId: objective.lifeAreaId,
    startDate: objective.startDate ? parseDate(objective.startDate) : new Date(),
    endDate: objective.endDate ? parseDate(objective.endDate) : new Date(),
  };
}

export function toObjectiveDto(formState: ObjectiveFormState): UpdateObjectiveDto {
  return {
    title: formState.title,
    description: formState.description.trim() || undefined,
    lifeAreaId: formState.lifeAreaId || undefined,
    startDate: formState.startDate ? formState.startDate.toISOString().split('T')[0] : undefined,
    endDate: formState.endDate ? formState.endDate.toISOString().split('T')[0] : undefined,
  };
}

export interface KeyResultDraft {
  localId: string;
  id?: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
}

let draftCounter = 0;
export function newLocalId(): string {
  draftCounter += 1;
  return `draft-${Date.now()}-${draftCounter}`;
}

export function emptyDraft(): KeyResultDraft {
  return {
    localId: newLocalId(),
    id: undefined,
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    isCompleted: false,
  };
}

export function toDraft(kr: KeyResult): KeyResultDraft {
  return {
    localId: kr.id,
    id: kr.id,
    title: kr.title,
    description: kr.description || '',
    targetValue: kr.targetValue,
    currentValue: kr.currentValue,
    unit: kr.unit,
    isCompleted: !!kr.isCompleted,
  };
}

export function isDraftFilled(draft: KeyResultDraft): boolean {
  return !!draft.title.trim() && draft.targetValue > 0 && !!draft.unit.trim();
}
