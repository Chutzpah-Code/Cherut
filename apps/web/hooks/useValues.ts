import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { valuesApi, CreateValueDto, UpdateValueDto } from '@/lib/api/services/values';

export const useValues = () => {
  return useQuery({
    queryKey: ['values'],
    queryFn: valuesApi.getAll,
  });
};

export const useValue = (id: string) => {
  return useQuery({
    queryKey: ['values', id],
    queryFn: () => valuesApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateValueDto) => valuesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};

export const useUpdateValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateValueDto }) =>
      valuesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};

export const useDeleteValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => valuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};