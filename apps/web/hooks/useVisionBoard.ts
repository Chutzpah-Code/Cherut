import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visionBoardApi, CreateVisionBoardItemDto, UpdateVisionBoardItemDto } from '@/lib/api/services/vision-board';

/**
 * 🖼️ REACT QUERY HOOKS PARA VISION BOARD
 *
 * Hooks disponíveis:
 * - useVisionBoardItems() - Listar todos os itens
 * - useVisionBoardItem(id) - Buscar um item específico
 * - useUploadImage() - Upload de imagem
 * - useCreateVisionBoardItem() - Criar item
 * - useUpdateVisionBoardItem() - Atualizar item
 * - useDeleteVisionBoardItem() - Deletar item
 * - useReorderVisionBoard() - Reordenar itens (drag-and-drop)
 */

export const useVisionBoardItems = (archived?: boolean, enabled = true) => {
  return useQuery({
    queryKey: ['vision-board-items', archived],
    queryFn: () => visionBoardApi.getAll(archived),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useVisionBoardItem = (id: string) => {
  return useQuery({
    queryKey: ['vision-board-items', id],
    queryFn: () => visionBoardApi.getOne(id),
    enabled: !!id,
  });
};

/**
 * Hook para upload de imagem
 *
 * Retorna a URL da imagem no Firebase Storage
 */
export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => visionBoardApi.uploadImage(file),
  });
};

export const useCreateVisionBoardItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateVisionBoardItemDto) => visionBoardApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
    },
  });
};

export const useUpdateVisionBoardItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVisionBoardItemDto }) =>
      visionBoardApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
    },
  });
};

export const useDeleteVisionBoardItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visionBoardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
    },
  });
};

export const useReorderVisionBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => visionBoardApi.reorder(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
    },
  });
};

export const useToggleArchiveVisionBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visionBoardApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
    },
  });
};

export const useUploadAudio = () => {
  return useMutation({
    mutationFn: ({ file, durationSec }: { file: File; durationSec: number }) =>
      visionBoardApi.uploadAudio(file, durationSec),
  });
};

export const usePracticeSummary = () => {
  return useQuery({
    queryKey: ['vision-board-practice-summary'],
    queryFn: () => visionBoardApi.getPracticeSummary(),
    staleTime: 60 * 1000,
  });
};

export const useSessionState = () => {
  return useQuery({
    queryKey: ['vision-board-session-state'],
    queryFn: () => visionBoardApi.getSessionState(),
    staleTime: 60 * 1000,
  });
};

export const useLogPracticeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entries,
      feeling,
      energy,
      confidence,
    }: {
      entries: { itemId: string; date: string }[];
      feeling: string;
      energy: number;
      confidence: number;
    }) => visionBoardApi.logPracticeSession(entries, feeling, energy, confidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-board-items'] });
      queryClient.invalidateQueries({ queryKey: ['vision-board-practice-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vision-board-session-state'] });
    },
  });
};
