import { apiClient } from '../client';

// Visualization practice fields ("Visualizar e agir") — optional, shared by
// the item itself and both DTOs since they're saved directly on the item.
// State/outcome/process/action structure (see EditDrawer/VisualizationTab.tsx
// for the "why" behind this shape).
interface VisualizationPracticeFields {
  objectiveId?: string;
  plannedPracticeDurationMinutes?: 5 | 10 | 15;
  currentEmotion?: string;
  currentEnergy?: number;
  currentConfidence?: number;
  desiredState?: string;
  empoweringBelief?: string;
  outcomeVisualizationText?: string;
  processVisualizationText?: string;
  likelyObstacle?: string;
  obstacleResponse?: string;
  nextAction?: string;
  nextActionDueDate?: string;
  audioType?: 'none' | 'system' | 'file';
  audioTrackId?: string;
  audioFileUrl?: string;
  audioDurationSec?: number;
  audioSizeBytes?: number;
}

export interface PracticeSummaryEntry {
  last7Days: boolean[];
  totalCount: number;
  lastPracticedAt: string | null;
}

export type PracticeSummary = Record<string, PracticeSummaryEntry>;

export interface SessionState {
  lastFeeling: string | null;
  lastEnergy: number | null;
  lastConfidence: number | null;
  lastSessionAt: string | null;
}

export interface VisionBoardItem extends VisualizationPracticeFields {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fullDescription?: string;
  imageUrl: string;
  dueDate?: string;
  order?: number;
  isActive?: boolean;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisionBoardItemDto extends VisualizationPracticeFields {
  title: string;
  description?: string;
  fullDescription?: string;
  imageUrl: string;
  dueDate?: string;
  order?: number;
  isActive?: boolean;
  completed?: boolean;
}

export interface UpdateVisionBoardItemDto extends VisualizationPracticeFields {
  title?: string;
  description?: string;
  fullDescription?: string;
  imageUrl?: string;
  dueDate?: string;
  order?: number;
  isActive?: boolean;
  completed?: boolean;
}

/**
 * 🖼️ VISION BOARD API SERVICE
 *
 * FLUXO DE UPLOAD:
 * 1. Cliente seleciona imagem
 * 2. Validação no frontend (tipo + tamanho)
 * 3. Upload via uploadImage() → retorna URL
 * 4. Usar URL no create() para criar o item
 *
 * VALIDAÇÕES FRONTEND (antes de enviar):
 * - Apenas PNG, JPG, JPEG, WEBP
 * - Máximo 1MB
 * - Compressão de imagem se necessário
 */

export const visionBoardApi = {
  /**
   * 📤 Upload de imagem para Firebase Storage
   *
   * IMPORTANTE:
   * - Validar tipo e tamanho ANTES de chamar esta função
   * - Retorna a URL da imagem
   * - Usar essa URL ao criar o item
   *
   * @param file - Arquivo de imagem (File object)
   * @returns Promise<{ imageUrl: string }>
   */
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await apiClient.post('/vision-board/upload', formData, {
      // Timeout de 30 segundos para upload
      timeout: 30000,
      // Remove o Content-Type para permitir que o browser defina multipart/form-data
      headers: {
        'Content-Type': undefined,
      },
    });

    return data;
  },

  /**
   * ✨ Criar item no Vision Board
   */
  create: async (dto: CreateVisionBoardItemDto): Promise<VisionBoardItem> => {
    const { data } = await apiClient.post('/vision-board', dto);
    return data;
  },

  /**
   * 📋 Listar todos os itens
   */
  getAll: async (archived?: boolean): Promise<VisionBoardItem[]> => {
    const params: any = {};
    if (archived !== undefined) params.archived = archived;
    const { data } = await apiClient.get('/vision-board', { params });
    return data;
  },

  /**
   * 🔍 Buscar um item
   */
  getOne: async (id: string): Promise<VisionBoardItem> => {
    const { data } = await apiClient.get(`/vision-board/${id}`);
    return data;
  },

  /**
   * ✏️ Atualizar item
   */
  update: async (id: string, dto: UpdateVisionBoardItemDto): Promise<VisionBoardItem> => {
    const { data} = await apiClient.patch(`/vision-board/${id}`, dto);
    return data;
  },

  /**
   * 🗑️ Deletar item (e a imagem do Storage)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vision-board/${id}`);
  },

  /**
   * 🔄 Reordenar itens (drag-and-drop)
   */
  reorder: async (items: { id: string; order: number }[]): Promise<void> => {
    await apiClient.patch('/vision-board/reorder/items', { items });
  },

  /**
   * 📦 Arquivar/desarquivar item (toggle isActive status)
   */
  toggleArchive: async (id: string): Promise<VisionBoardItem> => {
    const { data } = await apiClient.patch(`/vision-board/${id}/archive`);
    return data;
  },

  /**
   * 🎵 Upload de áudio próprio para tocar durante a visualização
   */
  uploadAudio: async (
    file: File,
    durationSec: number,
  ): Promise<{ audioFileUrl: string; audioDurationSec: number; audioSizeBytes: number }> => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('durationSec', String(Math.round(durationSec)));

    const { data } = await apiClient.post('/vision-board/upload-audio', formData, {
      timeout: 30000,
      headers: { 'Content-Type': undefined },
    });

    return data;
  },

  /**
   * 📊 Resumo de prática por meta (histórico 7 dias + contagem vitalícia),
   * buscado uma única vez para todos os cards do quadro.
   */
  getPracticeSummary: async (): Promise<PracticeSummary> => {
    const { data } = await apiClient.get('/vision-board/practice-summary');
    return data;
  },

  /**
   * 🧭 Último check-in salvo do usuário, para pré-preencher a sessão seguinte
   */
  getSessionState: async (): Promise<SessionState> => {
    const { data } = await apiClient.get('/vision-board/session-state');
    return data;
  },

  /**
   * ✅ Registrar uma sessão de prática concluída (uma ou mais metas)
   */
  logPracticeSession: async (
    entries: { itemId: string; date: string }[],
    feeling: string,
    energy: number,
    confidence: number,
  ): Promise<void> => {
    await apiClient.post('/vision-board/practice-sessions', { entries, feeling, energy, confidence });
  },
};

/**
 * 🛡️ VALIDAÇÃO DE IMAGEM NO FRONTEND
 *
 * Use essas funções ANTES de fazer upload
 */
export const imageValidation = {
  /**
   * Tipos de arquivo permitidos
   */
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],

  /**
   * Tamanho máximo: 1MB
   */
  MAX_SIZE: 1 * 1024 * 1024, // 1MB em bytes

  /**
   * Validar arquivo de imagem
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    // Validar tipo
    if (!imageValidation.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.',
      };
    }

    // Validar tamanho
    if (file.size > imageValidation.MAX_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${imageValidation.MAX_SIZE / (1024 * 1024)}MB.`,
      };
    }

    return { valid: true };
  },

  /**
   * Comprimir imagem se necessário
   * (opcional - pode implementar com biblioteca como browser-image-compression)
   */
  compressImage: async (file: File): Promise<File> => {
    // TODO: Implementar compressão se necessário
    // Por enquanto, retorna o arquivo original
    return file;
  },
};

/**
 * 🛡️ VALIDAÇÃO DE ÁUDIO NO FRONTEND
 *
 * Diferente de imageValidation, precisa ler a duração do arquivo (não dá
 * pra saber isso só pelo File object) — por isso validateFile é assíncrono.
 */
export const audioValidation = {
  ALLOWED_TYPES: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/webm'],

  /** Tamanho máximo: 10MB */
  MAX_SIZE: 10 * 1024 * 1024,

  /** Duração máxima: 5 minutos */
  MAX_DURATION_SEC: 300,

  validateFile: (file: File): Promise<{ valid: boolean; error?: string; durationSec?: number }> => {
    return new Promise((resolve) => {
      if (!audioValidation.ALLOWED_TYPES.includes(file.type)) {
        resolve({ valid: false, error: 'wrongFormat' });
        return;
      }

      if (file.size > audioValidation.MAX_SIZE) {
        resolve({ valid: false, error: 'tooLarge' });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      const timeout = setTimeout(() => {
        cleanup();
        // Metadados não carregaram a tempo — não bloqueia o usuário, deixa o
        // servidor confiar no valor (nesse caso, 0) e seguir em frente.
        resolve({ valid: true, durationSec: 0 });
      }, 8000);

      const cleanup = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
      };

      audio.addEventListener('loadedmetadata', () => {
        const durationSec = audio.duration;
        cleanup();
        if (durationSec > audioValidation.MAX_DURATION_SEC) {
          resolve({ valid: false, error: 'tooLong', durationSec });
          return;
        }
        resolve({ valid: true, durationSec });
      });

      audio.addEventListener('error', () => {
        cleanup();
        resolve({ valid: false, error: 'wrongFormat' });
      });

      audio.src = objectUrl;
    });
  },
};
