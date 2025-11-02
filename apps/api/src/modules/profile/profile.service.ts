import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly collection = 'profiles';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateProfileDto) {
    const db = this.firebaseService.getFirestore();

    // Check if profile already exists
    const existingProfile = await db
      .collection(this.collection)
      .doc(userId)
      .get();

    if (existingProfile.exists) {
      throw new ConflictException('Profile already exists for this user');
    }

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
    );

    const profile = {
      ...cleanedDto,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(userId).set(profile);

    this.logger.log(`Profile created for user ${userId}`);

    return {
      id: userId,
      ...profile,
    };
  }

  async findOne(userId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.collection).doc(userId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async update(userId: string, updateDto: UpdateProfileDto) {
    // Verify profile exists
    await this.findOne(userId);

    const db = this.firebaseService.getFirestore();

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    const updates = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(userId).update(updates);

    this.logger.log(`Profile updated for user ${userId}`);

    return this.findOne(userId);
  }

  async remove(userId: string) {
    // Verify profile exists
    await this.findOne(userId);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(userId).delete();

    this.logger.log(`Profile deleted for user ${userId}`);

    return { message: 'Profile deleted successfully' };
  }

  async getOrCreate(userId: string, defaultData?: CreateProfileDto) {
    try {
      return await this.findOne(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.create(userId, defaultData || {});
      }
      throw error;
    }
  }
}
