import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateRecurringDto,
  UpdateRecurringDto,
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

  // Exchange rate cache: base=USD, refreshed every 24h
  private rateCache: { rates: Record<string, number>; expiresAt: number } | null = null;

  private async getExchangeRates(): Promise<Record<string, number>> {
    if (this.rateCache && Date.now() < this.rateCache.expiresAt) {
      return this.rateCache.rates;
    }
    try {
      const res = await fetch('https://api.frankfurter.app/latest?base=USD');
      const data: any = await res.json();
      const rates: Record<string, number> = { USD: 1, ...data.rates };
      this.rateCache = { rates, expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
      return rates;
    } catch (e) {
      this.logger.warn(`Exchange rate fetch failed: ${e}`);
      return this.rateCache?.rates ?? { USD: 1 };
    }
  }

  private toDisplay(amount: number, from: string, to: string, rates: Record<string, number>): number {
    if (from === to) return amount;
    const fromRate = rates[from] ?? 1;
    const toRate = rates[to] ?? 1;
    // amount (in `from`) → USD → `to`
    return (amount / fromRate) * toRate;
  }
  private readonly CATEGORIES = 'finance_categories';
  private readonly TRANSACTIONS = 'finance_transactions';
  private readonly RECURRING = 'finance_recurring';
  private readonly BUDGETS = 'finance_budgets';
  private readonly INVESTMENTS = 'finance_investments';
  private readonly INVESTMENT_ENTRIES = 'finance_investment_entries';
  private readonly STATEMENTS = 'finance_statements';

  constructor(private readonly firebaseService: FirebaseService) {}

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

  async findAccounts(userId: string) {
    const snap = await this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async updateAccount(userId: string, id: string, dto: UpdateAccountDto) {
    await this.assertOwner(this.ACCOUNTS, id, userId);
    await this.db.collection(this.ACCOUNTS).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.ACCOUNTS, id, userId);
  }

  async deleteAccount(userId: string, id: string) {
    await this.assertOwner(this.ACCOUNTS, id, userId);

    const [txSnap, recurSnap, stmtSnap] = await Promise.all([
      this.db.collection(this.TRANSACTIONS).where('userId', '==', userId).where('accountId', '==', id).get(),
      this.db.collection(this.RECURRING).where('userId', '==', userId).where('accountId', '==', id).get(),
      this.db.collection(this.STATEMENTS).where('userId', '==', userId).where('accountId', '==', id).get(),
    ]);

    const batch = this.db.batch();
    for (const doc of [...txSnap.docs, ...recurSnap.docs, ...stmtSnap.docs]) batch.delete(doc.ref);
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
    await this.assertOwner(this.CATEGORIES, id, userId);
    await this.db.collection(this.CATEGORIES).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.CATEGORIES, id, userId);
  }

  async deleteCategory(userId: string, id: string) {
    await this.assertOwner(this.CATEGORIES, id, userId);
    await this.db.collection(this.CATEGORIES).doc(id).delete();
    return { message: 'Category deleted' };
  }

  // ─── Transactions ───────────────────────────────────────────────────────────

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const data = { ...this.clean(dto as any), userId, createdAt: this.now(), updatedAt: this.now() };
    const ref = await this.db.collection(this.TRANSACTIONS).add(data);
    await this.adjustBalance(userId, dto.accountId, dto.amount, dto.type);
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

    try {
      const snap = await query.orderBy('date', 'desc').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await query.get();
      const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
      return docs.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
  }

  async updateTransaction(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.assertOwner(this.TRANSACTIONS, id, userId);
    await this.db.collection(this.TRANSACTIONS).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.TRANSACTIONS, id, userId);
  }

  async deleteTransaction(userId: string, id: string) {
    const tx: any = await this.assertOwner(this.TRANSACTIONS, id, userId);
    const reverseType = tx.type === 'income' ? 'expense' : 'income';
    try {
      await this.adjustBalance(userId, tx.accountId, tx.amount, reverseType);
    } catch {
      // Account was already deleted; skip balance reversal
    }
    await this.db.collection(this.TRANSACTIONS).doc(id).delete();
    return { message: 'Transaction deleted' };
  }

  // ─── Recurring ──────────────────────────────────────────────────────────────

  async createRecurring(userId: string, dto: CreateRecurringDto) {
    const data = {
      ...this.clean(dto as any),
      userId,
      isActive: dto.isActive ?? true,
      nextDueDate: dto.startDate,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const ref = await this.db.collection(this.RECURRING).add(data);
    return { id: ref.id, ...data };
  }

  async findRecurring(userId: string, isActive?: boolean) {
    let query: any = this.db.collection(this.RECURRING).where('userId', '==', userId);
    if (isActive !== undefined) query = query.where('isActive', '==', isActive);
    const snap = await query.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  }

  async updateRecurring(userId: string, id: string, dto: UpdateRecurringDto) {
    await this.assertOwner(this.RECURRING, id, userId);
    await this.db.collection(this.RECURRING).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.RECURRING, id, userId);
  }

  async deleteRecurring(userId: string, id: string) {
    await this.assertOwner(this.RECURRING, id, userId);
    await this.db.collection(this.RECURRING).doc(id).delete();
    return { message: 'Recurring deleted' };
  }

  async applyRecurring(userId: string, id: string) {
    const rule: any = await this.assertOwner(this.RECURRING, id, userId);

    const today = new Date().toISOString().slice(0, 10);
    const txData = {
      userId,
      accountId: rule.accountId,
      categoryId: rule.categoryId,
      amount: rule.amount,
      type: rule.type,
      date: today,
      description: rule.description,
      recurringId: id,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const txRef = await this.db.collection(this.TRANSACTIONS).add(txData);
    await this.adjustBalance(userId, rule.accountId, rule.amount, rule.type);

    const nextDueDate = this.calcNextDueDate(rule.nextDueDate ?? today, rule.frequency);
    await this.db.collection(this.RECURRING).doc(id).update({ nextDueDate, updatedAt: this.now() });

    this.logger.log(`Recurring ${id} applied → tx ${txRef.id}, next: ${nextDueDate}`);
    return { transaction: { id: txRef.id, ...txData }, nextDueDate };
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

  async updateBudget(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.assertOwner(this.BUDGETS, id, userId);
    await this.db.collection(this.BUDGETS).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.BUDGETS, id, userId);
  }

  async deleteBudget(userId: string, id: string) {
    await this.assertOwner(this.BUDGETS, id, userId);
    await this.db.collection(this.BUDGETS).doc(id).delete();
    return { message: 'Budget deleted' };
  }

  // ─── Investments ─────────────────────────────────────────────────────────────

  async createInvestment(userId: string, dto: CreateInvestmentDto) {
    const data = {
      ...this.clean(dto as any),
      userId,
      currency: dto.currency ?? 'USD',
      totalContributed: 0,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    const ref = await this.db.collection(this.INVESTMENTS).add(data);
    return { id: ref.id, ...data };
  }

  async findInvestments(userId: string) {
    const snap = await this.db.collection(this.INVESTMENTS).where('userId', '==', userId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async updateInvestment(userId: string, id: string, dto: UpdateInvestmentDto) {
    await this.assertOwner(this.INVESTMENTS, id, userId);
    await this.db.collection(this.INVESTMENTS).doc(id).update({ ...this.clean(dto as any), updatedAt: this.now() });
    return this.assertOwner(this.INVESTMENTS, id, userId);
  }

  async deleteInvestment(userId: string, id: string) {
    await this.assertOwner(this.INVESTMENTS, id, userId);
    await this.db.collection(this.INVESTMENTS).doc(id).delete();
    return { message: 'Investment deleted' };
  }

  async createInvestmentEntry(userId: string, dto: CreateInvestmentEntryDto) {
    await this.assertOwner(this.INVESTMENTS, dto.investmentId, userId);

    const amount = Number(dto.amount);
    if (!isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${dto.amount}`);
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
      const ref = await this.db.collection(this.INVESTMENT_ENTRIES).add(data);

      const inv: any = await this.assertOwner(this.INVESTMENTS, dto.investmentId, userId);
      await this.db.collection(this.INVESTMENTS).doc(dto.investmentId).update({
        totalContributed: (inv.totalContributed ?? 0) + amount,
        updatedAt: this.now(),
      });

      // Deduct from linked account balance
      if (inv.accountId) {
        await this.adjustBalance(userId, inv.accountId, amount, 'expense');
      }

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

    // Reverse totalContributed and restore account balance
    try {
      const inv: any = await this.assertOwner(this.INVESTMENTS, entry.investmentId, userId);
      await this.db.collection(this.INVESTMENTS).doc(entry.investmentId).update({
        totalContributed: Math.max(0, (inv.totalContributed ?? 0) - entry.amount),
        updatedAt: this.now(),
      });
      if (inv.accountId) {
        await this.adjustBalance(userId, inv.accountId, entry.amount, 'income');
      }
    } catch { /* investment may have been deleted */ }

    return { message: 'Entry deleted' };
  }

  // ─── Overview ───────────────────────────────────────────────────────────────

  async getOverview(userId: string, month?: string, displayCurrency = 'USD', startDate?: string, endDate?: string) {
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

    let txQuery: any = this.db.collection(this.TRANSACTIONS)
      .where('userId', '==', userId)
      .where('date', '>=', start)
      .where('date', '<=', end);

    const [accountsSnap, txSnap, rates] = await Promise.all([
      this.db.collection(this.ACCOUNTS).where('userId', '==', userId).get(),
      txQuery.get(),
      this.getExchangeRates(),
    ]);

    const accounts = accountsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const accountMap: Record<string, any> = {};
    const accountCurrency: Record<string, string> = {};
    const computedBalance: Record<string, number> = {};
    for (const a of accounts) {
      const cur = a.currency ?? 'USD';
      accountMap[a.id] = a;
      accountCurrency[a.id] = cur;
      // account.balance is the canonical stored balance, maintained by adjustBalance.
      // Do not recompute from transactions here — that would ignore the stored balance
      // and only reflect transactions added after account creation.
      computedBalance[a.id] = a.balance ?? 0;
    }

    const balanceByCurrency: Record<string, number> = {};
    for (const a of accounts) {
      const cur = accountCurrency[a.id];
      balanceByCurrency[cur] = (balanceByCurrency[cur] ?? 0) + computedBalance[a.id];
    }

    const incomeByCurrency: Record<string, number> = {};
    const expensesByCurrency: Record<string, number> = {};
    for (const t of transactions) {
      const cur = accountCurrency[t.accountId] ?? 'USD';
      if (t.type === 'income') incomeByCurrency[cur] = (incomeByCurrency[cur] ?? 0) + t.amount;
      else if (t.type === 'expense') expensesByCurrency[cur] = (expensesByCurrency[cur] ?? 0) + t.amount;
    }

    // Converted totals in displayCurrency
    const totalBalanceConverted = Object.entries(balanceByCurrency)
      .reduce((s, [cur, val]) => s + this.toDisplay(val, cur, displayCurrency, rates), 0);
    const totalIncomeConverted = Object.entries(incomeByCurrency)
      .reduce((s, [cur, val]) => s + this.toDisplay(val, cur, displayCurrency, rates), 0);
    const totalExpensesConverted = Object.entries(expensesByCurrency)
      .reduce((s, [cur, val]) => s + this.toDisplay(val, cur, displayCurrency, rates), 0);

    const recentTransactions = transactions
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((t) => ({ ...t, accountName: accountMap[t.accountId]?.name ?? '' }));

    return {
      displayCurrency,
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

  async recalculateBalance(userId: string, accountId: string) {
    const account: any = await this.assertOwner(this.ACCOUNTS, accountId, userId);
    const snap = await this.db
      .collection(this.TRANSACTIONS)
      .where('userId', '==', userId)
      .where('accountId', '==', accountId)
      .get();

    const initialBalance: number = account.initialBalance ?? 0;
    let balance = initialBalance;
    for (const doc of snap.docs) {
      const tx = doc.data() as any;
      if (tx.type === 'income') balance += tx.amount;
      else if (tx.type === 'expense') balance -= tx.amount;
    }

    await this.db.collection(this.ACCOUNTS).doc(accountId).update({
      balance,
      updatedAt: this.now(),
    });
    return { balance };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async adjustBalance(userId: string, accountId: string, amount: number, type: string) {
    const account: any = await this.assertOwner(this.ACCOUNTS, accountId, userId);
    const delta = type === 'income' ? amount : type === 'expense' ? -amount : 0;
    await this.db.collection(this.ACCOUNTS).doc(accountId).update({
      balance: (account.balance ?? 0) + delta,
      updatedAt: this.now(),
    });
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

    await this.adjustBalance(userId, dto.fromAccountId, amount, 'expense');
    await this.adjustBalance(userId, accountId, amount, 'income');

    await this.db.collection(this.STATEMENTS).doc(statementId).update({
      status: 'paid',
      paidAt: this.now(),
      paymentTransactionId: txRef.id,
      updatedAt: this.now(),
    });

    return { id: statementId, status: 'paid', paymentTransactionId: txRef.id };
  }

  private calcNextDueDate(current: string, frequency: string): string {
    const d = new Date(current);
    switch (frequency) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    }
    return d.toISOString().slice(0, 10);
  }
}
