import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { HabitsService } from '../habits/habits.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateLifeAreaDto, UpdateLifeAreaDto } from './dto';
import { PRESET_LIFE_AREAS } from './constants/preset-life-areas';

@Injectable()
export class LifeAreasService {
  private readonly logger = new Logger(LifeAreasService.name);
  private readonly collection = 'lifeAreas';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly objectivesService: ObjectivesService,
    private readonly habitsService: HabitsService,
    private readonly tasksService: TasksService,
  ) {}

  async create(userId: string, createDto: CreateLifeAreaDto) {
    const db = this.firebaseService.getFirestore();

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([, v]) => v !== undefined),
    );

    const lifeArea = {
      ...cleanedDto,
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

    return snapshot.docs.map((doc) => ({
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
    const existing: any = await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Remove undefined values (Firestore doesn't accept them)
    const cleanedDto: Record<string, unknown> = Object.fromEntries(
      Object.entries(updateDto).filter(([, v]) => v !== undefined),
    );

    if (existing.isSystemPreset) {
      const disallowed = Object.keys(cleanedDto).filter(
        (key) => key !== 'name',
      );
      if (disallowed.length > 0) {
        throw new BadRequestException('Preset life areas can only be renamed');
      }
    }

    const updates: Record<string, unknown> = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    if (existing.isSystemPreset && 'name' in cleanedDto) {
      updates.nameOverridden = true;
    }

    await db.collection(this.collection).doc(id).update(updates);

    this.logger.log(`Life area updated: ${id}`);

    return this.findOne(userId, id);
  }

  // habitsService.findAll defaults to active-only (isActive == true) when
  // `archived` is omitted — it never returns both in one call, unlike
  // objectives/tasks. Fetch both so a life area's archived habits aren't
  // left behind with a dangling lifeAreaId when the area is deleted.
  private async findAllHabitsForLifeArea(userId: string, lifeAreaId: string) {
    const [active, archived] = await Promise.all([
      this.habitsService.findAll(userId, lifeAreaId, false),
      this.habitsService.findAll(userId, lifeAreaId, true),
    ]);
    return [...active, ...archived];
  }

  async remove(userId: string, id: string) {
    const existing: any = await this.findOne(userId, id);

    if (existing.isSystemPreset) {
      throw new ForbiddenException('Preset life areas cannot be deleted');
    }

    const [objectives, habits, tasks] = await Promise.all([
      this.objectivesService.findAll(userId, id),
      this.findAllHabitsForLifeArea(userId, id),
      this.tasksService.findAll(userId, id),
    ]);

    await Promise.all([
      ...objectives.map((o: any) =>
        this.objectivesService.remove(userId, o.id),
      ),
      ...habits.map((h: any) => this.habitsService.remove(userId, h.id)),
      ...tasks.map((t: any) => this.tasksService.remove(userId, t.id)),
    ]);

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(id).delete();

    this.logger.log(
      `Life area deleted: ${id} (cascaded ${objectives.length} objectives, ${habits.length} habits, ${tasks.length} tasks)`,
    );

    return { message: 'Life area deleted successfully' };
  }

  async getImpact(userId: string, id: string) {
    await this.findOne(userId, id);

    const [objectives, habits, tasks] = await Promise.all([
      this.objectivesService.findAll(userId, id),
      this.findAllHabitsForLifeArea(userId, id),
      this.tasksService.findAll(userId, id),
    ]);

    const toItems = (docs: any[]) =>
      docs.map((d) => ({ id: d.id, title: d.title }));

    return {
      objectives: { count: objectives.length, items: toItems(objectives) },
      habits: { count: habits.length, items: toItems(habits) },
      tasks: { count: tasks.length, items: toItems(tasks) },
    };
  }

  async seedDefaults(userId: string) {
    const db = this.firebaseService.getFirestore();

    const existing = await db
      .collection(this.collection)
      .where('userId', '==', userId)
      .where('isSystemPreset', '==', true)
      .limit(1)
      .get();

    if (!existing.empty) {
      return;
    }

    const now = new Date().toISOString();
    const batch = db.batch();

    for (const preset of PRESET_LIFE_AREAS) {
      const ref = db.collection(this.collection).doc();
      batch.set(ref, {
        name: preset.name,
        description: preset.subItems.join(' · '),
        userId,
        isSystemPreset: true,
        presetSlug: preset.slug,
        nameOverridden: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();
    this.logger.log(
      `Seeded ${PRESET_LIFE_AREAS.length} preset life areas for user ${userId}`,
    );
  }
}
