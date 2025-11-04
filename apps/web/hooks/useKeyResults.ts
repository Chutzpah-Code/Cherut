import { useQuery } from '@tanstack/react-query';
import { keyResultsApi } from '@/lib/api/services/key-results';

export const useKeyResults = (objectiveId?: string) => {
  return useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: () => keyResultsApi.getAll(objectiveId),
  });
};
