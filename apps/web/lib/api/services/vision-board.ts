import { apiClient } from '../client';

export interface VisionBoardItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fullDescription?: string;
  imageUrl: string;
  dueDate?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisionBoardItemDto {
  title: string;
  description?: string;
  fullDescription?: string;
  imageUrl: string;
  dueDate?: string;
  order?: number;
}

export interface UpdateVisionBoardItemDto {
  title?: string;
  description?: string;
  fullDescription?: string;
  imageUrl?: string;
  dueDate?: string;
  order?: number;
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
      // Let axios set Content-Type automatically for multipart/form-data
      // This preserves the boundary parameter and other headers
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
  getAll: async (): Promise<VisionBoardItem[]> => {
    const { data } = await apiClient.get('/vision-board');
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
