import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';
import { BillsService } from '../bills/bills.service';
import { AssetClass, ASSET_CLASSES, isValidAssetType } from './constants/asset-classes';
import {
  CreateAccountDto,
  UpdateAccountDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionType,
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  CreateInvestmentEntryDto,
} from './dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  private readonly ACCOUNTS = 'finance_accounts';
  private readonly CATEGORIES = 'finance_categories';
  private readonly TRANSACTIONS = 'finance_transactions';
  private readonly BUDGETS = 'finance_budgets';
  private readonly INVESTMENTS = 'finance_investments';
  private readonly INVESTMENT_ENTRIES = 'finance_investment_entries';
  private readonly INVESTMENT_VALUATIONS = 'finance_investment_valuations';
  private readonly STATEMENTS = 'finance_statements';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly billsService: BillsService,
  ) {}

  private get db() {
    return this.firebaseService.getFirestore();
  }

  private clean(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  }

  private now() {
    return new Date().toISOString();
  }

  private async assertOwner(collection: string, id: string, userId: string) {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException(`${collection}/${id} not found`);
    }
    return { id: doc.id, ...doc.data()! };
  }

  // ─── Accounts ──────────────────────────────────────────────────────────────

  async createAccount(userId: string, dto: CreateAccountDto) {
    const initialBalance = dto.balance ?? 0;
    const data = {
      ...this.clean(dto as any),
      userId,
      balance: initialBalance,
      initialBalance,
      currency: dto.currency ?? 'USD',
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const ref = await this.db.collection(this.ACCOUNTS).add(data);
    return { id: ref.id, ...data };
  }

  async findAccounts(userId: string, includeArchived = false) {
    const snap = await this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get();
    const accounts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return includeArchived ? accounts : accounts.filter((a) => !a.archived);
  }

  async updateAccount(userId: string, id: string, dto: UpdateAccountDto) {
    const existing: any = await this.assertOwner(this.ACCOUNTS, id, userId);
    const updates: any = { ...this.clean(dto as any), updatedAt: this.now() };

    // A manual balance edit (e.g. correcting the opening number) has to move
    // initialBalance by the same amount, or it silently drifts from the real
    // balance — the next recalculateBalance would then discard the edit and
    // reconstruct from a stale baseline instead of reproducing what was just
    // typed in.
    if (updates.balance !== undefined && updates.balance !== existing.balance) {
      updates.initialBalance = updates.balance - await this.sumTransactionEffects(userId, id);
    }

    await this.db.collection(this.ACCOUNTS).doc(id).update(updates);
    return { ...existing, ...updates };
  }

  async deleteAccount(userId: string, id: string) {
    await this.assertOwner(this.ACCOUNTS, id, userId);

    const [txSnap, stmtSnap] = await Promise.all([
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).where('accountId', '==', id).get(),
      this.db.collection(this.STATEMENTS).where('userId', '==', userId).where('accountId', '==', id).get(),
    ]);

    const batch = this.db.batch();
    for (const doc of [...txSnap.docs, ...stmtSnap.docs]) batch.delete(doc.ref);
    batch.delete(this.db.collection(this.ACCOUNTS).doc(id));
    await batch.commit();

    return { message: 'Account deleted', transactionsDeleted: txSnap.size };
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  async createCategory(userId: string, dto: CreateCategoryDto) {
    const data = { ...this.clean(dto as any), userId, createdAt: this.now(), updatedAt: this.now() };
    const ref = await this.db.collection(this.CATEGORIES).add(data);
    return { id: ref.id, ...data };
  }

  async findCategories(userId: string, type?: string) {
    let query: any = this.db.collection(this.CATEGORIES).where('userId', '==', userId);
    if (type) query = query.where('type', '==', type);
    const snap = await query.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  async updateCategory(userId: string, id: string, dto: UpdateCategoryDto) {
    const existing = await this.assertOwner(this.CATEGORIES, id, userId);
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    await this.db.collection(this.CATEGORIES).doc(id).update(updates);
    return { ...existing, ...updates };
  }

  async deleteCategory(userId: string, id: string) {
    await this.assertOwner(this.CATEGORIES, id, userId);
    await this.db.collection(this.CATEGORIES).doc(id).delete();
    return { message: 'Category deleted' };
  }

  // ─── Transactions ───────────────────────────────────────────────────────────

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const originAccount: any = await this.assertOwner(this.ACCOUNTS, dto.accountId, userId);
    const data = { ...this.clean(dto as any), userId, createdAt: this.now(), updatedAt: this.now() };

    if (dto.type === TransactionType.TRANSFER) {
      if (!dto.toAccountId) throw new BadRequestException('toAccountId is required for transfer transactions');
      if (dto.toAccountId === dto.accountId) throw new BadRequestException('Cannot transfer to the same account');
      if (!(dto.amount > 0)) throw new BadRequestException('Transfer amount must be positive');
      const destAccount: any = await this.assertOwner(this.ACCOUNTS, dto.toAccountId, userId);
      if ((originAccount.currency ?? 'USD') !== (destAccount.currency ?? 'USD')) {
        throw new BadRequestException('Cannot transfer between accounts with different currencies');
      }

      const batch = this.db.batch();
      const ref = this.db.collection(this.TRANSACTIONS).doc();
      batch.set(ref, data);
      this.applyBalanceDelta(batch, dto.accountId, -dto.amount);
      this.applyBalanceDelta(batch, dto.toAccountId, dto.amount);
      await batch.commit();
      return { id: ref.id, ...data };
    }

    const ref = await this.db.collection(this.TRANSACTIONS).add(data);
    await this.adjustBalance(dto.accountId, dto.amount, dto.type);
    return { id: ref.id, ...data };
  }

  async findTransactions(
    userId: string,
    opts: { accountId?: string; startDate?: string; endDate?: string; type?: string } = {},
  ) {
    let query: any = this.db.collection(this.TRANSACTIONS).where('userId', '==', userId);
    if (opts.accountId) query = query.where('accountId', '==', opts.accountId);
    if (opts.type) query = query.where('type', '==', opts.type);
    if (opts.startDate) query = query.where('date', '>=', opts.startDate);
    if (opts.endDate) query = query.where('date', '<=', opts.endDate);

    let docs: any[];
    try {
      const snap = await query.orderBy('date', 'desc').get();
      docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await query.get();
      docs = (snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[])
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    // A transfer belongs to two accounts — when filtering by account, also
    // surface transfers where this account is the destination, not just the
    // source, so "view transactions for this account" shows both legs.
    if (opts.accountId && (!opts.type || opts.type === 'transfer')) {
      const incomingSnap = await this.db.collection(this.TRANSACTIONS)
        .where('userId', '==', userId)
        .where('toAccountId', '==', opts.accountId)
        .where('type', '==', 'transfer')
        .get();
      let incoming = incomingSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
      if (opts.startDate) incoming = incoming.filter((t) => t.date >= opts.startDate!);
      if (opts.endDate) incoming = incoming.filter((t) => t.date <= opts.endDate!);
      docs = [...docs, ...incoming].sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    return docs;
  }

  async updateTransaction(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing: any = await this.assertOwner(this.TRANSACTIONS, id, userId);
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    const merged = { ...existing, ...updates };

    // Only a transfer's balance effect is reconciled here — income/expense
    // amount edits keep the pre-existing (documented) behavior of not
    // touching account balances. A transfer always spans two accounts, so
    // leaving it unreconciled would let the transaction and both balances
    // silently drift apart.
    const touchesTransfer = existing.type === 'transfer' || merged.type === 'transfer';
    if (!touchesTransfer) {
      await this.db.collection(this.TRANSACTIONS).doc(id).update(updates);
      return { ...existing, ...updates };
    }

    if (merged.type === 'transfer') {
      if (!merged.toAccountId) throw new BadRequestException('toAccountId is required for transfer transactions');
      if (merged.toAccountId === merged.accountId) throw new BadRequestException('Cannot transfer to the same account');
      if (!(merged.amount > 0)) throw new BadRequestException('Transfer amount must be positive');
      const originAccount: any = await this.assertOwner(this.ACCOUNTS, merged.accountId, userId);
      const destAccount: any = await this.assertOwner(this.ACCOUNTS, merged.toAccountId, userId);
      if ((originAccount.currency ?? 'USD') !== (destAccount.currency ?? 'USD')) {
        throw new BadRequestException('Cannot transfer between accounts with different currencies');
      }
    }

    const oldEffects = this.transactionEffects(existing.type, existing.accountId, existing.toAccountId, existing.amount);
    const newEffects = this.transactionEffects(merged.type, merged.accountId, merged.toAccountId, merged.amount);
    const affectedAccountIds = new Set([...Object.keys(oldEffects), ...Object.keys(newEffects)]);

    const batch = this.db.batch();
    batch.update(this.db.collection(this.TRANSACTIONS).doc(id), updates);
    for (const accountId of affectedAccountIds) {
      const netDelta = (newEffects[accountId] ?? 0) - (oldEffects[accountId] ?? 0);
      this.applyBalanceDelta(batch, accountId, netDelta);
    }
    await batch.commit();

    return { ...existing, ...updates };
  }

  async deleteTransaction(userId: string, id: string) {
    const tx: any = await this.assertOwner(this.TRANSACTIONS, id, userId);
    try {
      if (tx.type === 'transfer' && tx.toAccountId) {
        // Reverse both legs atomically — if either account was deleted, the
        // whole batch fails and neither leg is reversed, which is safer than
        // partially reversing only the surviving account.
        const batch = this.db.batch();
        this.applyBalanceDelta(batch, tx.accountId, tx.amount);
        this.applyBalanceDelta(batch, tx.toAccountId, -tx.amount);
        await batch.commit();
      } else {
        const reverseType = tx.type === 'income' ? 'expense' : 'income';
        await this.adjustBalance(tx.accountId, tx.amount, reverseType);
      }
    } catch {
      // Account was already deleted; skip balance reversal
    }
    if (tx.attachmentUrl) {
      // Best-effort cleanup — never block the delete on a Cloudinary failure.
      this.cloudinaryService.deleteImage(tx.attachmentUrl).catch(() => {});
    }
    if (tx.billOccurrenceId) {
      // The transaction that settled a bill occurrence was removed — put the
      // occurrence back to pending instead of leaving it stuck as "paid".
      await this.billsService.revertOccurrenceToPending(tx.billOccurrenceId).catch(() => {});
    }
    await this.db.collection(this.TRANSACTIONS).doc(id).delete();
    return { message: 'Transaction deleted' };
  }

  async uploadReceipt(userId: string, file: { buffer: Buffer }) {
    const attachmentUrl = await this.cloudinaryService.uploadReceipt(file.buffer, userId);
    return { attachmentUrl };
  }

  async findTransactionsPaged(
    userId: string,
    opts: {
      month?: string;
      accountId?: string;
      categoryId?: string;
      search?: string;
      offset?: number;
      limit?: number;
    } = {},
  ) {
    const month = opts.month ?? new Date().toISOString().slice(0, 7);
    const startDate = `${month}-01`;
    const [y, m] = month.split('-').map(Number);
    const endStr = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);

    let query: any = this.db.collection(this.TRANSACTIONS).where('userId', '==', userId);
    if (opts.accountId) query = query.where('accountId', '==', opts.accountId);

    let docs: any[];
    try {
      const snap = await query.where('date', '>=', startDate).where('date', '<=', endStr).orderBy('date', 'desc').get();
      docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await query.get();
      docs = (snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[])
        .filter((t) => t.date >= startDate && t.date <= endStr)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    // Same OR-across-two-fields need as findTransactions — a transfer must
    // show up when browsing either the source or the destination account.
    if (opts.accountId) {
      const incomingSnap = await this.db.collection(this.TRANSACTIONS)
        .where('userId', '==', userId)
        .where('toAccountId', '==', opts.accountId)
        .where('type', '==', 'transfer')
        .get();
      const incoming = (incomingSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[])
        .filter((t) => t.date >= startDate && t.date <= endStr);
      docs = [...docs, ...incoming].sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    if (opts.categoryId === 'uncategorized') {
      docs = docs.filter((t) => !t.categoryId);
    } else if (opts.categoryId) {
      docs = docs.filter((t) => t.categoryId === opts.categoryId);
    }

    if (opts.search) {
      const [accountsSnap, categoriesSnap] = await Promise.all([
        this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
        this.db.collection(this.CATEGORIES).where('userId', '==', userId).get(),
      ]);
      const accountName: Record<string, string> = {};
      accountsSnap.docs.forEach((d) => { accountName[d.id] = (d.data() as any).name ?? ''; });
      const categoryName: Record<string, string> = {};
      categoriesSnap.docs.forEach((d) => { categoryName[d.id] = (d.data() as any).name ?? ''; });

      const q = opts.search.toLowerCase();
      docs = docs.filter((t) =>
        (t.description ?? '').toLowerCase().includes(q) ||
        (accountName[t.accountId] ?? '').toLowerCase().includes(q) ||
        (t.categoryId && (categoryName[t.categoryId] ?? '').toLowerCase().includes(q)),
      );
    }

    const total = docs.length;
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? 20;
    const items = docs.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { items, total, hasMore };
  }

  async bulkDeleteTransactions(userId: string, ids: string[]) {
    const results = await Promise.all(ids.map((id) => this.deleteTransaction(userId, id).catch(() => null)));
    return { deleted: results.filter(Boolean).length };
  }

  async bulkRecategorizeTransactions(userId: string, ids: string[], categoryId: string | null | undefined) {
    if (ids.length === 0) return { updated: 0 };
    const refs = ids.map((id) => this.db.collection(this.TRANSACTIONS).doc(id));
    const docs = await this.db.getAll(...refs);
    const batch = this.db.batch();
    let updated = 0;
    for (const doc of docs) {
      if (!doc.exists || (doc.data() as any).userId !== userId) continue;
      batch.update(doc.ref, { categoryId: categoryId ?? null, updatedAt: this.now() });
      updated++;
    }
    if (updated > 0) await batch.commit();
    return { updated };
  }

  // ─── Budgets ────────────────────────────────────────────────────────────────

  async createBudget(userId: string, dto: CreateBudgetDto) {
    const data = { ...dto, userId, createdAt: this.now(), updatedAt: this.now() };
    const ref = await this.db.collection(this.BUDGETS).add(data);
    return { id: ref.id, ...data };
  }

  async findBudgets(userId: string, month?: string) {
    let query: any = this.db.collection(this.BUDGETS).where('userId', '==', userId);
    if (month) query = query.where('month', '==', month);
    const snap = await query.get();
    const budgets = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];

    if (!budgets.length) return [];

    // Fetch spending per category for the month — use UTC to avoid timezone-dependent last-day calc
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const [y, m] = targetMonth.split('-').map(Number);
    const endStr = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);

    const txSnap = await this.db
      .collection(this.TRANSACTIONS)
      .where('userId', '==', userId)
      .get();

    const spent: Record<string, number> = {};
    txSnap.docs.forEach((d: any) => {
      const { categoryId, amount, type, date } = d.data();
      if (type === 'expense' && date >= startDate && date <= endStr) {
        spent[categoryId] = (spent[categoryId] ?? 0) + amount;
      }
    });

    return budgets.map((b) => ({ ...b, spent: spent[b.categoryId] ?? 0 }));
  }

  async getSpendingByCategory(userId: string, month?: string) {
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const [y, m] = targetMonth.split('-').map(Number);
    const endStr = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);

    const [categoriesSnap, budgetsSnap, txSnap] = await Promise.all([
      this.db.collection(this.CATEGORIES).where('userId', '==', userId).where('type', '==', 'expense').get(),
      this.db.collection(this.BUDGETS).where('userId', '==', userId).where('month', '==', targetMonth).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).get(),
    ]);

    const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const budgetByCategory: Record<string, any> = {};
    for (const d of budgetsSnap.docs) {
      const b = { id: d.id, ...d.data() } as any;
      budgetByCategory[b.categoryId] = b;
    }

    const spentByCategory: Record<string, number> = {};
    let uncategorizedSpent = 0;
    for (const d of txSnap.docs) {
      const t = d.data() as any;
      if (t.type !== 'expense' || t.date < startDate || t.date > endStr) continue;
      if (!t.categoryId) {
        uncategorizedSpent += t.amount;
      } else {
        spentByCategory[t.categoryId] = (spentByCategory[t.categoryId] ?? 0) + t.amount;
      }
    }

    const categoryRows = categories.map((c) => {
      const budget = budgetByCategory[c.id];
      return {
        categoryId: c.id,
        name: c.name,
        spent: spentByCategory[c.id] ?? 0,
        budgetId: budget?.id,
        budgetAmount: budget ? budget.amount : undefined,
      };
    });

    const plannedTotal = categoryRows.reduce((s, c) => s + (c.budgetAmount ?? 0), 0);
    const spentTotal = categoryRows.reduce((s, c) => s + c.spent, 0) + uncategorizedSpent;

    return {
      month: targetMonth,
      categories: categoryRows,
      uncategorized: { spent: uncategorizedSpent },
      spentTotal,
      plannedTotal,
    };
  }

  async updateBudget(userId: string, id: string, dto: UpdateBudgetDto) {
    const existing = await this.assertOwner(this.BUDGETS, id, userId);
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    await this.db.collection(this.BUDGETS).doc(id).update(updates);
    return { ...existing, ...updates };
  }

  async deleteBudget(userId: string, id: string) {
    await this.assertOwner(this.BUDGETS, id, userId);
    await this.db.collection(this.BUDGETS).doc(id).delete();
    return { message: 'Budget deleted' };
  }

  // ─── Investments (Portfolio assets) ────────────────────────────────────────
  // Every asset carries acquiredValue/currentValue/valuedDate/liquidity per
  // FINANCE-SPEC.md §7's valuation model. Depreciating assets (vehicles,
  // equipment) get their displayed value derived on read, never stored —
  // see withDerivedValue.

  private async recordValuation(userId: string, investmentId: string, value: number, valuedOn: string, source: 'manual' | 'depreciation') {
    await this.db.collection(this.INVESTMENT_VALUATIONS).add({
      userId, investmentId, value, valuedOn, source, createdAt: this.now(),
    });
  }

  private withDerivedValue(inv: any): any {
    if (!inv.depreciationPerYear || !inv.acquiredDate) return inv;
    // Only auto-depreciate while no manual revaluation has happened since acquisition.
    if (inv.valuedDate !== inv.acquiredDate) return inv;
    const acquired = new Date(inv.acquiredDate + 'T00:00:00');
    const yearsElapsed = (Date.now() - acquired.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const rate = inv.depreciationPerYear / 100;
    const base = inv.acquiredValue ?? inv.currentValue;
    const currentValue = base * Math.pow(1 - rate, Math.max(0, yearsElapsed));
    return { ...inv, currentValue };
  }

  async createInvestment(userId: string, dto: CreateInvestmentDto) {
    if (!isValidAssetType(dto.assetClass, dto.assetType)) {
      throw new BadRequestException(`Invalid assetType "${dto.assetType}" for class "${dto.assetClass}"`);
    }
    const fundingAmount = dto.acquiredValue ?? dto.currentValue;
    const data: any = {
      ...this.clean(dto as any),
      userId,
      currency: dto.currency ?? 'USD',
      totalContributed: 0,
      // Normalize acquiredValue so it always reflects what was actually
      // funded from the linked account at creation, even when the caller
      // only sent currentValue — deleteInvestment reads this back to know
      // how much to credit back, and currentValue can drift afterwards.
      acquiredValue: fundingAmount,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    if (dto.linkedAccountId) {
      const account: any = await this.assertOwner(this.ACCOUNTS, dto.linkedAccountId, userId);
      if ((account.balance ?? 0) < fundingAmount) {
        throw new BadRequestException('Insufficient balance in linked account');
      }
      const batch = this.db.batch();
      const ref = this.db.collection(this.INVESTMENTS).doc();
      batch.set(ref, data);
      this.applyBalanceDelta(batch, dto.linkedAccountId, -fundingAmount);
      await batch.commit();
      await this.recordValuation(userId, ref.id, dto.currentValue, dto.valuedDate, 'manual');
      return { id: ref.id, ...data };
    }

    const ref = await this.db.collection(this.INVESTMENTS).add(data);
    await this.recordValuation(userId, ref.id, dto.currentValue, dto.valuedDate, 'manual');
    return { id: ref.id, ...data };
  }

  async findInvestments(userId: string) {
    const snap = await this.db.collection(this.INVESTMENTS).where('userId', '==', userId).get();
    return (snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).map((inv) => this.withDerivedValue(inv));
  }

  async updateInvestment(userId: string, id: string, dto: UpdateInvestmentDto) {
    const existing = await this.assertOwner(this.INVESTMENTS, id, userId);
    if (dto.assetClass && dto.assetType && !isValidAssetType(dto.assetClass, dto.assetType)) {
      throw new BadRequestException(`Invalid assetType "${dto.assetType}" for class "${dto.assetClass}"`);
    }
    const updates = { ...this.clean(dto as any), updatedAt: this.now() };
    await this.db.collection(this.INVESTMENTS).doc(id).update(updates);
    if (dto.currentValue !== undefined && dto.valuedDate) {
      await this.recordValuation(userId, id, dto.currentValue, dto.valuedDate, 'manual');
    }
    return { ...existing, ...updates };
  }

  async deleteInvestment(userId: string, id: string) {
    const investment: any = await this.assertOwner(this.INVESTMENTS, id, userId);

    // Reverses only the creation-time funding (acquiredValue) — contributions
    // made afterwards via createInvestmentEntry are a pre-existing gap: this
    // method has never cleaned up or reversed finance_investment_entries,
    // and that's unchanged here.
    if (investment.linkedAccountId) {
      const batch = this.db.batch();
      batch.delete(this.db.collection(this.INVESTMENTS).doc(id));
      this.applyBalanceDelta(batch, investment.linkedAccountId, investment.acquiredValue ?? 0);
      await batch.commit();
      return { message: 'Investment deleted' };
    }

    await this.db.collection(this.INVESTMENTS).doc(id).delete();
    return { message: 'Investment deleted' };
  }

  async getInvestmentValuations(userId: string, investmentId: string) {
    await this.assertOwner(this.INVESTMENTS, investmentId, userId);
    const snap = await this.db
      .collection(this.INVESTMENT_VALUATIONS)
      .where('userId', '==', userId)
      .where('investmentId', '==', investmentId)
      .get();
    return (snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).sort((a, b) => (a.valuedOn < b.valuedOn ? 1 : -1));
  }

  async bulkUpdateValuations(userId: string, updates: { id: string; currentValue: number; valuedDate: string }[]) {
    if (updates.length === 0) return { updated: 0 };
    const refs = updates.map((u) => this.db.collection(this.INVESTMENTS).doc(u.id));
    const docs = await this.db.getAll(...refs);
    const batch = this.db.batch();
    let updated = 0;
    const applied: typeof updates = [];
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      if (!doc.exists || (doc.data() as any).userId !== userId) continue;
      batch.update(doc.ref, { currentValue: updates[i].currentValue, valuedDate: updates[i].valuedDate, updatedAt: this.now() });
      applied.push(updates[i]);
      updated++;
    }
    if (updated > 0) await batch.commit();
    await Promise.all(applied.map((u) => this.recordValuation(userId, u.id, u.currentValue, u.valuedDate, 'manual')));
    return { updated };
  }

  async getInvestmentsSummary(userId: string) {
    const snap = await this.db.collection(this.INVESTMENTS).where('userId', '==', userId).get();
    const investments = (snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).map((inv) => this.withDerivedValue(inv));

    const classTotals: Record<string, number> = {};
    let totalValue = 0;
    for (const inv of investments) {
      const value = inv.currentValue ?? 0;
      classTotals[inv.assetClass] = (classTotals[inv.assetClass] ?? 0) + value;
      totalValue += value;
    }

    const classes = Object.entries(classTotals)
      .map(([assetClass, value]) => ({
        assetClass,
        label: ASSET_CLASSES[assetClass as AssetClass]?.label ?? assetClass,
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { totalValue, classes, assetCount: investments.length };
  }

  async createInvestmentEntry(userId: string, dto: CreateInvestmentEntryDto) {
    const inv: any = await this.assertOwner(this.INVESTMENTS, dto.investmentId, userId);

    const amount = Number(dto.amount);
    if (!isFinite(amount) || amount <= 0) {
      throw new BadRequestException(`Invalid amount: ${dto.amount}`);
    }

    if (inv.linkedAccountId) {
      const account: any = await this.assertOwner(this.ACCOUNTS, inv.linkedAccountId, userId);
      if ((account.balance ?? 0) < amount) {
        throw new BadRequestException('Insufficient balance in linked account');
      }
    }

    const data = {
      investmentId: dto.investmentId,
      amount,
      date: dto.date,
      ...(dto.notes ? { notes: dto.notes } : {}),
      userId,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    try {
      const batch = this.db.batch();
      const ref = this.db.collection(this.INVESTMENT_ENTRIES).doc();
      batch.set(ref, data);

      // A contribution is itself a revaluation for financial assets — it
      // grows both the contribution ledger and the asset's tracked value.
      batch.update(this.db.collection(this.INVESTMENTS).doc(dto.investmentId), {
        totalContributed: admin.firestore.FieldValue.increment(amount),
        currentValue: admin.firestore.FieldValue.increment(amount),
        valuedDate: dto.date,
        updatedAt: this.now(),
      });
      if (inv.linkedAccountId) {
        this.applyBalanceDelta(batch, inv.linkedAccountId, -amount);
      }
      await batch.commit();

      await this.recordValuation(userId, dto.investmentId, (inv.currentValue ?? 0) + amount, dto.date, 'manual');

      return { id: ref.id, ...data };
    } catch (e) {
      this.logger.error(`createInvestmentEntry failed: ${e}`);
      throw e;
    }
  }

  async findInvestmentEntries(userId: string, investmentId: string) {
    const snap = await this.db
      .collection(this.INVESTMENT_ENTRIES)
      .where('userId', '==', userId)
      .where('investmentId', '==', investmentId)
      .get();
    const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
    return docs.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async deleteInvestmentEntry(userId: string, id: string) {
    const entry: any = await this.assertOwner(this.INVESTMENT_ENTRIES, id, userId);
    await this.db.collection(this.INVESTMENT_ENTRIES).doc(id).delete();

    // Reverse totalContributed + currentValue and restore the linked account balance
    try {
      const inv: any = await this.assertOwner(this.INVESTMENTS, entry.investmentId, userId);
      await this.db.collection(this.INVESTMENTS).doc(entry.investmentId).update({
        totalContributed: admin.firestore.FieldValue.increment(-entry.amount),
        currentValue: admin.firestore.FieldValue.increment(-entry.amount),
        updatedAt: this.now(),
      });
      if (inv.linkedAccountId) {
        await this.adjustBalance(inv.linkedAccountId, entry.amount, 'income');
      }
    } catch { /* investment may have been deleted */ }

    return { message: 'Entry deleted' };
  }

  // ─── Overview ───────────────────────────────────────────────────────────────

  async getOverview(userId: string, month?: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: string;
    let end: string;

    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      start = month
        ? `${month}-01`
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const endObj = new Date(start);
      endObj.setMonth(endObj.getMonth() + 1);
      endObj.setDate(0);
      end = endObj.toISOString().slice(0, 10);
    }

    const [accountsSnap, allTxSnap, categoriesSnap] = await Promise.all([
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).get(),
      this.db.collection(this.CATEGORIES).where('userId', '==', userId).get(),
    ]);

    const accounts = accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const transactions = allTxSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((t) => t.date >= start && t.date <= end);

    const accountMap: Record<string, any> = {};
    const accountCurrency: Record<string, string> = {};
    const computedBalance: Record<string, number> = {};
    const archivedAccountIds = new Set<string>();
    for (const a of accounts) {
      if (a.archived) {
        archivedAccountIds.add(a.id);
        continue;
      }
      const cur = a.currency ?? 'USD';
      accountMap[a.id] = a;
      accountCurrency[a.id] = cur;
      // account.balance is the canonical stored balance, maintained by adjustBalance.
      // Do not recompute from transactions here — that would ignore the stored balance
      // and only reflect transactions added after account creation.
      computedBalance[a.id] = a.balance ?? 0;
    }

    const categoryMap: Record<string, string> = {};
    for (const c of categoriesSnap.docs) categoryMap[c.id] = (c.data() as any).name ?? '';

    const balanceByCurrency: Record<string, number> = {};
    for (const a of accounts) {
      if (archivedAccountIds.has(a.id)) continue;
      const cur = accountCurrency[a.id];
      balanceByCurrency[cur] = (balanceByCurrency[cur] ?? 0) + computedBalance[a.id];
    }

    const incomeByCurrency: Record<string, number> = {};
    const expensesByCurrency: Record<string, number> = {};
    for (const t of transactions) {
      if (archivedAccountIds.has(t.accountId)) continue;
      const cur = accountCurrency[t.accountId] ?? 'USD';
      if (t.type === 'income') incomeByCurrency[cur] = (incomeByCurrency[cur] ?? 0) + t.amount;
      else if (t.type === 'expense') expensesByCurrency[cur] = (expensesByCurrency[cur] ?? 0) + t.amount;
    }

    const totalBalanceConverted = Object.values(balanceByCurrency).reduce((s, val) => s + val, 0);
    const totalIncomeConverted = Object.values(incomeByCurrency).reduce((s, val) => s + val, 0);
    const totalExpensesConverted = Object.values(expensesByCurrency).reduce((s, val) => s + val, 0);

    const recentTransactions = transactions
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((t) => ({
        ...t,
        accountName: accountMap[t.accountId]?.name ?? '',
        accountCurrency: accountCurrency[t.accountId] ?? 'USD',
        categoryName: categoryMap[t.categoryId] ?? '',
      }));

    return {
      totalBalanceConverted,
      totalIncomeConverted,
      totalExpensesConverted,
      balanceByCurrency,
      incomeByCurrency,
      expensesByCurrency,
      month: start.slice(0, 7),
      recentTransactions,
    };
  }

  // ─── Recalculate balance ────────────────────────────────────────────────────

  // Sum of every transaction's effect on this account (income +, expense -,
  // transfer-out -, transfer-in +) — deliberately excludes initialBalance so
  // both recalculateBalance and updateAccount can share the exact same math.
  private async sumTransactionEffects(userId: string, accountId: string): Promise<number> {
    const [outSnap, inSnap] = await Promise.all([
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).where('accountId', '==', accountId).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).where('toAccountId', '==', accountId).where('type', '==', 'transfer').get(),
    ]);

    let sum = 0;
    for (const doc of outSnap.docs) {
      const tx = doc.data() as any;
      if (tx.type === 'income') sum += tx.amount;
      else if (tx.type === 'expense') sum -= tx.amount;
      else if (tx.type === 'transfer') sum -= tx.amount; // outgoing leg
    }
    for (const doc of inSnap.docs) sum += (doc.data() as any).amount; // incoming leg
    return sum;
  }

  async recalculateBalance(userId: string, accountId: string) {
    const account: any = await this.assertOwner(this.ACCOUNTS, accountId, userId);
    const balance = (account.initialBalance ?? 0) + await this.sumTransactionEffects(userId, accountId);

    await this.db.collection(this.ACCOUNTS).doc(accountId).update({
      balance,
      updatedAt: this.now(),
    });
    return { balance };
  }

  // ─── Balance projection ─────────────────────────────────────────────────────
  // Cash accounts only — illiquid assets never enter this, by design (see
  // FINANCE-SPEC.md §2.5/§2.7). Uses BillsService's upcoming-occurrences walk
  // for pending bills/recurring income within the horizon.

  private addDaysStr(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  async getProjection(userId: string, horizonDays: number) {
    const accountsSnap = await this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get();
    const cashAccounts = accountsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((a) => a.type !== 'credit' && !a.archived);
    const cashAccountIds = new Set(cashAccounts.map((a) => a.id));

    let currentTotal = 0;
    for (const a of cashAccounts) currentTotal += a.balance ?? 0;

    const today = new Date().toISOString().slice(0, 10);
    const occurrences = await this.billsService.getUpcomingOccurrences(userId, horizonDays);

    const deltaByDate: Record<string, number> = {};
    for (const occ of occurrences as any[]) {
      const bill = occ.bill;
      if (!bill || !cashAccountIds.has(bill.accountId)) continue;
      const delta = bill.type === 'income' ? occ.amount : -occ.amount;
      deltaByDate[occ.dueDate] = (deltaByDate[occ.dueDate] ?? 0) + delta;
    }

    const points: { date: string; total: number }[] = [];
    let running = currentTotal;
    let lowestPoint = { date: today, total: currentTotal };
    for (let i = 0; i <= horizonDays; i++) {
      const d = this.addDaysStr(today, i);
      running += deltaByDate[d] ?? 0;
      points.push({ date: d, total: running });
      if (running < lowestPoint.total) lowestPoint = { date: d, total: running };
    }

    const endOfHorizon = points[points.length - 1] ?? { date: today, total: currentTotal };
    return { points, lowestPoint, endOfHorizon, scope: 'cash accounts only' as const };
  }

  // ─── Balance history (dashboard) ───────────────────────────────────────────
  // Daily balance series for cash accounts, walked backward from today's
  // canonical account.balance — the exact inverse of getProjection's forward
  // walk. Used by the 2A read-only dashboard's Balance chart.

  async getBalanceHistory(userId: string, days: number) {
    const [accountsSnap, allTxSnap] = await Promise.all([
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).get(),
    ]);
    const cashAccounts = accountsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((a) => a.type !== 'credit' && !a.archived);
    const cashAccountIds = new Set(cashAccounts.map((a) => a.id));

    let currentTotal = 0;
    for (const a of cashAccounts) currentTotal += a.balance ?? 0;

    const today = new Date().toISOString().slice(0, 10);
    const startDate = this.addDaysStr(today, -days);

    const deltaByDate: Record<string, number> = {};
    for (const doc of allTxSnap.docs) {
      const t = doc.data() as any;
      if (t.date <= startDate || t.date > today) continue;
      // A transfer between two cash accounts nets to zero here (money just
      // moved within the tracked total) — but a transfer crossing into/out
      // of a credit card only has one leg in cashAccountIds, so only that
      // leg should move the total. Computing both legs and filtering by
      // cashAccountIds per-leg gets both cases right in one pass.
      const effects = this.transactionEffects(t.type, t.accountId, t.toAccountId, t.amount);
      for (const [accId, delta] of Object.entries(effects)) {
        if (!cashAccountIds.has(accId)) continue;
        deltaByDate[t.date] = (deltaByDate[t.date] ?? 0) + delta;
      }
    }

    const points: { date: string; total: number }[] = [{ date: today, total: currentTotal }];
    let running = currentTotal;
    for (let i = 1; i <= days; i++) {
      running -= deltaByDate[this.addDaysStr(today, -(i - 1))] ?? 0;
      points.push({ date: this.addDaysStr(today, -i), total: running });
    }
    points.reverse();

    const startTotal = points[0]?.total ?? currentTotal;
    const deltaPct = startTotal !== 0 ? ((currentTotal - startTotal) / Math.abs(startTotal)) * 100 : null;

    return { points, deltaPct };
  }

  // ─── Cash flow (dashboard) ──────────────────────────────────────────────────
  // Income vs expenses per calendar month, cash accounts only, last N months.

  async getCashFlow(userId: string, months: number) {
    const [accountsSnap, allTxSnap] = await Promise.all([
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).get(),
    ]);
    const cashAccounts = accountsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((a) => a.type !== 'credit' && !a.archived);
    const cashAccountIds = new Set(cashAccounts.map((a) => a.id));

    const now = new Date();
    const monthKeys: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const monthSet = new Set(monthKeys);

    const byMonth: Record<string, { income: number; expenses: number }> = {};
    for (const key of monthKeys) byMonth[key] = { income: 0, expenses: 0 };

    for (const doc of allTxSnap.docs) {
      const t = doc.data() as any;
      if (!cashAccountIds.has(t.accountId)) continue;
      const monthKey = (t.date ?? '').slice(0, 7);
      if (!monthSet.has(monthKey)) continue;
      if (t.type === 'income') byMonth[monthKey].income += t.amount;
      else if (t.type === 'expense') byMonth[monthKey].expenses += t.amount;
    }

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsOut = monthKeys.map((key) => ({
      label: monthLabels[Number(key.slice(5, 7)) - 1],
      income: byMonth[key].income,
      expenses: byMonth[key].expenses,
    }));
    const positiveMonths = monthsOut.filter((m) => m.income >= m.expenses).length;

    return { months: monthsOut, positiveMonths };
  }

  // ─── Net worth ──────────────────────────────────────────────────────────────
  // Liquid = cash accounts + liquid-flagged assets; illiquid = illiquid-flagged
  // assets. Illiquid assets count here but are never read by getProjection.

  async getNetWorth(userId: string) {
    const [accountsSnap, investmentsSnap, allTxSnap, valuationsSnap] = await Promise.all([
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
      this.db.collection(this.INVESTMENTS).where('userId', '==', userId).get(),
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).get(),
      this.db.collection(this.INVESTMENT_VALUATIONS).where('userId', '==', userId).get(),
    ]);
    const accounts = (accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).filter((a) => !a.archived);

    let liquid = 0;
    let creditCardOwed = 0;
    for (const a of accounts) {
      const balance = a.balance ?? 0;
      if (a.type === 'credit') {
        creditCardOwed += Math.max(0, -balance);
      } else {
        liquid += balance;
      }
    }

    let illiquid = 0;
    const investments = (investmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).map((inv) => this.withDerivedValue(inv));
    for (const inv of investments) {
      const value = inv.currentValue ?? 0;
      if (inv.liquidity === 'illiquid') illiquid += value;
      else liquid += value;
    }

    const netWorth = liquid + illiquid - creditCardOwed;

    // Month-over-month change: net worth as of the start of the current month.
    // Cash: backward-walk this month's transactions (same technique as
    // getBalanceHistory). Investments: latest valuation dated before the 1st
    // of the month, falling back to currentValue (never interpolated) if none.
    const today = new Date().toISOString().slice(0, 10);
    const startOfMonth = `${today.slice(0, 7)}-01`;

    const knownAccountIds = new Set(accounts.map((a) => a.id));
    let startLiquid = 0;
    let startCreditOwed = 0;
    const monthDeltaByAccount: Record<string, number> = {};
    for (const doc of allTxSnap.docs) {
      const t = doc.data() as any;
      if (t.date < startOfMonth || t.date > today) continue;
      // A transfer affects two accounts (e.g. cash -> credit card payment):
      // walking back only t.accountId's leg would silently drop the other
      // side's effect, which used to skew startLiquid/startCreditOwed apart
      // whenever a transfer crossed the cash/credit boundary (they only
      // cancel out when summed if both legs land in the same bucket).
      const effects = this.transactionEffects(t.type, t.accountId, t.toAccountId, t.amount);
      for (const [accId, delta] of Object.entries(effects)) {
        if (!knownAccountIds.has(accId)) continue;
        monthDeltaByAccount[accId] = (monthDeltaByAccount[accId] ?? 0) + delta;
      }
    }
    for (const a of accounts) {
      const startBalance = (a.balance ?? 0) - (monthDeltaByAccount[a.id] ?? 0);
      if (a.type === 'credit') startCreditOwed += Math.max(0, -startBalance);
      else startLiquid += startBalance;
    }

    const valuationsByInvestment: Record<string, any[]> = {};
    for (const doc of valuationsSnap.docs) {
      const v = doc.data() as any;
      (valuationsByInvestment[v.investmentId] ??= []).push(v);
    }
    let startIlliquid = 0;
    let startLiquidFromInvestments = 0;
    for (const inv of investments) {
      const priorValuations = (valuationsByInvestment[inv.id] ?? [])
        .filter((v) => v.valuedOn < startOfMonth)
        .sort((a, b) => (a.valuedOn < b.valuedOn ? 1 : -1));
      const startValue = priorValuations[0]?.value ?? inv.currentValue ?? 0;
      if (inv.liquidity === 'illiquid') startIlliquid += startValue;
      else startLiquidFromInvestments += startValue;
    }

    const startNetWorth = startLiquid + startLiquidFromInvestments + startIlliquid - startCreditOwed;
    const monthChangePct = startNetWorth !== 0 ? ((netWorth - startNetWorth) / Math.abs(startNetWorth)) * 100 : null;

    return { liquid, illiquid, creditCardOwed, netWorth, monthChangePct };
  }

  // ─── Upcoming bills + credit card statements (merged) ──────────────────────
  // A credit card's statement isn't a bill rule — it's derived live from the
  // account's closing/due day — but FINANCE-SPEC.md requires it to show up as
  // an occurrence in Upcoming bills automatically. This merges BillsService's
  // real occurrences with a synthesized pseudo-occurrence per credit account
  // that has a positive current-statement total due within the horizon.

  async getUpcomingBillsAndStatements(userId: string, days: number) {
    const [occurrences, accountsSnap] = await Promise.all([
      this.billsService.getUpcomingOccurrences(userId, days),
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).where('type', '==', 'credit').get(),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const toDate = this.addDaysStr(today, days);
    const creditAccounts = (accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]).filter((a) => !a.archived);

    const statementItems: any[] = [];
    for (const account of creditAccounts) {
      try {
        const statement = await this.getCurrentStatement(userId, account.id);
        if (statement.total > 0 && statement.dueDate <= toDate) {
          statementItems.push({
            id: `statement-${account.id}`,
            userId,
            billId: null,
            period: statement.dueDate.slice(0, 7),
            dueDate: statement.dueDate,
            amount: statement.total,
            status: statement.dueDate < today ? 'overdue' : 'pending',
            isStatement: true,
            statementAccountId: account.id,
            bill: { id: null, name: `${account.name} statement`, type: 'expense', accountId: account.id, categoryId: null },
          });
        }
      } catch {
        // Account may lack statement config yet — skip it rather than fail the whole list.
      }
    }

    return [...occurrences, ...statementItems].sort((a: any, b: any) => (a.dueDate < b.dueDate ? -1 : 1));
  }

  // ─── Full backup export ─────────────────────────────────────────────────────

  async exportBackup(userId: string) {
    const collections = [
      this.ACCOUNTS, this.CATEGORIES, this.TRANSACTIONS, this.BUDGETS,
      this.INVESTMENTS, this.INVESTMENT_ENTRIES, this.INVESTMENT_VALUATIONS, this.STATEMENTS,
      'finance_bills', 'finance_bill_occurrences',
    ];
    const snaps = await Promise.all(collections.map((c) => this.db.collection(c).where('userId', '==', userId).get()));
    const data: Record<string, any[]> = {};
    collections.forEach((c, i) => { data[c] = snaps[i].docs.map((d) => ({ id: d.id, ...d.data() })); });
    return { exportedAt: this.now(), data };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private applyBalanceDelta(batch: admin.firestore.WriteBatch, accountId: string, delta: number) {
    if (delta === 0) return;
    batch.update(this.db.collection(this.ACCOUNTS).doc(accountId), {
      balance: admin.firestore.FieldValue.increment(delta),
      updatedAt: this.now(),
    });
  }

  private async adjustBalance(accountId: string, amount: number, type: string) {
    const delta = type === 'income' ? amount : type === 'expense' ? -amount : 0;
    if (delta === 0) return;
    const batch = this.db.batch();
    this.applyBalanceDelta(batch, accountId, delta);
    await batch.commit();
  }

  // Per-account balance effect of a transaction, keyed by accountId. Shared by
  // createTransaction/updateTransaction so a transfer's two-account math (and
  // any future type) is computed in exactly one place.
  private transactionEffects(type: string, accountId: string, toAccountId: string | undefined, amount: number): Record<string, number> {
    if (type === 'income') return { [accountId]: amount };
    if (type === 'expense') return { [accountId]: -amount };
    if (type === 'transfer' && toAccountId) {
      return { [accountId]: -amount, [toAccountId]: amount };
    }
    return {};
  }

  // ─── Credit card statements ─────────────────────────────────────────────────

  async getCurrentStatement(userId: string, accountId: string) {
    const account: any = await this.assertOwner(this.ACCOUNTS, accountId, userId);

    const today = new Date().toISOString().slice(0, 10);
    const closingDay: number = account.statementClosingDay ?? 1;
    const dueDay: number = account.statementDueDay ?? 10;

    // Find the most recent closed statement to determine periodStart
    const statementsSnap = await this.db
      .collection(this.STATEMENTS)
      .where('userId', '==', userId)
      .where('accountId', '==', accountId)
      .get();
    const statements = statementsSnap.docs
      .map((d: any) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.periodEnd < b.periodEnd ? 1 : -1)) as any[];

    let periodStart: string;
    if (statements.length > 0) {
      const lastClosed = new Date(statements[0].periodEnd);
      lastClosed.setDate(lastClosed.getDate() + 1);
      periodStart = lastClosed.toISOString().slice(0, 10);
    } else {
      const created = account.createdAt?.slice(0, 10) ?? today.slice(0, 7) + '-01';
      periodStart = created;
    }

    // Compute current period end (next closing day from periodStart)
    const startDate = new Date(periodStart);
    let periodEnd = new Date(startDate.getFullYear(), startDate.getMonth(), closingDay);
    if (periodEnd < startDate) periodEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, closingDay);
    const periodEndStr = periodEnd.toISOString().slice(0, 10);

    // Due date: same month as periodEnd + dueDay, or next month if due < closing
    let dueDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), dueDay);
    if (dueDate <= periodEnd) dueDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, dueDay);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    // Fetch transactions for the current period
    const txSnap = await this.db
      .collection(this.TRANSACTIONS)
      .where('userId', '==', userId)
      .where('accountId', '==', accountId)
      .get();
    const transactions = (txSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[])
      .filter((t) => t.date >= periodStart && t.date <= (today < periodEndStr ? today : periodEndStr))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const total = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s: number, t: any) => s + (t.amount ?? 0), 0);

    return {
      status: 'open' as const,
      periodStart,
      periodEnd: periodEndStr,
      dueDate: dueDateStr,
      total,
      transactions,
    };
  }

  async getStatements(userId: string, accountId: string) {
    await this.assertOwner(this.ACCOUNTS, accountId, userId);
    const snap = await this.db
      .collection(this.STATEMENTS)
      .where('userId', '==', userId)
      .where('accountId', '==', accountId)
      .get();
    return snap.docs
      .map((d: any) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.periodEnd < b.periodEnd ? 1 : -1));
  }

  async closeStatement(userId: string, accountId: string) {
    const current = await this.getCurrentStatement(userId, accountId);
    const data = {
      userId,
      accountId,
      periodStart: current.periodStart,
      periodEnd: current.periodEnd,
      dueDate: current.dueDate,
      total: current.total,
      status: 'closed' as const,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const ref = await this.db.collection(this.STATEMENTS).add(data);
    return { id: ref.id, ...data };
  }

  async payStatement(userId: string, accountId: string, statementId: string, dto: { fromAccountId: string; amount: number }) {
    const statement: any = await this.assertOwner(this.STATEMENTS, statementId, userId);
    if (statement.status === 'paid') throw new Error('Statement already paid');
    await this.assertOwner(this.ACCOUNTS, dto.fromAccountId, userId);

    const amount = Number(dto.amount);

    // Transfer: debit fromAccount, credit card account
    const categorySnap = await this.db
      .collection(this.CATEGORIES)
      .where('userId', '==', userId)
      .where('name', '==', 'Credit Card Payment')
      .get();
    let categoryId: string;
    if (!categorySnap.empty) {
      categoryId = categorySnap.docs[0].id;
    } else {
      const catRef = await this.db.collection(this.CATEGORIES).add({
        userId, name: 'Credit Card Payment', type: 'expense', createdAt: this.now(), updatedAt: this.now(),
      });
      categoryId = catRef.id;
    }

    const txData = {
      userId,
      accountId: dto.fromAccountId,
      categoryId,
      toAccountId: accountId,
      amount,
      type: 'transfer',
      date: new Date().toISOString().slice(0, 10),
      description: `Fatura ${statement.periodEnd?.slice(0, 7) ?? ''}`,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const txRef = await this.db.collection(this.TRANSACTIONS).add(txData);

    await this.adjustBalance(dto.fromAccountId, amount, 'expense');
    await this.adjustBalance(accountId, amount, 'income');

    await this.db.collection(this.STATEMENTS).doc(statementId).update({
      status: 'paid',
      paidAt: this.now(),
      paymentTransactionId: txRef.id,
      updatedAt: this.now(),
    });

    return { id: statementId, status: 'paid', paymentTransactionId: txRef.id };
  }

}
