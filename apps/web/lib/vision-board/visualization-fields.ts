import { VisionBoardItem } from '@/lib/api/services/vision-board';

// The 8 fields that count toward the "X/8" visualization progress — current
// state (currentEmotion/currentEnergy/currentConfidence) is NOT among them,
// since those are always-defaulted "current state" fields, not visualization
// content the user writes.
const VISUALIZATION_PROGRESS_FIELDS = [
  'desiredState',
  'empoweringBelief',
  'outcomeVisualizationText',
  'processVisualizationText',
  'likelyObstacle',
  'obstacleResponse',
  'nextAction',
  'nextActionDueDate',
] as const satisfies readonly (keyof VisionBoardItem)[];

export const VISUALIZATION_PROGRESS_TOTAL = VISUALIZATION_PROGRESS_FIELDS.length;

export function countFilledVisualizationFields(item: Partial<VisionBoardItem>): number {
  return VISUALIZATION_PROGRESS_FIELDS.reduce((count, field) => {
    const value = item[field];
    return count + (typeof value === 'string' && value.trim() ? 1 : 0);
  }, 0);
}
