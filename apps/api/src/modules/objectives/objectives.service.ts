import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateObjectiveDto, UpdateObjectiveDto, ObjectiveStatus, CreateKeyResultDto, UpdateKeyResultDto } from './dto';

@Injectable()
export class ObjectivesService {
  private readonly logger = new Logger(ObjectivesService.name);
  private readonly collection = 'objectives';
  private readonly keyResultsCollection = 'keyResults';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateObjectiveDto) {
    const db = this.firebaseService.getFirestore();


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

    // Create key results if provided - IN PARALLEL
    if (keyResults && keyResults.length > 0) {
      this.logger.log(`📋 Creating ${keyResults.length} Key Results for objective ${docRef.id}`);

      const keyResultPromises = keyResults.map(async (kr, index) => {
        const keyResultDto = {
          ...kr,
          objectiveId: docRef.id,
          order: typeof kr.order === 'number' ? kr.order : index, // Use provided order or array index
        };
        return this.createKeyResult(userId, docRef.id, keyResultDto);
      });

      await Promise.all(keyResultPromises);
    } else {
      this.logger.log(`📋 No Key Results to create for objective ${docRef.id}`);
    }

    // Return the created objective with key results directly (avoid extra query)
    const createdKeyResults: any[] = [];
    if (keyResults && keyResults.length > 0) {
      // Get the created key results
      const keyResultsSnapshot = await db
        .collection(this.keyResultsCollection)
        .where('objectiveId', '==', docRef.id)
        .where('userId', '==', userId)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'asc')
        .get();

      keyResultsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const completionPercentage = data.targetValue > 0
          ? Math.min(Math.round((data.currentValue / data.targetValue) * 100), 100)
          : 0;

        createdKeyResults.push({
          id: doc.id,
          ...data,
          completionPercentage,
        });
      });
    }

    return {
      id: docRef.id,
      ...objective,
      keyResults: createdKeyResults,
    };
  }

  async findAll(userId: string, lifeAreaId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db.collection(this.collection).where('userId', '==', userId);

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
    }

    const snapshot = await query.get();

    // Get all objectives first
    const objectives = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all key results for these objectives in a single query
    const objectiveIds = objectives.map(obj => obj.id);

    let allKeyResults: any[] = [];
    if (objectiveIds.length > 0) {
      const keyResultsSnapshot = await db
        .collection(this.keyResultsCollection)
        .where('objectiveId', 'in', objectiveIds)
        .where('userId', '==', userId)
        .orderBy('order', 'asc')
        .orderBy('createdAt', 'asc')
        .get();

      allKeyResults = keyResultsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const completionPercentage = data.targetValue > 0
            ? Math.min(Math.round((data.currentValue / data.targetValue) * 100), 100)
            : 0;

          return {
            id: doc.id,
            ...data,
            completionPercentage,
          };
        })
;
    }

    // Group key results by objectiveId
    const keyResultsByObjective: { [key: string]: any[] } = allKeyResults.reduce((acc: { [key: string]: any[] }, kr: any) => {
      if (!acc[kr.objectiveId]) {
        acc[kr.objectiveId] = [];
      }
      acc[kr.objectiveId].push(kr);
      return acc;
    }, {});

    // Combine objectives with their key results
    const objectivesWithKeyResults = objectives.map((objective) => {
      const keyResults = keyResultsByObjective[objective.id] || [];
      this.logger.log(`🔍 Found ${keyResults.length} Key Results for objective ${objective.id}`);
      return {
        ...objective,
        keyResults,
      };
    });

    return objectivesWithKeyResults;
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

    // Fetch key results - optimized version without extra validation
    const keyResultsSnapshot = await db
      .collection(this.keyResultsCollection)
      .where('objectiveId', '==', id)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get();

    const keyResults = keyResultsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const completionPercentage = data.targetValue > 0
        ? Math.min(Math.round((data.currentValue / data.targetValue) * 100), 100)
        : 0;

      return {
        id: doc.id,
        ...data,
        completionPercentage,
      };
    });

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
    this.logger.log(`🔑 Starting Key Result creation for objective ${objectiveId}, user ${userId}`);
    this.logger.log(`🔑 CreateKeyResultDto: ${JSON.stringify(createDto)}`);

    // Verify objective ownership
    await this.findOne(userId, objectiveId);

    const db = this.firebaseService.getFirestore();

    // Get the next order number if not provided
    let order = createDto.order;
    if (typeof order !== 'number') {
      // Get current key results count to determine next order
      const existingKeyResults = await this.getKeyResultsForObjective(userId, objectiveId);
      order = existingKeyResults.length;
    }

    const keyResult = {
      ...createDto,
      objectiveId,
      userId, // Adicionar userId para segurança
      order,
      currentValue: createDto.currentValue || 0,
      isCompleted: (createDto.currentValue || 0) >= createDto.targetValue,
      isArchived: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.logger.log(`🔑 Final Key Result data: ${JSON.stringify(keyResult)}`);

    const docRef = await db.collection(this.keyResultsCollection).add(keyResult);

    this.logger.log(`✅ Key Result created successfully: ${docRef.id} for objective ${objectiveId}`);

    // Update objective progress
    await this.updateObjectiveProgress(userId, objectiveId);

    const result = {
      id: docRef.id,
      ...keyResult,
    };

    this.logger.log(`🔑 Returning Key Result: ${JSON.stringify(result)}`);
    return result;
  }

  async getKeyResultsForObjective(userId: string, objectiveId: string) {
    const db = this.firebaseService.getFirestore();

    // Validar se o objetivo pertence ao usuário primeiro
    const objectiveDoc = await db.collection(this.collection).doc(objectiveId).get();
    if (!objectiveDoc.exists || objectiveDoc.data()?.userId !== userId) {
      throw new NotFoundException('Objective not found');
    }

    const snapshot = await db
      .collection(this.keyResultsCollection)
      .where('objectiveId', '==', objectiveId)
      .where('userId', '==', userId) // Segurança adicional
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const completionPercentage = data.targetValue > 0
        ? Math.min(Math.round((data.currentValue / data.targetValue) * 100), 100)
        : 0;

      return {
        id: doc.id,
        ...data,
        completionPercentage,
      };
    });
  }

  async updateKeyResult(
    userId: string,
    objectiveId: string,
    keyResultId: string,
    updateDto: UpdateKeyResultDto,
  ) {
    const db = this.firebaseService.getFirestore();

    return await db.runTransaction(async (transaction) => {
      // ALL READS FIRST (Firestore requirement)

      // 1. Verify objective ownership in transaction
      const objectiveRef = db.collection(this.collection).doc(objectiveId);
      const objectiveDoc = await transaction.get(objectiveRef);

      // 2. Get key result in transaction
      const keyResultRef = db.collection(this.keyResultsCollection).doc(keyResultId);
      const keyResultDoc = await transaction.get(keyResultRef);

      // 3. Get all key results for progress calculation
      const keyResultsSnapshot = await transaction.get(
        db.collection(this.keyResultsCollection)
          .where('objectiveId', '==', objectiveId)
          .where('userId', '==', userId)
      );

      // NOW VALIDATE AND PROCESS (no more reads after this point)

      if (!objectiveDoc.exists || objectiveDoc.data()?.userId !== userId) {
        throw new NotFoundException('Objective not found');
      }

      if (!keyResultDoc.exists) {
        throw new NotFoundException(`Key Result ${keyResultId} not found`);
      }

      const data = keyResultDoc.data()!;
      if (data.objectiveId !== objectiveId || data.userId !== userId) {
        throw new NotFoundException(`Key Result ${keyResultId} not found for this objective`);
      }

      // 4. Prepare updates
      const cleanedDto = Object.fromEntries(
        Object.entries(updateDto).filter(([_, v]) => v !== undefined),
      );

      const updates = {
        ...cleanedDto,
        updatedAt: new Date().toISOString(),
      };

      // 5. If marking as completed, set completedAt
      if (updateDto.isCompleted && !data.isCompleted) {
        (updates as any).completedAt = new Date().toISOString();
      }

      // ALL WRITES NOW

      // 6. Update key result in transaction
      transaction.update(keyResultRef, updates);

      // 7. Calculate and update objective progress

      const keyResults = keyResultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Apply updates if this is the document being updated
        ...(doc.id === keyResultId ? updates : {})
      }));

      if (keyResults.length > 0) {
        const completedCount = keyResults.filter((kr: any) => kr.isCompleted).length;
        const progress = Math.round((completedCount / keyResults.length) * 100);

        transaction.update(objectiveRef, {
          progress,
          updatedAt: new Date().toISOString(),
        });
      }

      this.logger.log(`Key Result updated: ${keyResultId}`);

      return {
        id: keyResultId,
        ...data,
        ...updates,
      };
    });
  }

  async deleteKeyResult(userId: string, objectiveId: string, keyResultId: string) {
    const db = this.firebaseService.getFirestore();

    return await db.runTransaction(async (transaction) => {
      // ALL READS FIRST (Firestore requirement)

      // 1. Verify objective ownership
      const objectiveRef = db.collection(this.collection).doc(objectiveId);
      const objectiveDoc = await transaction.get(objectiveRef);

      // 2. Get key result
      const keyResultRef = db.collection(this.keyResultsCollection).doc(keyResultId);
      const keyResultDoc = await transaction.get(keyResultRef);

      // 3. Get all key results for progress calculation
      const remainingKeyResultsSnapshot = await transaction.get(
        db.collection(this.keyResultsCollection)
          .where('objectiveId', '==', objectiveId)
          .where('userId', '==', userId)
      );

      // NOW VALIDATE AND PROCESS (no more reads after this point)

      if (!objectiveDoc.exists || objectiveDoc.data()?.userId !== userId) {
        throw new NotFoundException('Objective not found');
      }

      if (!keyResultDoc.exists) {
        throw new NotFoundException(`Key Result ${keyResultId} not found`);
      }

      const data = keyResultDoc.data()!;
      if (data.objectiveId !== objectiveId || data.userId !== userId) {
        throw new NotFoundException(`Key Result ${keyResultId} not found for this objective`);
      }

      // ALL WRITES NOW

      // 4. Delete key result in transaction
      transaction.delete(keyResultRef);

      // 5. Update objective progress

      const remainingKeyResults = remainingKeyResultsSnapshot.docs
        .filter(doc => doc.id !== keyResultId) // Exclude the one being deleted
        .map(doc => ({ id: doc.id, ...doc.data() }));

      if (remainingKeyResults.length > 0) {
        const completedCount = remainingKeyResults.filter((kr: any) => kr.isCompleted).length;
        const progress = Math.round((completedCount / remainingKeyResults.length) * 100);

        transaction.update(objectiveRef, {
          progress,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // No key results left, set progress to 0
        transaction.update(objectiveRef, {
          progress: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      this.logger.log(`Key Result deleted: ${keyResultId}`);

      return { message: 'Key Result deleted successfully' };
    });
  }

  private async updateObjectiveProgress(userId: string, objectiveId: string) {
    const keyResults = await this.getKeyResultsForObjective(userId, objectiveId);

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
    await this.updateObjectiveProgress(userId, objectiveId);

    return {
      id: doc.id,
      ...data,
      ...updates,
    };
  }

  // Batch update key results method
  async batchUpdateKeyResults(
    userId: string,
    objectiveId: string,
    updates: Array<{id: string, dto: any}>
  ) {
    if (updates.length === 0) {
      return { success: 0, errors: 0, results: [] };
    }

    const db = this.firebaseService.getFirestore();
    const batch = db.batch();
    const results: Array<{id: string, success: boolean, error?: string}> = [];
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const keyResultRef = db.collection(this.keyResultsCollection).doc(update.id);

        // Verify key result exists and belongs to user/objective
        const keyResultDoc = await keyResultRef.get();
        if (!keyResultDoc.exists) {
          throw new Error(`Key result ${update.id} not found`);
        }

        const keyResultData = keyResultDoc.data();
        if (keyResultData?.userId !== userId || keyResultData?.objectiveId !== objectiveId) {
          throw new Error(`Key result ${update.id} access denied`);
        }

        // Add to batch
        batch.update(keyResultRef, {
          ...update.dto,
          updatedAt: new Date().toISOString(),
        });

        results.push({ id: update.id, success: true });
        successCount++;
      } catch (error) {
        this.logger.error(`Error preparing batch update for KR ${update.id}:`, error);
        results.push({ id: update.id, success: false, error: error.message });
        errorCount++;
      }
    }

    // Execute batch
    if (successCount > 0) {
      try {
        await batch.commit();
        this.logger.log(`✅ Batch updated ${successCount} key results for objective ${objectiveId}`);
      } catch (error) {
        this.logger.error(`Error executing batch update:`, error);
        throw new Error(`Batch update failed: ${error.message}`);
      }
    }

    return { success: successCount, errors: errorCount, results };
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
