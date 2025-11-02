import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import {
  CreateActionPlanDto,
  UpdateActionPlanDto,
  ActionPlanStatus,
} from './dto';

@Injectable()
export class ActionPlansService {
  private readonly logger = new Logger(ActionPlansService.name);
  private readonly collection = 'actionPlans';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateActionPlanDto) {
    const db = this.firebaseService.getFirestore();

    // Verify key result exists and belongs to user
    await this.verifyKeyResultOwnership(userId, createDto.keyResultId);

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
    );

    const actionPlan = {
      ...cleanedDto,
      userId,
      status: createDto.status || ActionPlanStatus.NOT_STARTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(actionPlan);

    this.logger.log(`Action Plan created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...actionPlan,
    };
  }

  async findAll(userId: string, keyResultId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db.collection(this.collection).where('userId', '==', userId);

    if (keyResultId) {
      query = query.where('keyResultId', '==', keyResultId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Action Plan ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Action Plan ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateActionPlanDto) {
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

    this.logger.log(`Action Plan updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Action Plan deleted: ${id}`);

    return { message: 'Action Plan deleted successfully' };
  }

  // Helper methods
  private async verifyKeyResultOwnership(
    userId: string,
    keyResultId: string,
  ): Promise<void> {
    const db = this.firebaseService.getFirestore();
    const keyResultDoc = await db
      .collection('keyResults')
      .doc(keyResultId)
      .get();

    if (!keyResultDoc.exists) {
      throw new NotFoundException(`Key Result ${keyResultId} not found`);
    }

    const keyResultData = keyResultDoc.data()!;
    if (keyResultData.userId !== userId) {
      throw new NotFoundException(`Key Result ${keyResultId} not found`);
    }
  }
}
