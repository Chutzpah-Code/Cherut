import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly collection = 'tasks';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateTaskDto) {
    const db = this.firebaseService.getFirestore();

    // Filter out undefined values
    const cleanedDto = Object.fromEntries(
      Object.entries(createDto).filter(([_, v]) => v !== undefined),
    );

    // Set defaults
    const task = {
      ...cleanedDto,
      userId,
      status: createDto.status || 'todo',
      priority: createDto.priority || 'medium',
      completedPomodoros: createDto.completedPomodoros || 0,
      order: createDto.order ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.collection).add(task);

    this.logger.log(`Task created: ${docRef.id} for user ${userId}`);

    return { id: docRef.id, ...task };
  }

  async findAll(
    userId: string,
    lifeAreaId?: string,
    actionPlanId?: string,
    status?: string,
  ) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.collection)
      .where('userId', '==', userId)
      .orderBy('order', 'asc')
      .orderBy('createdAt', 'desc');

    if (lifeAreaId) {
      query = query.where('lifeAreaId', '==', lifeAreaId);
    }

    if (actionPlanId) {
      query = query.where('actionPlanId', '==', actionPlanId);
    }

    if (status) {
      query = query.where('status', '==', status);
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
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const task = doc.data();

    if (task.userId !== userId) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return { id: doc.id, ...task };
  }

  async update(userId: string, id: string, updateDto: UpdateTaskDto) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    // Filter out undefined values
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    );

    const updatedData = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.collection).doc(id).update(updatedData);

    this.logger.log(`Task updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    await db.collection(this.collection).doc(id).delete();

    this.logger.log(`Task deleted: ${id}`);

    return { message: 'Task deleted successfully' };
  }

  /**
   * Update task order (for Kanban drag-and-drop)
   */
  async updateOrder(
    userId: string,
    taskId: string,
    newOrder: number,
    newStatus?: string,
  ) {
    const task = await this.findOne(userId, taskId);

    const updateData: any = {
      order: newOrder,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus) {
      updateData.status = newStatus;
    }

    const db = this.firebaseService.getFirestore();
    await db.collection(this.collection).doc(taskId).update(updateData);

    this.logger.log(`Task order updated: ${taskId} to ${newOrder}`);

    return this.findOne(userId, taskId);
  }

  /**
   * Increment completed pomodoros
   */
  async incrementPomodoro(userId: string, taskId: string) {
    const task = await this.findOne(userId, taskId);

    const currentPomodoros = task.completedPomodoros || 0;
    const estimatedPomodoros = task.estimatedPomodoros || 0;

    if (estimatedPomodoros > 0 && currentPomodoros >= estimatedPomodoros) {
      throw new BadRequestException(
        'Task has already reached estimated pomodoros',
      );
    }

    const db = this.firebaseService.getFirestore();
    await db
      .collection(this.collection)
      .doc(taskId)
      .update({
        completedPomodoros: currentPomodoros + 1,
        updatedAt: new Date().toISOString(),
      });

    this.logger.log(`Pomodoro incremented for task: ${taskId}`);

    return this.findOne(userId, taskId);
  }

  /**
   * Get tasks grouped by status (for Kanban board)
   */
  async getKanbanBoard(userId: string, lifeAreaId?: string) {
    const tasks = await this.findAll(userId, lifeAreaId);

    const board = {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };

    return board;
  }
}
