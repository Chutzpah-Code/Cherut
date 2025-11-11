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

    const task: any = doc.data();

    if (task?.userId !== userId) {
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

    // Convert DTOs to plain objects for Firestore compatibility
    // Firestore doesn't support objects with custom prototypes (class instances)
    const plainDto = JSON.parse(JSON.stringify(cleanedDto));

    const updatedData = {
      ...plainDto,
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.collection(this.collection).doc(id).update(updatedData);
      this.logger.log(`Task updated: ${id}`);
      return this.findOne(userId, id);
    } catch (error) {
      this.logger.error(`Error updating task ${id}:`, error);
      this.logger.error(`Update data:`, JSON.stringify(updatedData, null, 2));
      throw error;
    }
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
    await this.findOne(userId, taskId);

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
   * Get tasks grouped by status (for Kanban board)
   */
  async getKanbanBoard(userId: string, lifeAreaId?: string, includeArchived = false) {
    let tasks: any[] = await this.findAll(userId, lifeAreaId);

    // Filter out archived tasks by default
    if (!includeArchived) {
      tasks = tasks.filter((t) => !t.archived);
    }

    const board = {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };

    return board;
  }

  /**
   * Start time tracking for a task
   */
  async startTimeTracking(userId: string, taskId: string) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    // Check if there's already an active tracking session
    const activeTracking = task.timeTracking?.find(
      (t: any) => t.status === 'running',
    );

    if (activeTracking) {
      throw new BadRequestException('Task already has an active tracking session');
    }

    const newEntry = {
      id: db.collection('temp').doc().id, // Generate unique ID
      startTime: new Date().toISOString(),
      status: 'running',
    };

    const timeTracking = [...(task.timeTracking || []), newEntry];

    await db.collection(this.collection).doc(taskId).update({
      timeTracking,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Time tracking started for task: ${taskId}`);
    return this.findOne(userId, taskId);
  }

  /**
   * Pause time tracking for a task
   */
  async pauseTimeTracking(userId: string, taskId: string, trackingId: string) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    const tracking = task.timeTracking?.find((t: any) => t.id === trackingId);
    if (!tracking) {
      throw new NotFoundException('Time tracking entry not found');
    }

    if (tracking.status !== 'running') {
      throw new BadRequestException('Time tracking is not running');
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - new Date(tracking.startTime).getTime()) / 1000,
    );

    const updatedTracking = task.timeTracking.map((t: any) =>
      t.id === trackingId
        ? { ...t, endTime: endTime.toISOString(), duration, status: 'paused' }
        : t,
    );

    const totalTimeTracked = (task.totalTimeTracked || 0) + duration;

    await db.collection(this.collection).doc(taskId).update({
      timeTracking: updatedTracking,
      totalTimeTracked,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Time tracking paused for task: ${taskId}`);
    return this.findOne(userId, taskId);
  }

  /**
   * Stop time tracking for a task
   */
  async stopTimeTracking(userId: string, taskId: string, trackingId: string) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    const tracking = task.timeTracking?.find((t: any) => t.id === trackingId);
    if (!tracking) {
      throw new NotFoundException('Time tracking entry not found');
    }

    if (tracking.status === 'completed' || tracking.status === 'cancelled') {
      throw new BadRequestException('Time tracking already stopped');
    }

    const endTime = new Date();
    let duration = tracking.duration || 0;

    if (tracking.status === 'running') {
      duration += Math.floor(
        (endTime.getTime() - new Date(tracking.startTime).getTime()) / 1000,
      );
    }

    const updatedTracking = task.timeTracking.map((t: any) =>
      t.id === trackingId
        ? { ...t, endTime: endTime.toISOString(), duration, status: 'completed' }
        : t,
    );

    const totalTimeTracked = (task.totalTimeTracked || 0) +
      (duration - (tracking.duration || 0));

    await db.collection(this.collection).doc(taskId).update({
      timeTracking: updatedTracking,
      totalTimeTracked,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Time tracking stopped for task: ${taskId}`);
    return this.findOne(userId, taskId);
  }

  /**
   * Cancel time tracking for a task
   */
  async cancelTimeTracking(userId: string, taskId: string, trackingId: string) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    const tracking = task.timeTracking?.find((t: any) => t.id === trackingId);
    if (!tracking) {
      throw new NotFoundException('Time tracking entry not found');
    }

    const updatedTracking = task.timeTracking.map((t: any) =>
      t.id === trackingId
        ? { ...t, status: 'cancelled', endTime: new Date().toISOString() }
        : t,
    );

    await db.collection(this.collection).doc(taskId).update({
      timeTracking: updatedTracking,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Time tracking cancelled for task: ${taskId}`);
    return this.findOne(userId, taskId);
  }

  /**
   * Toggle checklist item
   */
  async toggleChecklistItem(
    userId: string,
    taskId: string,
    checklistItemId: string,
  ) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    const updatedChecklist = task.checklist?.map((item: any) =>
      item.id === checklistItemId
        ? { ...item, completed: !item.completed }
        : item,
    );

    await db.collection(this.collection).doc(taskId).update({
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Checklist item toggled for task: ${taskId}`);
    return this.findOne(userId, taskId);
  }

  /**
   * Archive/Unarchive task
   */
  async toggleArchive(userId: string, taskId: string) {
    const task: any = await this.findOne(userId, taskId);
    const db = this.firebaseService.getFirestore();

    await db.collection(this.collection).doc(taskId).update({
      archived: !task.archived,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Task archived status toggled: ${taskId}`);
    return this.findOne(userId, taskId);
  }
}
