import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectivesApi, CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto } from '@/lib/api/services/objectives';

export const useObjectives = (lifeAreaId?: string) => {
  return useQuery({
    queryKey: ['objectives', lifeAreaId],
    queryFn: async () => {
      const result = await objectivesApi.getAll(lifeAreaId);
      return result;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - muito mais cache
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useObjective = (id: string) => {
  return useQuery({
    queryKey: ['objectives', id],
    queryFn: () => objectivesApi.getOne(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateObjectiveDto) => objectivesApi.create(dto),
    onSuccess: (newObjective) => {
      // OTIMIZAÇÃO: Adiciona ao cache sem invalidar
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return [newObjective];
        return [newObjective, ...old];
      });
    },
  });
};

export const useUpdateObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateObjectiveDto }) =>
      objectivesApi.update(id, dto),
    onSuccess: (updatedObjective, { id }) => {
      // OTIMIZAÇÃO: Atualiza cache sem invalidar
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => obj.id === id ? { ...obj, ...updatedObjective } : obj);
      });
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // OTIMIZAÇÃO: Remove do cache sem invalidar
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((obj: any) => obj.id !== deletedId);
      });
    },
  });
};

export const useCompleteObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.completeObjective(id),
    onSuccess: (updatedObjective, id) => {
      // OTIMIZAÇÃO: Atualiza cache sem invalidar
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => obj.id === id ? { ...obj, ...updatedObjective } : obj);
      });
    },
  });
};

// Key Results hooks
export const useCreateKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, dto, skipInvalidation }: {
      objectiveId: string;
      dto: CreateKeyResultDto;
      skipInvalidation?: boolean;
    }) =>
      objectivesApi.createKeyResult(objectiveId, dto),
    onSuccess: (newKeyResult, { objectiveId, skipInvalidation }) => {
      // OTIMIZAÇÃO: Sempre usa cache, nunca invalida
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          const updatedKeyResults = [...(obj.keyResults || []), newKeyResult];
          return { ...obj, keyResults: updatedKeyResults };
        });
      });
    },
  });
};

export const useUpdateKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId, dto, skipInvalidation }: {
      objectiveId: string;
      keyResultId: string;
      dto: UpdateKeyResultDto;
      skipInvalidation?: boolean;
    }) =>
      objectivesApi.updateKeyResult(objectiveId, keyResultId, dto),
    onSuccess: (updatedKeyResult, { objectiveId, keyResultId }) => {
      // OTIMIZAÇÃO: Sempre usa cache, nunca invalida
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          const updatedKeyResults = obj.keyResults?.map((kr: any) =>
            kr.id === keyResultId ? { ...kr, ...updatedKeyResult } : kr
          ) || [];
          return { ...obj, keyResults: updatedKeyResults };
        });
      });
    },
  });
};

export const useDeleteKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId, skipInvalidation }: {
      objectiveId: string;
      keyResultId: string;
      skipInvalidation?: boolean;
    }) =>
      objectivesApi.deleteKeyResult(objectiveId, keyResultId),
    onSuccess: (_, { objectiveId, keyResultId }) => {
      // OTIMIZAÇÃO: Sempre usa cache, nunca invalida
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          const updatedKeyResults = obj.keyResults?.filter((kr: any) => kr.id !== keyResultId) || [];
          return { ...obj, keyResults: updatedKeyResults };
        });
      });
    },
  });
};

export const useCompleteKeyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
      objectivesApi.completeKeyResult(objectiveId, keyResultId),
    onSuccess: (updatedKeyResult, { objectiveId, keyResultId }) => {
      // OTIMIZAÇÃO: Atualiza cache sem invalidar
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          const updatedKeyResults = obj.keyResults?.map((kr: any) =>
            kr.id === keyResultId ? { ...kr, ...updatedKeyResult } : kr
          ) || [];
          return { ...obj, keyResults: updatedKeyResults };
        });
      });
    },
  });
};

// Batch update key results hook
export const useBatchUpdateKeyResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, updates }: { objectiveId: string; updates: Array<{id: string, dto: UpdateKeyResultDto}> }) =>
      objectivesApi.batchUpdateKeyResults(objectiveId, updates),
    onSuccess: (result, { objectiveId, updates }) => {
      // OTIMIZAÇÃO: Usa cache, nunca invalida
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) => {
          if (obj.id !== objectiveId) return obj;
          const updatedKeyResults = obj.keyResults?.map((kr: any) => {
            const update = updates.find(u => u.id === kr.id);
            return update ? { ...kr, ...update.dto } : kr;
          }) || [];
          return { ...obj, keyResults: updatedKeyResults };
        });
      });
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
      // Só invalida em caso de erro para sincronizar
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

          // Update key results with toggled completion
          const updatedKeyResults = obj.keyResults?.map((kr: any) =>
            kr.id === keyResultId ? { ...kr, isCompleted: !kr.isCompleted } : kr
          );

          // Calculate new progress based on updated key results
          const completedCount = updatedKeyResults?.filter((kr: any) => kr.isCompleted).length || 0;
          const totalCount = updatedKeyResults?.length || 1;
          const progress = Math.round((completedCount / totalCount) * 100);

          return {
            ...obj,
            keyResults: updatedKeyResults,
            progress, // Update progress optimistically
          };
        });
      });

      return { previousObjectives };
    },
    onSuccess: () => {
      // OTIMIZAÇÃO: Não invalida mais, optimistic update já atualizou
      // Cache já foi atualizado no onMutate
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
      // OTIMIZAÇÃO: Só invalida em caso de erro crítico
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

      // Update cache to mark as archived instead of removing
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) =>
          obj.id === id ? { ...obj, isArchived: true } : obj
        );
      });

      return { previousObjectives };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
      // OTIMIZAÇÃO: Só invalida em caso de erro crítico se necessário
    },
  });
};

// Unarchive hook - OTIMIZADO
export const useUnarchiveObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectivesApi.unarchiveObjective(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['objectives'] });
      const previousObjectives = queryClient.getQueryData(['objectives', undefined]);

      // Update cache to mark as unarchived
      queryClient.setQueryData(['objectives', undefined], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((obj: any) =>
          obj.id === id ? { ...obj, isArchived: false } : obj
        );
      });

      return { previousObjectives };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(['objectives', undefined], context.previousObjectives);
      }
      // OTIMIZAÇÃO: Só invalida em caso de erro crítico se necessário
    },
  });
};
