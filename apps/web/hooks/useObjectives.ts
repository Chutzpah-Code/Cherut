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

// Toggle completion hooks - OTIMIZADO com Optimistic Updates
export const useToggleObjectiveCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.toggleObjectiveCompletion(id),
    // Optimistic update - atualiza UI ANTES da requisição terminar
    onMutate: async (id) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: ['objectives'] });

      // Salva estado anterior para rollback
      const previousObjectives = queryClient.getQueryData(['objectives', undefined]);

      // Atualiza cache otimisticamente
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) =>
          obj.id === id ? { ...obj, status: obj.status === 'completed' ? 'active' : 'completed' } : obj
        );
      });

      return { previousObjectives };
    },
    onError: (_err, _id, context: any) => {
      // Reverte em caso de erro
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
    },
    onSettled: () => {
      // Revalida apenas essa query específica
      queryClient.invalidateQueries({ queryKey: ['objectives'], exact: false });
    },
  });
};

export const useToggleKeyResultCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
      objectivesApi.toggleKeyResultCompletion(objectiveId, keyResultId),
    onMutate: async ({ objectiveId, keyResultId }) => {
      await queryClient.cancelQueries({ queryKey: ['objectives'] });
      const previousObjectives = queryClient.getQueryData(['objectives', undefined]);

      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          return {
            ...obj,
            keyResults: obj.keyResults?.map((kr: any) =>
              kr.id === keyResultId ? { ...kr, isCompleted: !kr.isCompleted } : kr
            ),
          };
        });
      });

      return { previousObjectives };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'], exact: false });
    },
  });
};

// Archive hook - OTIMIZADO
export const useArchiveObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.archiveObjective(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['objectives'] });
      const previousObjectives = queryClient.getQueryData(['objectives', undefined]);

      // Remove do cache imediatamente (aparece instantâneo)
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((obj: any) => obj.id !== id);
      });

      return { previousObjectives };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'], exact: false });
    },
  });
};
