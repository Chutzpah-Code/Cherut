import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeAreasApi, CreateLifeAreaDto, UpdateLifeAreaDto } from '@/lib/api/services/lifeAreas';

export const useLifeAreas = () => {
  return useQuery({
    queryKey: ['lifeAreas'],
    queryFn: lifeAreasApi.getAll,
  });
};

export const useLifeArea = (id: string) => {
  return useQuery({
    queryKey: ['lifeAreas', id],
    queryFn: () => lifeAreasApi.getOne(id),
    enabled: !!id,
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
      queryClient.invalidateQueries({ queryKey: ['lifeAreas'] });
    },
  });
};
