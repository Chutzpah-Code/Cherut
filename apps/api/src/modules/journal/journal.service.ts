import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './dto';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);
  private readonly journalCollection = 'journalEntries';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createDto: CreateJournalEntryDto) {
    const db = this.firebaseService.getFirestore();

    const entry = {
      title: createDto.title,
      content: createDto.content,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(this.journalCollection).add(entry);

    this.logger.log(`Journal entry created: ${docRef.id} for user ${userId}`);

    return {
      id: docRef.id,
      ...entry,
    };
  }

  async findAll(userId: string, search?: string, archived?: boolean) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.journalCollection)
      .where('userId', '==', userId);

    const snapshot = await query.get();

    let entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter by archived status
    if (archived !== undefined) {
      entries = entries.filter((entry: any) => {
        const isArchived = entry.isArchived !== undefined ? entry.isArchived : false; // default to active for legacy data
        return isArchived === archived;
      });
    } else {
      // Default behavior: only active entries (including legacy entries without isArchived field)
      entries = entries.filter((entry: any) => {
        const isArchived = entry.isArchived !== undefined ? entry.isArchived : false;
        return !isArchived;
      });
    }

    // If there's a search, filter by title only
    if (search) {
      const searchTerm = search.toLowerCase();
      entries = entries.filter((entry: any) =>
        entry.title && entry.title.toLowerCase().includes(searchTerm)
      );
    }

    return entries;
  }

  async findOne(userId: string, id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection(this.journalCollection).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }

    return {
      id: doc.id,
      ...data,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateJournalEntryDto) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    const updates = {
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(this.journalCollection).doc(id).update(updates);

    this.logger.log(`Journal entry updated: ${id}`);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const db = this.firebaseService.getFirestore();

    await db.collection(this.journalCollection).doc(id).delete();

    this.logger.log(`Journal entry deleted: ${id}`);

    return { message: 'Journal entry deleted successfully' };
  }

  async searchByDate(userId: string, startDate: string, endDate?: string) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.journalCollection)
      .where('userId', '==', userId);

    const snapshot = await query.get();

    let entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by date range on client side
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    entries = entries.filter((entry: any) => {
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt);
      if (entryDate < startDateObj) return false;
      if (endDateObj && entryDate > endDateObj) return false;
      return true;
    });

    return entries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Archive/Unarchive journal entry (toggle isArchived status)
   */
  async toggleArchive(userId: string, entryId: string) {
    const entry: any = await this.findOne(userId, entryId);
    const db = this.firebaseService.getFirestore();

    const newArchivedStatus = !entry.isArchived;

    await db.collection(this.journalCollection).doc(entryId).update({
      isArchived: newArchivedStatus,
      updatedAt: new Date().toISOString(),
    });

    this.logger.log(`Journal entry ${entryId} archived status toggled to ${newArchivedStatus}`);
    return this.findOne(userId, entryId);
  }

  /**
   * Get journal entry counts (active, archived, total)
   */
  async getJournalCounts(userId: string) {
    // Get all journal entries regardless of archived status
    const allEntries = await this.findAllWithoutFilter(userId);

    const active = allEntries.filter((entry: any) => {
      const isArchived = entry.isArchived !== undefined ? entry.isArchived : false; // default to active for legacy data
      return !isArchived;
    }).length;

    const archived = allEntries.filter((entry: any) => {
      const isArchived = entry.isArchived !== undefined ? entry.isArchived : false; // default to active for legacy data
      return isArchived;
    }).length;

    const total = allEntries.length;

    return { active, archived, total };
  }

  /**
   * Helper method to get all journal entries without isArchived filter
   */
  private async findAllWithoutFilter(userId: string) {
    const db = this.firebaseService.getFirestore();

    let query = db
      .collection(this.journalCollection)
      .where('userId', '==', userId);

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}