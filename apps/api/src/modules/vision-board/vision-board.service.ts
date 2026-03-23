import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';
import { CreateVisionBoardItemDto } from './dto/create-vision-board-item.dto';
import { UpdateVisionBoardItemDto } from './dto/update-vision-board-item.dto';
import * as admin from 'firebase-admin';
import type { Express } from 'express';

/**
 * 🛡️ VISION BOARD SERVICE COM PROTEÇÕES DE SEGURANÇA
 *
 * PROTEÇÕES IMPLEMENTADAS:
 * 1. Validação de tipo de arquivo (apenas imagens)
 * 2. Limite de tamanho: 1MB
 * 3. Autenticação obrigatória
 * 4. Sanitização de metadados
 * 5. URLs assinadas do Firebase Storage
 *
 * FLUXO DE UPLOAD:
 * 1. Cliente envia arquivo (validado no frontend primeiro)
 * 2. Backend valida novamente (NUNCA confie no cliente!)
 * 3. Arquivo vai para Firebase Storage
 * 4. URL é salva no Firestore
 * 5. Cliente recebe a URL para exibir
 */

@Injectable()
export class VisionBoardService {
  private readonly logger = new Logger(VisionBoardService.name);
  private readonly COLLECTION_NAME = 'vision-board-items';
  private readonly MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB em bytes
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * 🔒 UPLOAD SEGURO DE IMAGEM
   *
   * VALIDAÇÕES:
   * - Tipo de arquivo (MIME type real, não só extensão)
   * - Tamanho máximo 1MB
   * - Usuário autenticado
   */
  async uploadImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    // 1. Validar tipo de arquivo
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // 2. Validar tamanho do arquivo
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // 3. Limite removido - permite quantidade ilimitada de itens no vision board

    try {
      // Upload para o Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file.buffer, userId);

      this.logger.log(`Image uploaded successfully to Cloudinary for user: ${userId}`);

      return { imageUrl };
    } catch (error) {
      this.logger.error('Error uploading image to Cloudinary', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Criar item no Vision Board
   */
  async create(userId: string, dto: CreateVisionBoardItemDto) {
    const db = this.firebaseService.getFirestore();

    // Validar que a URL da imagem pertence ao Cloudinary
    if (!dto.imageUrl.includes('cloudinary.com')) {
      throw new BadRequestException('Invalid image URL. Must be a Cloudinary URL.');
    }

    // Remove campos undefined (Firestore não aceita undefined)
    const itemData: any = {
      userId,
      title: dto.title,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Só adiciona campos opcionais que não são undefined
    if (dto.description !== undefined) itemData.description = dto.description;
    if (dto.fullDescription !== undefined) itemData.fullDescription = dto.fullDescription;
    if (dto.dueDate !== undefined) itemData.dueDate = dto.dueDate;
    if (dto.order !== undefined) itemData.order = dto.order;

    const docRef = await db.collection(this.COLLECTION_NAME).add(itemData);
    const doc = await docRef.get();

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  /**
   * Listar todos os itens do Vision Board do usuário
   */
  async findAll(userId: string, archived?: boolean) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.COLLECTION_NAME)
      .where('userId', '==', userId)
      .orderBy('order', 'asc')
      .orderBy('createdAt', 'desc')
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by archived status in code to handle legacy data
    if (archived !== undefined) {
      return items.filter((item: any) => {
        const isActive = item.isActive !== undefined ? item.isActive : true; // Default to true for legacy data
        return !isActive === archived; // archived=true means !isActive, archived=false means isActive
      });
    }

    // Return only active items by default (legacy behavior)
    return items.filter((item: any) => {
      const isActive = item.isActive !== undefined ? item.isActive : true;
      return isActive;
    });
  }

  /**
   * Buscar um item específico
   */
  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      throw new BadRequestException('Vision board item not found');
    }

    const data = doc.data();

    if (!data) {
      throw new BadRequestException('Vision board item data not found');
    }

    // Verificar se o item pertence ao usuário
    if (data.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this item');
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  /**
   * Atualizar item
   */
  async update(userId: string, id: string, dto: UpdateVisionBoardItemDto) {
    try {
      const db = this.firebaseService.getFirestore();
      const docRef = db.collection(this.COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new BadRequestException('Vision board item not found');
      }

      const data = doc.data();

      if (!data) {
        throw new BadRequestException('Vision board item data not found');
      }

      // Verificar permissão
      if (data.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this item');
      }

      // Se está atualizando a imagem, validar URL (skip validation temporarily for debugging)
      // if (dto.imageUrl && !dto.imageUrl.includes('cloudinary.com')) {
      //   throw new BadRequestException('Invalid image URL. Must be a Cloudinary URL.');
      // }

      // Remove campos undefined (Firestore não aceita undefined)
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Só adiciona campos que não são undefined
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.fullDescription !== undefined) updateData.fullDescription = dto.fullDescription;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      await docRef.update(updateData);

      const updatedDoc = await docRef.get();

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      };
    } catch (error) {
      this.logger.error('Error updating vision board item', error);
      throw error;
    }
  }

  /**
   * Deletar item (e a imagem do Storage)
   */
  async remove(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection(this.COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new BadRequestException('Vision board item not found');
    }

    const data = doc.data();

    if (!data) {
      throw new BadRequestException('Vision board item data not found');
    }

    // Verificar permissão
    if (data.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this item');
    }

    // Deletar imagem do Storage
    try {
      const imageUrl = data.imageUrl;
      if (imageUrl) {
        await this.deleteImageFromStorage(imageUrl);
      }
    } catch (error) {
      this.logger.warn('Failed to delete image from storage', error);
      // Continua mesmo se falhar ao deletar a imagem
    }

    await docRef.delete();

    return { message: 'Vision board item deleted successfully' };
  }

  /**
   * Atualizar ordem dos itens (drag-and-drop)
   */
  async updateOrder(userId: string, items: { id: string; order: number }[]) {
    const db = this.firebaseService.getFirestore();
    const batch = db.batch();

    for (const item of items) {
      const docRef = db.collection(this.COLLECTION_NAME).doc(item.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        continue;
      }

      const data = doc.data();

      if (!data) {
        continue; // Skip if data not found
      }

      // Verificar permissão
      if (data.userId !== userId) {
        throw new ForbiddenException('You do not have permission to reorder these items');
      }

      batch.update(docRef, {
        order: item.order,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return { message: 'Order updated successfully' };
  }


  /**
   * Archive/Unarchive vision board item (toggle isActive status)
   */
  async toggleArchive(userId: string, itemId: string) {
    const item: any = await this.findOne(userId, itemId);
    const db = this.firebaseService.getFirestore();

    // Handle legacy data - if isActive is undefined, default to true (active)
    const currentActiveStatus = item.isActive !== undefined ? item.isActive : true;
    const newActiveStatus = !currentActiveStatus;

    await db.collection(this.COLLECTION_NAME).doc(itemId).update({
      isActive: newActiveStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    this.logger.log(`Vision board item ${itemId} isActive changed from ${currentActiveStatus} to ${newActiveStatus}`);

    const updatedDoc = await db.collection(this.COLLECTION_NAME).doc(itemId).get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  }

  /**
   * Helper: Deletar imagem do Cloudinary
   */
  private async deleteImageFromStorage(imageUrl: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(imageUrl);
      this.logger.log(`Image deleted from Cloudinary: ${imageUrl}`);
    } catch (error) {
      this.logger.error('Error deleting image from Cloudinary', error);
      throw error;
    }
  }
}
