import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../config/firebase.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { PayOccurrenceDto } from './dto/pay-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);
  private readonly BILLS = 'finance_bills';
  private readonly OCCURRENCES = 'finance_bill_occurrences';
  private readonly TRANSACTIONS = 'finance_transactions';
  private readonly ACCOUNTS = 'finance_accounts';
  private readonly CATEGORIES = 'finance_categories';

  constructor(private readonly firebaseService: FirebaseService) {}

  private get db() {
    return this.firebaseService.getFirestore();
  }

  private now() {
    return new Date().toISOString();
  }

  private clean(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  }

  private async assertOwner(collection: string, id: string, userId: string) {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException(`${collection}/${id} not found`);
    }
    return { id: doc.id, ...doc.data()! };
  }

  // ─── Bills ──────────────────────────────────────────────────────────────────

  async createBill(userId: string, dto: CreateBillDto) {
    await this.assertOwner(this.ACCOUNTS, dto.accountId, userId);
    await this.assertOwner(this.CATEGORIES, dto.categoryId, userId);
    const data = {
      ...this.clean(dto as any),
      userId,
      isActive: dto.isActive ?? true,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const ref = await this.db.collection(this.BILLS).add(data);
    return { id: ref.id, ...data };
  }

  async listBills(userId: string) {
    const snap = await this.db.collection(this.BILLS).where('userId', '==', userId).get();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  async updateBill(userId: string, id: string, dto: UpdateBillDto) {
    const existing = await this.assertOwner(this.BILLS, id, userId);
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    await this.db.collection(this.BILLS).doc(id).update(updates);
    return { ...existing, ...updates };
  }

  async deleteBill(userId: string, id: string) {
    await this.assertOwner(this.BILLS, id, userId);
    const occSnap = await this.db
      .collection(this.OCCURRENCES)
      .where('userId', '==', userId)
      .where('billId', '==', id)
      .get();
    const batch = this.db.batch();
    for (const doc of occSnap.docs) batch.delete(doc.ref);
    batch.delete(this.db.collection(this.BILLS).doc(id));
    await batch.commit();
    return { message: 'Bill deleted', occurrencesDeleted: occSnap.size };
  }

  // ─── Occurrences ────────────────────────────────────────────────────────────

  private addMonth(yyyyMM: string): string {
    const [y, m] = yyyyMM.split('-').map(Number);
    const next = new Date(y, m, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  }

  private computeDueDate(period: string, dueDay: number): string {
    const [y, m] = period.split('-').map(Number);
    const day = Math.min(dueDay, new Date(y, m, 0).getDate());
    return `${period}-${String(day).padStart(2, '0')}`;
  }

  private async generateOccurrencesForPeriod(userId: string, period: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const billsSnap = await this.db
      .collection(this.BILLS)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (billsSnap.empty) return;

    const bills = billsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));

    for (const bill of bills) {
      // Skip bills that start after this period
      const billStart = (bill.startDate as string).slice(0, 7);
      if (billStart > period) continue;

      const existing = await this.db
        .collection(this.OCCURRENCES)
        .where('userId', '==', userId)
        .where('billId', '==', bill.id)
        .where('period', '==', period)
        .limit(1)
        .get();

      if (!existing.empty) continue;

      const dueDate = this.computeDueDate(period, bill.dueDay);
      const status = dueDate < today ? 'overdue' : 'pending';

      await this.db.collection(this.OCCURRENCES).add({
        userId,
        billId: bill.id,
        period,
        dueDate,
        amount: bill.amount,
        status,
        createdAt: this.now(),
        updatedAt: this.now(),
      });
    }
  }

  async getOccurrences(userId: string, month: string) {
    // Lazy-generate current + next month
    await Promise.all([
      this.generateOccurrencesForPeriod(userId, month),
      this.generateOccurrencesForPeriod(userId, this.addMonth(month)),
    ]);

    const snap = await this.db
      .collection(this.OCCURRENCES)
      .where('userId', '==', userId)
      .where('period', '==', month)
      .get();

    const occurrences = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    // Enrich with bill name for display
    const billIds = [...new Set(occurrences.map((o) => o.billId))];
    const billDocs = await Promise.all(
      billIds.map((bid) => this.db.collection(this.BILLS).doc(bid).get()),
    );
    const billMap: Record<string, any> = {};
    for (const doc of billDocs) {
      if (doc.exists) billMap[doc.id] = { id: doc.id, ...doc.data() };
    }

    return occurrences
      .map((o) => ({ ...o, bill: billMap[o.billId] ?? null }))
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }

  async payOccurrence(userId: string, occurrenceId: string, dto: PayOccurrenceDto) {
    const occurrence: any = await this.assertOwner(this.OCCURRENCES, occurrenceId, userId);
    if (occurrence.status === 'paid') {
      throw new ConflictException('Occurrence is already paid');
    }

    const bill: any = await this.assertOwner(this.BILLS, occurrence.billId, userId);
    await this.assertOwner(this.ACCOUNTS, dto.accountId, userId);

    const txData = {
      userId,
      accountId: dto.accountId,
      categoryId: bill.categoryId,
      amount: dto.amount,
      type: bill.type,
      date: dto.paidAt,
      description: bill.name,
      billOccurrenceId: occurrenceId,
      ...(dto.notes ? { notes: dto.notes } : {}),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    const txRef = await this.db.collection(this.TRANSACTIONS).add(txData);

    const delta = bill.type === 'income' ? dto.amount : -dto.amount;
    await this.db.collection(this.ACCOUNTS).doc(dto.accountId).update({
      balance: admin.firestore.FieldValue.increment(delta),
      updatedAt: this.now(),
    });

    await this.db.collection(this.OCCURRENCES).doc(occurrenceId).update({
      status: 'paid',
      paidAt: dto.paidAt,
      transactionId: txRef.id,
      paymentAccountId: dto.accountId,
      ...(dto.notes ? { notes: dto.notes } : {}),
      updatedAt: this.now(),
    });

    this.logger.log(`Bill "${bill.name}" occurrence ${occurrenceId} paid → tx ${txRef.id}`);
    return {
      occurrenceId,
      transactionId: txRef.id,
      status: 'paid',
      paidAt: dto.paidAt,
    };
  }

  async updateOccurrence(userId: string, id: string, dto: UpdateOccurrenceDto) {
    const existing = await this.assertOwner(this.OCCURRENCES, id, userId);
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    await this.db.collection(this.OCCURRENCES).doc(id).update(updates);
    return { ...existing, ...updates };
  }

  async deleteOccurrence(userId: string, id: string) {
    await this.assertOwner(this.OCCURRENCES, id, userId);
    await this.db.collection(this.OCCURRENCES).doc(id).delete();
    return { message: 'Occurrence deleted' };
  }
}
