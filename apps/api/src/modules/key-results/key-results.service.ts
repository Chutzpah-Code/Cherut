import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateKeyResultDto, UpdateKeyResultDto } from './dto';

@Injectable()
export class KeyResultsService {
  private readonly logger = new Logger(KeyResultsService.name);
  private readonly collection = 'keyResults';
  private readonly MIN_KEY_RESULTS_PER_OBJECTIVE = 3;

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateKeyResultDto) {
    const db = this.firebaseService.getFirestore();

    // Verify objective exists and belongs to user
    await this.verifyObjectiveOwnership(userId, createDto.objectiveId);

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
    );

    const keyResult = {
      ...cleanedDto,
      userId,
      currentValue: createDto.currentValue || 0,
      completionPercentage: this.calculateCompletion(
        createDto.currentValue || 0,
        createDto.targetValue,
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(keyResult);

    this.logger.log(`Key Result created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...keyResult,
    };
  }

  async findAll(userId: string, objectiveId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db.collection(this.collection).where('userId', '==', userId);

    if (objectiveId) {
      query = query.where('objectiveId', '==', objectiveId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Key Result ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Key Result ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateKeyResultDto) {
    const existing = await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    // Recalculate completion if values changed
    const newCurrentValue = updateDto.currentValue ?? existing.currentValue;
    const newTargetValue = updateDto.targetValue ?? existing.targetValue;

    const updates = {
      ...cleanedDto,
      completionPercentage: this.calculateCompletion(
        newCurrentValue,
        newTargetValue,
      ),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(id).update(updates);

    this.logger.log(`Key Result updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const keyResult = await this.findOne(userId, id);

    // Check if removing this KR would violate minimum requirement
    const remainingKRs = await this.countKeyResultsByObjective(
      userId,
      keyResult.objectiveId,
    );

    if (remainingKRs <= this.MIN_KEY_RESULTS_PER_OBJECTIVE) {
      throw new BadRequestException(
        `Cannot delete Key Result. Objectives must have at least ${this.MIN_KEY_RESULTS_PER_OBJECTIVE} Key Results.`,
      );
    }

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Key Result deleted: ${id}`);

    return { message: 'Key Result deleted successfully' };
  }

  // Helper methods
  private async verifyObjectiveOwnership(
    userId: string,
    objectiveId: string,
  ): Promise<void> {
    const db = this.firebaseService.getFirestore();
    const objectiveDoc = await db
      .collection('objectives')
      .doc(objectiveId)
      .get();

    if (!objectiveDoc.exists) {
      throw new NotFoundException(`Objective ${objectiveId} not found`);
    }

    const objectiveData = objectiveDoc.data()!;
    if (objectiveData.userId !== userId) {
      throw new NotFoundException(`Objective ${objectiveId} not found`);
    }
  }

  private async countKeyResultsByObjective(
    userId: string,
    objectiveId: string,
  ): Promise<number> {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.collection)
      .where('userId', '==', userId)
      .where('objectiveId', '==', objectiveId)
      .get();

    return snapshot.size;
  }

  private calculateCompletion(
    currentValue: number,
    targetValue: number,
  ): number {
    if (targetValue === 0) return 0;
    const percentage = (currentValue / targetValue) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  }
}
