import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  boardsApi,
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
} from '@/lib/api/services/boards';

// ── Boards ──────────────────────────────────────────────────────────────────

export const useBoards = () =>
  useQuery({
    queryKey: ['boards'],
    queryFn: () => boardsApi.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useBoard = (boardId: string) =>
  useQuery({
    queryKey: ['boards', boardId],
    queryFn: () => boardsApi.getOne(boardId),
    enabled: !!boardId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useEnsureDefaultBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => boardsApi.ensureDefault(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBoardDto) => boardsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, dto }: { boardId: string; dto: UpdateBoardDto }) =>
      boardsApi.update(boardId, dto),
    onSuccess: (_data, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.delete(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// ── Columns ──────────────────────────────────────────────────────────────────

export const useColumns = (boardId: string) =>
  useQuery({
    queryKey: ['boards', boardId, 'columns'],
    queryFn: () => boardsApi.getColumns(boardId),
    enabled: !!boardId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, dto }: { boardId: string; dto: CreateColumnDto }) =>
      boardsApi.createColumn(boardId, dto),
    onSuccess: (_data, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'columns'] });
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
    },
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      columnId,
      dto,
    }: {
      boardId: string;
      columnId: string;
      dto: UpdateColumnDto;
    }) => boardsApi.updateColumn(boardId, columnId, dto),
    onSuccess: (_data, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'columns'] });
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
    },
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, columnId }: { boardId: string; columnId: string }) =>
      boardsApi.deleteColumn(boardId, columnId),
    onMutate: async ({ boardId, columnId }) => {
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'kanban'] });
      const previous = queryClient.getQueryData(['boards', boardId, 'kanban']);
      queryClient.setQueryData(['boards', boardId, 'kanban'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((col: any) => col.id !== columnId);
      });
      return { previous };
    },
    onError: (_err, { boardId }, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['boards', boardId, 'kanban'], context.previous);
      }
    },
    onSettled: (_data, _err, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'kanban'] });
    },
  });
};

// ── Kanban ────────────────────────────────────────────────────────────────────

export const useBoardKanban = (boardId: string) =>
  useQuery({
    queryKey: ['boards', boardId, 'kanban'],
    queryFn: () => boardsApi.getKanban(boardId),
    enabled: !!boardId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
