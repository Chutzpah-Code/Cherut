import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateLifeAreaDto, UpdateLifeAreaDto } from './dto';

@Injectable()
export class LifeAreasService {
  private readonly logger = new Logger(LifeAreasService.name);
  private readonly collection = 'lifeAreas';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateLifeAreaDto) {
    const db = this.firebaseService.getFirestore();

    const lifeArea = {
      ...createDto,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(lifeArea);

    this.logger.log(`Life area created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...lifeArea,
    };
  }

  async findAll(userId: string) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Life area ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Life area ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateLifeAreaDto) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    const updates = {
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(id).update(updates);

    this.logger.log(`Life area updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Life area deleted: ${id}`);

    return { message: 'Life area deleted successfully' };
  }
}
