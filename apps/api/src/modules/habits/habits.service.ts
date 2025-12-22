import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateHabitDto, UpdateHabitDto, LogHabitDto } from './dto';

@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);
  private readonly habitsCollection = 'habits';
  private readonly logsCollection = 'habitLogs';

  constructor(private readonly firebaseService: FirebaseService) {}

  // Habits CRUD
  async create(userId: string, createDto: CreateHabitDto) {
    const db = this.firebaseService.getFirestore();

    // Remove undefined values
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
    );

    const habit = {
      ...cleanedDto,
      userId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.habitsCollection).add(habit);

    this.logger.log(`Habit created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...habit,
    };
  }

  async findAll(userId: string, lifeAreaId?: string, archived?: boolean) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.habitsCollection)
      .where('userId', '==', userId);

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
    }

    const snapshot = await query.get();

    let habits = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by archived status in code to handle legacy data
    if (archived !== undefined) {
      habits = habits.filter((habit: any) => {
        const isActive = habit.isActive !== undefined ? habit.isActive : true; // default to active for legacy data
        return !isActive === archived; // archived=true means !isActive, archived=false means isActive
      });
    } else {
      // Default behavior: only active habits (including legacy habits without isActive field)
      habits = habits.filter((habit: any) => {
        const isActive = habit.isActive !== undefined ? habit.isActive : true;
        return isActive;
      });
    }

    return habits;
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.habitsCollection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Habit ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Habit ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateHabitDto) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    const updates = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.habitsCollection).doc(id).update(updates);

    this.logger.log(`Habit updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Soft delete - mark as inactive
    await db.collection(this.habitsCollection).doc(id).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Habit deactivated: ${id}`);

    return { message: 'Habit deactivated successfully' };
  }

  // Habit Logging
  async logHabit(userId: string, logDto: LogHabitDto) {
    const db = this.firebaseService.getFirestore();

    // Verify habit exists and belongs to user
    const habit = await this.findOne(userId, logDto.habitId);

    // Validate log data based on habit type
    this.validateLogData(habit, logDto);

    // Check if log already exists for this date
    const existingLog = await this.findLogByDate(
      userId,
      logDto.habitId,
      logDto.date,
    );

    const cleanedDto = Object.fromEntries(
      Object.entries(logDto).filter(([_, v]) => v !== undefined),
    );

    const logData = {
      ...cleanedDto,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingLog) {
      // Update existing log
      await db.collection(this.logsCollection).doc(existingLog.id).update({
        ...logData,
        updatedAt: new Date().toISOString(),
      });

      this.logger.log(
        `Habit log updated for habit ${logDto.habitId} on ${logDto.date}`,
      );

      return {
        id: existingLog.id,
        ...logData,
      };
    } else {
      // Create new log
      const docRef = await db.collection(this.logsCollection).add(logData);

      this.logger.log(
        `Habit logged: ${docRef.id} for habit ${logDto.habitId} on ${logDto.date}`,
      );

      return {
        id: docRef.id,
        ...logData,
      };
    }
  }

  async getHabitLogs(
    userId: string,
    habitId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const db = this.firebaseService.getFirestore();

    // Verify habit ownership
    await this.findOne(userId, habitId);

    try {
      let query = db
        .collection(this.logsCollection)
        .where('userId', '==', userId)
        .where('habitId', '==', habitId);

      // Only add date filters if provided
      if (startDate && endDate) {
        query = query.where('date', '>=', startDate).where('date', '<=', endDate);
      } else if (startDate) {
        query = query.where('date', '>=', startDate);
      } else if (endDate) {
        query = query.where('date', '<=', endDate);
      }

      const snapshot = await query.orderBy('date', 'desc').get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      // If query fails (e.g., no index), return empty array
      this.logger.warn(`Failed to get habit logs for ${habitId}: ${error.message}`);
      return [];
    }
  }

  // Helper methods
  private async findLogByDate(userId: string, habitId: string, date: string) {
    const db = this.firebaseService.getFirestore();

    const snapshot = await db
      .collection(this.logsCollection)
      .where('userId', '==', userId)
      .where('habitId', '==', habitId)
      .where('date', '==', date)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  private validateLogData(habit: any, logDto: LogHabitDto) {
    if (habit.type === 'boolean' && logDto.completed === undefined) {
      throw new BadRequestException(
        'Boolean habits require "completed" field',
      );
    }

    if (
      (habit.type === 'counter' || habit.type === 'duration') &&
      logDto.value === undefined
    ) {
      throw new BadRequestException(
        `${habit.type} habits require "value" field`,
      );
    }
  }

  /**
   * Archive/Unarchive habit (toggle isActive status)
   */
  async toggleArchive(userId: string, habitId: string) {
    const habit: any = await this.findOne(userId, habitId);
    const db = this.firebaseService.getFirestore();

    const newActiveStatus = !habit.isActive;

    await db.collection(this.habitsCollection).doc(habitId).update({
      isActive: newActiveStatus,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Habit ${habitId} archived status toggled to ${!newActiveStatus}`);
    return this.findOne(userId, habitId);
  }

  /**
   * Get habit counts (active, archived, total)
   */
  async getHabitCounts(userId: string, lifeAreaId?: string) {
    // Get all habits regardless of archived status
    const allHabits = await this.findAllWithoutFilter(userId, lifeAreaId);

    const active = allHabits.filter((habit: any) => {
      const isActive = habit.isActive !== undefined ? habit.isActive : true; // default to active for legacy data
      return isActive;
    }).length;

    const archived = allHabits.filter((habit: any) => {
      const isActive = habit.isActive !== undefined ? habit.isActive : true; // default to active for legacy data
      return !isActive;
    }).length;

    const total = allHabits.length;

    return { active, archived, total };
  }

  /**
   * Helper method to get all habits without isActive filter
   */
  private async findAllWithoutFilter(userId: string, lifeAreaId?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.habitsCollection)
      .where('userId', '==', userId);

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
