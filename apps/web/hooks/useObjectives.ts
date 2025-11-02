import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectivesApi, CreateObjectiveDto, UpdateObjectiveDto } from '@/lib/api/services/objectives';

export const useObjectives = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['objectives', lifeAreaId],
    queryFn: () => objectivesApi.getAll(lifeAreaId),
  });
};

export const useObjective = (id: string) => {
  return useQuery({
    queryKey: ['objectives', id],
    queryFn: () => objectivesApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateObjectiveDto) => objectivesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useUpdateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateObjectiveDto }) =>
      objectivesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};
