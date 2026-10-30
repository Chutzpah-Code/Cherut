import { VisionBoardItem, UpdateVisionBoardItemDto, CreateVisionBoardItemDto } from '@/lib/api/services/vision-board';

export interface EditDrawerFormState {
  title: string;
  description: string;
  fullDescription: string;
  dueDateValue: Date | null;
  completed: boolean;
  imageUrl: string;
  objectiveId: string | undefined;
  plannedPracticeDurationMinutes: 5 | 10 | 15;
  currentEmotion: string | undefined;
  currentEnergy: number;
  currentConfidence: number;
  desiredState: string;
  empoweringBelief: string;
  outcomeVisualizationText: string;
  processVisualizationText: string;
  likelyObstacle: string;
  obstacleResponse: string;
  nextAction: string;
  nextActionDueDateValue: Date | null;
  audioType: 'none' | 'system' | 'file';
  audioTrackId: string | undefined;
  audioFileUrl: string | undefined;
  audioDurationSec: number | undefined;
  audioSizeBytes: number | undefined;
}

export function toFormState(item: VisionBoardItem | null): EditDrawerFormState {
  if (!item) {
    return {
      title: '',
      description: '',
      fullDescription: '',
      dueDateValue: null,
      completed: false,
      imageUrl: '',
      objectiveId: undefined,
      plannedPracticeDurationMinutes: 10,
      currentEmotion: undefined,
      currentEnergy: 5,
      currentConfidence: 5,
      desiredState: '',
      empoweringBelief: '',
      outcomeVisualizationText: '',
      processVisualizationText: '',
      likelyObstacle: '',
      obstacleResponse: '',
      nextAction: '',
      nextActionDueDateValue: null,
      audioType: 'none',
      audioTrackId: undefined,
      audioFileUrl: undefined,
      audioDurationSec: undefined,
      audioSizeBytes: undefined,
    };
  }
  return {
    title: item.title,
    description: item.description || '',
    fullDescription: item.fullDescription || '',
    dueDateValue: item.dueDate ? new Date(item.dueDate + 'T00:00:00') : null,
    completed: !!item.completed,
    imageUrl: item.imageUrl,
    objectiveId: item.objectiveId,
    plannedPracticeDurationMinutes: item.plannedPracticeDurationMinutes ?? 10,
    currentEmotion: item.currentEmotion,
    currentEnergy: item.currentEnergy ?? 5,
    currentConfidence: item.currentConfidence ?? 5,
    desiredState: item.desiredState || '',
    empoweringBelief: item.empoweringBelief || '',
    outcomeVisualizationText: item.outcomeVisualizationText || '',
    processVisualizationText: item.processVisualizationText || '',
    likelyObstacle: item.likelyObstacle || '',
    obstacleResponse: item.obstacleResponse || '',
    nextAction: item.nextAction || '',
    nextActionDueDateValue: item.nextActionDueDate ? new Date(item.nextActionDueDate + 'T00:00:00') : null,
    audioType: item.audioType ?? 'none',
    audioTrackId: item.audioTrackId,
    audioFileUrl: item.audioFileUrl,
    audioDurationSec: item.audioDurationSec,
    audioSizeBytes: item.audioSizeBytes,
  };
}

export function toDto(formState: EditDrawerFormState): UpdateVisionBoardItemDto {
  return {
    title: formState.title,
    description: formState.description.trim() || undefined,
    fullDescription: formState.fullDescription.trim() || undefined,
    dueDate: formState.dueDateValue ? formState.dueDateValue.toISOString().split('T')[0] : undefined,
    imageUrl: formState.imageUrl || undefined,
    completed: formState.completed,
    objectiveId: formState.objectiveId || undefined,
    plannedPracticeDurationMinutes: formState.plannedPracticeDurationMinutes,
    currentEmotion: formState.currentEmotion || undefined,
    currentEnergy: formState.currentEnergy,
    currentConfidence: formState.currentConfidence,
    desiredState: formState.desiredState.trim() || undefined,
    empoweringBelief: formState.empoweringBelief.trim() || undefined,
    outcomeVisualizationText: formState.outcomeVisualizationText.trim() || undefined,
    processVisualizationText: formState.processVisualizationText.trim() || undefined,
    likelyObstacle: formState.likelyObstacle.trim() || undefined,
    obstacleResponse: formState.obstacleResponse.trim() || undefined,
    nextAction: formState.nextAction.trim() || undefined,
    nextActionDueDate: formState.nextActionDueDateValue
      ? formState.nextActionDueDateValue.toISOString().split('T')[0]
      : undefined,
    audioType: formState.audioType,
    audioTrackId: formState.audioType === 'system' ? formState.audioTrackId : undefined,
    audioFileUrl: formState.audioType === 'file' ? formState.audioFileUrl : undefined,
    audioDurationSec: formState.audioType === 'file' ? formState.audioDurationSec : undefined,
    audioSizeBytes: formState.audioType === 'file' ? formState.audioSizeBytes : undefined,
  };
}

export function toCreateDto(formState: EditDrawerFormState): CreateVisionBoardItemDto {
  return {
    title: formState.title.trim(),
    description: formState.description.trim() || undefined,
    fullDescription: formState.fullDescription.trim() || undefined,
    dueDate: formState.dueDateValue ? formState.dueDateValue.toISOString().split('T')[0] : undefined,
    imageUrl: formState.imageUrl,
    completed: formState.completed,
    objectiveId: formState.objectiveId || undefined,
    plannedPracticeDurationMinutes: formState.plannedPracticeDurationMinutes,
    currentEmotion: formState.currentEmotion || undefined,
    currentEnergy: formState.currentEnergy,
    currentConfidence: formState.currentConfidence,
    desiredState: formState.desiredState.trim() || undefined,
    empoweringBelief: formState.empoweringBelief.trim() || undefined,
    outcomeVisualizationText: formState.outcomeVisualizationText.trim() || undefined,
    processVisualizationText: formState.processVisualizationText.trim() || undefined,
    likelyObstacle: formState.likelyObstacle.trim() || undefined,
    obstacleResponse: formState.obstacleResponse.trim() || undefined,
    nextAction: formState.nextAction.trim() || undefined,
    nextActionDueDate: formState.nextActionDueDateValue
      ? formState.nextActionDueDateValue.toISOString().split('T')[0]
      : undefined,
    audioType: formState.audioType,
    audioTrackId: formState.audioType === 'system' ? formState.audioTrackId : undefined,
    audioFileUrl: formState.audioType === 'file' ? formState.audioFileUrl : undefined,
    audioDurationSec: formState.audioType === 'file' ? formState.audioDurationSec : undefined,
    audioSizeBytes: formState.audioType === 'file' ? formState.audioSizeBytes : undefined,
  };
}

export type SetField = <K extends keyof EditDrawerFormState>(key: K, value: EditDrawerFormState[K]) => void;
