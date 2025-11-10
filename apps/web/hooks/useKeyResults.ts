import { useQuery } from '@tanstack/react-query';
import { objectivesApi, KeyResult } from '@/lib/api/services/objectives';

/**
 * Hook to get all Key Results from all Objectives
 * Since Key Results are nested within Objectives, we extract them from the Objectives response
 */
export const useKeyResults = (objectiveId?: string) => {
  return useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: async (): Promise<KeyResult[]> => {
      // Fetch all objectives (which include their key results)
      const objectives = await objectivesApi.getAll(undefined);

      // Extract all key results from all objectives
      const allKeyResults: KeyResult[] = [];

      objectives.forEach(objective => {
        if (objective.keyResults && objective.keyResults.length > 0) {
          // Filter by objectiveId if provided
          if (!objectiveId || objective.id === objectiveId) {
            allKeyResults.push(...objective.keyResults);
          }
        }
      });

      return allKeyResults;
    },
  });
};
