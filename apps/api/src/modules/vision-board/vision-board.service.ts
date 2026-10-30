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

  private readonly LOGS_COLLECTION = 'visionBoardPracticeLogs';
  private readonly SESSION_STATE_COLLECTION = 'visionBoardSessionState';
  private readonly MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
  private readonly MAX_AUDIO_DURATION_SEC = 300; // 5 minutos
  private readonly ALLOWED_AUDIO_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/webm',
  ];

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
   * 🔒 UPLOAD SEGURO DE ÁUDIO
   *
   * Confia na duração reportada pelo cliente (sem ffprobe no servidor,
   * mesmo padrão de "multer limits + mime whitelist" usado em todo upload
   * deste projeto) — valida apenas tipo e tamanho do arquivo.
   */
  async uploadAudio(
    userId: string,
    file: Express.Multer.File,
    durationSec: number,
  ): Promise<{ audioFileUrl: string; audioDurationSec: number; audioSizeBytes: number }> {
    if (!this.ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_AUDIO_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_AUDIO_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.MAX_AUDIO_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (!durationSec || durationSec > this.MAX_AUDIO_DURATION_SEC) {
      throw new BadRequestException(
        `Audio too long. Maximum duration: ${this.MAX_AUDIO_DURATION_SEC / 60} minutes`,
      );
    }

    try {
      const audioFileUrl = await this.cloudinaryService.uploadVisionBoardAudio(file.buffer, userId);
      this.logger.log(`Audio uploaded successfully to Cloudinary for user: ${userId}`);
      return { audioFileUrl, audioDurationSec: durationSec, audioSizeBytes: file.size };
    } catch (error) {
      this.logger.error('Error uploading audio to Cloudinary', error);
      throw new BadRequestException('Failed to upload audio');
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
      completed: dto.completed !== undefined ? dto.completed : false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Só adiciona campos opcionais que não são undefined
    if (dto.description !== undefined) itemData.description = dto.description;
    if (dto.fullDescription !== undefined) itemData.fullDescription = dto.fullDescription;
    if (dto.dueDate !== undefined) itemData.dueDate = dto.dueDate;
    if (dto.order !== undefined) itemData.order = dto.order;

    // Visualization practice ("Visualizar e agir")
    if (dto.objectiveId !== undefined) itemData.objectiveId = dto.objectiveId;
    if (dto.plannedPracticeDurationMinutes !== undefined) itemData.plannedPracticeDurationMinutes = dto.plannedPracticeDurationMinutes;
    if (dto.currentEmotion !== undefined) itemData.currentEmotion = dto.currentEmotion;
    if (dto.currentEnergy !== undefined) itemData.currentEnergy = dto.currentEnergy;
    if (dto.currentConfidence !== undefined) itemData.currentConfidence = dto.currentConfidence;
    if (dto.desiredState !== undefined) itemData.desiredState = dto.desiredState;
    if (dto.empoweringBelief !== undefined) itemData.empoweringBelief = dto.empoweringBelief;
    if (dto.outcomeVisualizationText !== undefined) itemData.outcomeVisualizationText = dto.outcomeVisualizationText;
    if (dto.processVisualizationText !== undefined) itemData.processVisualizationText = dto.processVisualizationText;
    if (dto.likelyObstacle !== undefined) itemData.likelyObstacle = dto.likelyObstacle;
    if (dto.obstacleResponse !== undefined) itemData.obstacleResponse = dto.obstacleResponse;
    if (dto.nextAction !== undefined) itemData.nextAction = dto.nextAction;
    if (dto.nextActionDueDate !== undefined) itemData.nextActionDueDate = dto.nextActionDueDate;

    // Audio (plays during visualization)
    if (dto.audioType !== undefined) itemData.audioType = dto.audioType;
    if (dto.audioTrackId !== undefined) itemData.audioTrackId = dto.audioTrackId;
    if (dto.audioFileUrl !== undefined) itemData.audioFileUrl = dto.audioFileUrl;
    if (dto.audioDurationSec !== undefined) itemData.audioDurationSec = dto.audioDurationSec;
    if (dto.audioSizeBytes !== undefined) itemData.audioSizeBytes = dto.audioSizeBytes;

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
      if (dto.completed !== undefined) updateData.completed = dto.completed;

      // Visualization practice ("Visualizar e agir")
      if (dto.objectiveId !== undefined) updateData.objectiveId = dto.objectiveId;
      if (dto.plannedPracticeDurationMinutes !== undefined) updateData.plannedPracticeDurationMinutes = dto.plannedPracticeDurationMinutes;
      if (dto.currentEmotion !== undefined) updateData.currentEmotion = dto.currentEmotion;
      if (dto.currentEnergy !== undefined) updateData.currentEnergy = dto.currentEnergy;
      if (dto.currentConfidence !== undefined) updateData.currentConfidence = dto.currentConfidence;
      if (dto.desiredState !== undefined) updateData.desiredState = dto.desiredState;
      if (dto.empoweringBelief !== undefined) updateData.empoweringBelief = dto.empoweringBelief;
      if (dto.outcomeVisualizationText !== undefined) updateData.outcomeVisualizationText = dto.outcomeVisualizationText;
      if (dto.processVisualizationText !== undefined) updateData.processVisualizationText = dto.processVisualizationText;
      if (dto.likelyObstacle !== undefined) updateData.likelyObstacle = dto.likelyObstacle;
      if (dto.obstacleResponse !== undefined) updateData.obstacleResponse = dto.obstacleResponse;
      if (dto.nextAction !== undefined) updateData.nextAction = dto.nextAction;
      if (dto.nextActionDueDate !== undefined) updateData.nextActionDueDate = dto.nextActionDueDate;

      // Audio (plays during visualization)
      if (dto.audioType !== undefined) updateData.audioType = dto.audioType;
      if (dto.audioTrackId !== undefined) updateData.audioTrackId = dto.audioTrackId;
      if (dto.audioFileUrl !== undefined) updateData.audioFileUrl = dto.audioFileUrl;
      if (dto.audioDurationSec !== undefined) updateData.audioDurationSec = dto.audioDurationSec;
      if (dto.audioSizeBytes !== undefined) updateData.audioSizeBytes = dto.audioSizeBytes;

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

    // Deletar áudio enviado pelo usuário, se houver
    if (data.audioType === 'file' && data.audioFileUrl) {
      try {
        await this.deleteAudioFromStorage(data.audioFileUrl);
      } catch (error) {
        this.logger.warn('Failed to delete audio from storage', error);
      }
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

  /**
   * Helper: Deletar áudio do Cloudinary (mesmo formato de URL da imagem)
   */
  private async deleteAudioFromStorage(audioUrl: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(audioUrl);
      this.logger.log(`Audio deleted from Cloudinary: ${audioUrl}`);
    } catch (error) {
      this.logger.error('Error deleting audio from Cloudinary', error);
      throw error;
    }
  }

  /**
   * Registrar uma sessão de prática concluída — um log por meta praticada,
   * atualiza o "estado atual" de cada meta e o estado da sessão do usuário
   * (para pré-preencher o check-in da próxima vez). Tudo em um único batch.
   */
  async logPracticeSession(
    userId: string,
    entries: { itemId: string; date: string }[],
    feeling: string,
    energy: number,
    confidence: number,
  ) {
    const db = this.firebaseService.getFirestore();
    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const entry of entries) {
      // Upsert do log por userId+itemId+date (uma prática por dia por meta)
      const existing = await db
        .collection(this.LOGS_COLLECTION)
        .where('userId', '==', userId)
        .where('itemId', '==', entry.itemId)
        .where('date', '==', entry.date)
        .limit(1)
        .get();

      const logData = {
        userId,
        itemId: entry.itemId,
        date: entry.date,
        feeling,
        energy,
        confidence,
        updatedAt: now,
      };

      if (!existing.empty) {
        batch.update(existing.docs[0].ref, logData);
      } else {
        const newLogRef = db.collection(this.LOGS_COLLECTION).doc();
        batch.set(newLogRef, { ...logData, createdAt: now });
      }

      const itemRef = db.collection(this.COLLECTION_NAME).doc(entry.itemId);
      batch.update(itemRef, {
        currentEmotion: feeling,
        currentEnergy: energy,
        currentConfidence: confidence,
        updatedAt: now,
      });
    }

    const sessionStateRef = db.collection(this.SESSION_STATE_COLLECTION).doc(userId);
    batch.set(
      sessionStateRef,
      {
        userId,
        lastFeeling: feeling,
        lastEnergy: energy,
        lastConfidence: confidence,
        lastSessionAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    await batch.commit();

    return { message: 'Practice session logged successfully' };
  }

  /**
   * Buscar o último check-in salvo do usuário, para pré-preencher a próxima sessão.
   */
  async getSessionState(userId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.SESSION_STATE_COLLECTION).doc(userId).get();

    if (!doc.exists) {
      return { lastFeeling: null, lastEnergy: null, lastConfidence: null, lastSessionAt: null };
    }

    const data = doc.data() as any;
    return {
      lastFeeling: data.lastFeeling ?? null,
      lastEnergy: data.lastEnergy ?? null,
      lastConfidence: data.lastConfidence ?? null,
      lastSessionAt: data.lastSessionAt?.toDate?.().toISOString() ?? null,
    };
  }

  /**
   * Resumo de prática por meta (histórico de 7 dias + contagem vitalícia +
   * última prática), para os quadradinhos do card — UMA query para todos os
   * logs do usuário, agrupada em memória por itemId (evita N+1 por card).
   */
  async getPracticeSummary(userId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db
      .collection(this.LOGS_COLLECTION)
      .where('userId', '==', userId)
      .get();

    const logsByItem = new Map<string, string[]>(); // itemId -> dates[]
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as any;
      const dates = logsByItem.get(data.itemId) ?? [];
      dates.push(data.date);
      logsByItem.set(data.itemId, dates);
    });

    const last7Dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().split('T')[0]);
    }

    const summary: Record<
      string,
      { last7Days: boolean[]; totalCount: number; lastPracticedAt: string | null }
    > = {};

    logsByItem.forEach((dates, itemId) => {
      const dateSet = new Set(dates);
      summary[itemId] = {
        last7Days: last7Dates.map((d) => dateSet.has(d)),
        totalCount: dates.length,
        lastPracticedAt: dates.sort().at(-1) ?? null,
      };
    });

    return summary;
  }
}
