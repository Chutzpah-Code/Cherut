import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateObjectiveDto, UpdateObjectiveDto, ObjectiveStatus } from './dto';

@Injectable()
export class ObjectivesService {
  private readonly logger = new Logger(ObjectivesService.name);
  private readonly collection = 'objectives';
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

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
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
      status: createDto.status || ObjectiveStatus.ON_TRACK,
      cycleMonths,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(objective);

    this.logger.log(`Objective created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...objective,
    };
  }

  async findAll(userId: string, lifeAreaId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db.collection(this.collection).where('userId', '==', userId);

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
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
      throw new NotFoundException(`Objective ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Objective ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
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
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Objective deleted: ${id}`);

    return { message: 'Objective deleted successfully' };
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
      ])
      .get();

    return snapshot.size;
  }

  private calculateEndDate(startDate: string, cycleMonths: number): string {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + cycleMonths);
    return start.toISOString();
  }
}
