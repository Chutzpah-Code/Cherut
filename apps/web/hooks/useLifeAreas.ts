import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeAreasApi, CreateLifeAreaDto, UpdateLifeAreaDto } from '@/lib/api/services/lifeAreas';

export const useLifeAreaImpact = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['lifeAreas', id, 'impact'],
    queryFn: () => lifeAreasApi.getImpact(id),
    enabled: enabled && !!id,
    staleTime: 0,
    gcTime: 60 * 1000,
  });
};

export const useLifeAreas = () => {
  return useQuery({
    queryKey: ['lifeAreas'],
    queryFn: lifeAreasApi.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLifeArea = (id: string) => {
  return useQuery({
    queryKey: ['lifeAreas', id],
    queryFn: () => lifeAreasApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateLifeAreaDto) => lifeAreasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifeAreas'] });
    },
  });
};

export const useUpdateLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLifeAreaDto }) =>
      lifeAreasApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifeAreas'] });
    },
  });
};

export const useDeleteLifeArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lifeAreasApi.delete(id),
    onSuccess: () => {
      // Deleting a custom life area cascades to objectives/habits/tasks
      // linked to it server-side — refresh those lists too.
      queryClient.invalidateQueries({ queryKey: ['lifeAreas'] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
