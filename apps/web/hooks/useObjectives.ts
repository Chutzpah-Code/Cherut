import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectivesApi, CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto } from '@/lib/api/services/objectives';

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

export const useCompleteObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.completeObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

// Key Results hooks
export const useCreateKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, dto }: { objectiveId: string; dto: CreateKeyResultDto }) =>
      objectivesApi.createKeyResult(objectiveId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useUpdateKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId, dto }: { objectiveId: string; keyResultId: string; dto: UpdateKeyResultDto }) =>
      objectivesApi.updateKeyResult(objectiveId, keyResultId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useDeleteKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
      objectivesApi.deleteKeyResult(objectiveId, keyResultId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useCompleteKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
      objectivesApi.completeKeyResult(objectiveId, keyResultId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

// Toggle completion hooks
export const useToggleObjectiveCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.toggleObjectiveCompletion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

export const useToggleKeyResultCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
      objectivesApi.toggleKeyResultCompletion(objectiveId, keyResultId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};

// Archive hook
export const useArchiveObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.archiveObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
};
