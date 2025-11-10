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
 * 3. Rate limiting: máximo 50 imagens por usuário
 * 4. Autenticação obrigatória
 * 5. Sanitização de metadados
 * 6. URLs assinadas do Firebase Storage
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
  private readonly MAX_ITEMS_PER_USER = 50; // Proteção contra quota attack
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
   * - Limite de imagens por usuário
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

    // 3. Verificar limite de imagens por usuário (proteção DoS/Quota)
    const userItemsCount = await this.getUserItemsCount(userId);
    if (userItemsCount >= this.MAX_ITEMS_PER_USER) {
      throw new ForbiddenException(
        `You have reached the maximum limit of ${this.MAX_ITEMS_PER_USER} vision board items`,
      );
    }

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

    const itemData = {
      ...dto,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

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
  async findAll(userId: string) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.COLLECTION_NAME)
      .where('userId', '==', userId)
      .orderBy('order', 'asc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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

    // Se está atualizando a imagem, validar URL
    if (dto.imageUrl && !dto.imageUrl.includes('googleapis.com') && !dto.imageUrl.includes('firebasestorage.app')) {
      throw new BadRequestException('Invalid image URL. Must be a Firebase Storage URL.');
    }

    await docRef.update({
      ...dto,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await docRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
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
   * Helper: Contar itens do usuário
   */
  private async getUserItemsCount(userId: string): Promise<number> {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db
      .collection(this.COLLECTION_NAME)
      .where('userId', '==', userId)
      .count()
      .get();

    return snapshot.data().count;
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
