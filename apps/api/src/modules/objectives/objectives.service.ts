import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateObjectiveDto, UpdateObjectiveDto, ObjectiveStatus, CreateKeyResultDto, UpdateKeyResultDto } from './dto';

@Injectable()
export class ObjectivesService {
  private readonly logger = new Logger(ObjectivesService.name);
  private readonly collection = 'objectives';
  private readonly keyResultsCollection = 'keyResults';
  private readonly MAX_ACTIVE_OBJECTIVES = 5;

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateObjectiveDto) {
    const db = this.firebaseService.getFirestore();

    // Check active objectives limit (max 5)
    const activeCount = await this.countActiveObjectives(userId);
    if (activeCount >= this.MAX_ACTIVE_OBJECTIVES) {
      throw new BadRequestException(
        `Maximum ${this.MAX_ACTIVE_OBJECTIVES} active objectives allowed. Please complete or archive existing objectives.`,
      );
    }

    // Separate key results from objective data
    const { keyResults, ...objectiveData } = createDto;

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(objectiveData).filter(([_, v]) => v !== undefined),
    );

    // Calculate cycle dates if not provided
    const cycleMonths = createDto.cycleMonths || 3;
    const startDate = createDto.startDate || new Date().toISOString();
    const endDate =
      createDto.endDate ||
      this.calculateEndDate(startDate, cycleMonths);

    const objective = {
      ...cleanedDto,
      userId,
      status: createDto.status || ObjectiveStatus.ACTIVE,
      progress: 0,
      isActive: true,
      isArchived: createDto.isArchived || false,
      cycleMonths,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(objective);

    this.logger.log(`Objective created: ${docRef.id} for user ${userId}`);

    // Create key results if provided
    if (keyResults && keyResults.length > 0) {
      for (const kr of keyResults) {
        await this.createKeyResult(userId, docRef.id, kr);
      }
    }

    return this.findOne(userId, docRef.id);
  }

  async findAll(userId: string, lifeAreaId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db.collection(this.collection).where('userId', '==', userId);

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
    }

    const snapshot = await query.get();

    const objectives = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const objective = {
          id: doc.id,
          ...doc.data(),
        };

        // Fetch key results
        const keyResults = await this.getKeyResultsForObjective(objective.id);
        return {
          ...objective,
          keyResults,
        };
      }),
    );

    return objectives;
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Objective ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Objective ${id} not found`);
    }

    // Fetch key results
    const keyResults = await this.getKeyResultsForObjective(id);

    return {
      id: doc.id,
      ...data,
      keyResults,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateObjectiveDto) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    const updates = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(id).update(updates);

    this.logger.log(`Objective updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();
    
    // Delete all key results first
    const keyResultsSnapshot = await db
      .collection(this.keyResultsCollection)
      .where('objectiveId', '==', id)
      .get();

    const batch = db.batch();
    keyResultsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete objective
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Objective deleted: ${id}`);

    return { message: 'Objective deleted successfully' };
  }

  // Key Results methods
  async createKeyResult(userId: string, objectiveId: string, createDto: CreateKeyResultDto) {
    // Verify objective ownership
    await this.findOne(userId, objectiveId);

    const db = this.firebaseService.getFirestore();

    const keyResult = {
      ...createDto,
      objectiveId,
      isCompleted: createDto.isCompleted || false,
      isArchived: createDto.isArchived || false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.keyResultsCollection).add(keyResult);

    this.logger.log(`Key Result created: ${docRef.id} for objective ${objectiveId}`);

    // Update objective progress
    await this.updateObjectiveProgress(objectiveId);

    return {
      id: docRef.id,
      ...keyResult,
    };
  }

  async getKeyResultsForObjective(objectiveId: string) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.keyResultsCollection)
      .where('objectiveId', '==', objectiveId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async updateKeyResult(
    userId: string,
    objectiveId: string,
    keyResultId: string,
    updateDto: UpdateKeyResultDto,
  ) {
    // Verify objective ownership
    await this.findOne(userId, objectiveId);

    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.keyResultsCollection).doc(keyResultId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Key Result ${keyResultId} not found`);
    }

    const data = doc.data()!;
    if (data.objectiveId !== objectiveId) {
      throw new NotFoundException(`Key Result ${keyResultId} not found for this objective`);
    }

    // Remove undefined values
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    const updates = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    // If marking as completed, set completedAt
    if (updateDto.isCompleted && !data.isCompleted) {
      (updates as any).completedAt = new Date().toISOString();
    }

    await db.collection(this.keyResultsCollection).doc(keyResultId).update(updates);

    this.logger.log(`Key Result updated: ${keyResultId}`);

    // Update objective progress
    await this.updateObjectiveProgress(objectiveId);

    return {
      id: doc.id,
      ...data,
      ...updates,
    };
  }

  async deleteKeyResult(userId: string, objectiveId: string, keyResultId: string) {
    // Verify objective ownership
    await this.findOne(userId, objectiveId);

    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.keyResultsCollection).doc(keyResultId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Key Result ${keyResultId} not found`);
    }

    const data = doc.data()!;
    if (data.objectiveId !== objectiveId) {
      throw new NotFoundException(`Key Result ${keyResultId} not found for this objective`);
    }

    await db.collection(this.keyResultsCollection).doc(keyResultId).delete();

    this.logger.log(`Key Result deleted: ${keyResultId}`);

    // Update objective progress
    await this.updateObjectiveProgress(objectiveId);

    return { message: 'Key Result deleted successfully' };
  }

  private async updateObjectiveProgress(objectiveId: string) {
    const keyResults = await this.getKeyResultsForObjective(objectiveId);

    if (keyResults.length === 0) {
      return;
    }

    const completedCount = keyResults.filter((kr: any) => kr.isCompleted).length;
    const progress = Math.round((completedCount / keyResults.length) * 100);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(objectiveId).update({
      progress,
      updatedAt: new Date().toISOString(),
    });
  }

  // Helper methods
  private async countActiveObjectives(userId: string): Promise<number> {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.collection)
      .where('userId', '==', userId)
      .where('status', 'in', [
        ObjectiveStatus.ON_TRACK,
        ObjectiveStatus.AT_RISK,
        ObjectiveStatus.BEHIND,
        ObjectiveStatus.ACTIVE,
      ])
      .get();

    return snapshot.size;
  }

  private calculateEndDate(startDate: string, cycleMonths: number): string {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + cycleMonths);
    return start.toISOString();
  }

  // Toggle completion methods
  async toggleObjectiveCompletion(userId: string, id: string) {
    const objective: any = await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    const newStatus = objective.status === ObjectiveStatus.COMPLETED
      ? ObjectiveStatus.ACTIVE
      : ObjectiveStatus.COMPLETED;

    await db.collection(this.collection).doc(id).update({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Objective ${id} status toggled to ${newStatus}`);

    return this.findOne(userId, id);
  }

  async toggleKeyResultCompletion(
    userId: string,
    objectiveId: string,
    keyResultId: string,
  ) {
    // Verify objective ownership
    await this.findOne(userId, objectiveId);

    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.keyResultsCollection).doc(keyResultId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Key Result ${keyResultId} not found`);
    }

    const data = doc.data()!;
    if (data.objectiveId !== objectiveId) {
      throw new NotFoundException(`Key Result ${keyResultId} not found for this objective`);
    }

    const newIsCompleted = !data.isCompleted;

    const updates: any = {
      isCompleted: newIsCompleted,
      updatedAt: new Date().toISOString(),
    };

    // Set or clear completedAt based on new status
    if (newIsCompleted) {
      updates.completedAt = new Date().toISOString();
    } else {
      updates.completedAt = null;
    }

    await db.collection(this.keyResultsCollection).doc(keyResultId).update(updates);

    this.logger.log(`Key Result ${keyResultId} completion toggled to ${newIsCompleted}`);

    // Update objective progress
    await this.updateObjectiveProgress(objectiveId);

    return {
      id: doc.id,
      ...data,
      ...updates,
    };
  }

  // Archive method
  async archiveObjective(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Archive all key results first
    const keyResultsSnapshot = await db
      .collection(this.keyResultsCollection)
      .where('objectiveId', '==', id)
      .get();

    const batch = db.batch();
    keyResultsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isArchived: true,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    // Archive objective
    await db.collection(this.collection).doc(id).update({
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Objective ${id} and its key results archived`);

    return this.findOne(userId, id);
  }
}
