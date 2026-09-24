import { apiClient } from '../client';
import { AssetClass, Liquidity } from '@/lib/finance/asset-classes';

export type AccountType = 'checking' | 'savings' | 'credit' | 'wallet' | 'other';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type { AssetClass, Liquidity };

export interface FinanceAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  creditLimit?: number;
  statementClosingDay?: number;
  statementDueDay?: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatementStatus = 'open' | 'closed' | 'paid';

export interface FinanceStatement {
  id: string;
  userId: string;
  accountId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  total: number;
  status: StatementStatus;
  paidAt?: string;
  paymentTransactionId?: string;
  transactions?: FinanceTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceCategory {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  notes?: string;
  toAccountId?: string;
  attachmentUrl?: string;
  billOccurrenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectionPoint {
  date: string;
  total: number;
}

export interface FinanceProjection {
  points: ProjectionPoint[];
  lowestPoint: ProjectionPoint;
  endOfHorizon: ProjectionPoint;
  scope: 'cash accounts only';
}

export interface FinanceNetWorth {
  liquid: number;
  illiquid: number;
  creditCardOwed: number;
  netWorth: number;
  monthChangePct: number | null;
}

export interface BalanceHistoryPoint {
  date: string;
  total: number;
}

export interface FinanceBalanceHistory {
  points: BalanceHistoryPoint[];
  deltaPct: number | null;
}

export interface CashFlowMonth {
  label: string;
  income: number;
  expenses: number;
}

export interface FinanceCashFlow {
  months: CashFlowMonth[];
  positiveMonths: number;
}

// A merged Upcoming-bills row — either a real bill occurrence or a
// synthesized credit-card statement pseudo-occurrence (isStatement: true).
export interface UpcomingBillItem {
  id: string;
  billId: string | null;
  period: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled' | 'skipped';
  isStatement?: boolean;
  statementAccountId?: string;
  bill: { id: string | null; name: string; type: 'income' | 'expense'; accountId: string; categoryId: string | null } | null;
}

export interface PagedTransactionsResponse {
  items: FinanceTransaction[];
  total: number;
  hasMore: boolean;
}

export interface FinanceBudget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string;
  currency?: string;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingByCategoryRow {
  categoryId: string;
  name: string;
  spent: number;
  budgetId?: string;
  budgetAmount?: number;
}

export interface SpendingByCategoryResponse {
  month: string;
  categories: SpendingByCategoryRow[];
  uncategorized: { spent: number };
  spentTotal: number;
  plannedTotal: number;
}

export interface FinanceInvestment {
  id: string;
  userId: string;
  name: string;
  assetClass: AssetClass;
  assetType: string;
  currency: string;
  acquiredValue?: number;
  acquiredDate?: string;
  currentValue: number;
  valuedDate: string;
  liquidity: Liquidity;
  linkedAccountId?: string;
  notes?: string;
  totalContributed: number;
  // Real estate
  area?: number;
  registration?: string;
  address?: string;
  // Vehicles & vessels, Equipment
  year?: number;
  plateOrSerial?: string;
  depreciationPerYear?: number;
  referenceTable?: string;
  // Currency & commodities, Metals & collectibles
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  priceSource?: string;
  // Business
  counterparty?: string;
  stake?: string;
  interestReturn?: string;
  endsOn?: string;
  createIncomingBills?: boolean;
  // Digital
  monthlyRevenue?: number;
  renewsOrExpiresOn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceInvestmentValuation {
  id: string;
  userId: string;
  investmentId: string;
  value: number;
  valuedOn: string;
  source: 'manual' | 'depreciation';
  createdAt: string;
}

export interface InvestmentsSummaryResponse {
  totalValue: number;
  classes: { assetClass: AssetClass; label: string; value: number; pct: number }[];
  assetCount: number;
}

export interface FinanceInvestmentEntry {
  id: string;
  userId: string;
  investmentId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceOverview {
  totalBalanceConverted: number;
  totalIncomeConverted: number;
  totalExpensesConverted: number;
  balanceByCurrency: Record<string, number>;
  incomeByCurrency: Record<string, number>;
  expensesByCurrency: Record<string, number>;
  month: string;
  recentTransactions: (FinanceTransaction & { accountName: string })[];
}

export type CreateAccountDto = Pick<FinanceAccount, 'name' | 'type'> & { balance?: number; currency?: string; color?: string; creditLimit?: number; statementClosingDay?: number; statementDueDay?: number; archived?: boolean };
export type UpdateAccountDto = Partial<CreateAccountDto>;

export type CreateCategoryDto = Pick<FinanceCategory, 'name' | 'type'> & { color?: string; icon?: string };
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export type CreateTransactionDto = Pick<FinanceTransaction, 'accountId' | 'categoryId' | 'amount' | 'type' | 'date'> & { description?: string; notes?: string; toAccountId?: string; attachmentUrl?: string };
export type UpdateTransactionDto = Partial<CreateTransactionDto>;

export type CreateBudgetDto = Pick<FinanceBudget, 'categoryId' | 'amount' | 'month'> & { currency?: string };
export type UpdateBudgetDto = Partial<CreateBudgetDto>;

export type CreateInvestmentDto = Pick<FinanceInvestment, 'name' | 'assetClass' | 'assetType' | 'currentValue' | 'valuedDate' | 'liquidity'> & {
  currency?: string;
  acquiredValue?: number;
  acquiredDate?: string;
  linkedAccountId?: string;
  notes?: string;
  area?: number; registration?: string; address?: string;
  year?: number; plateOrSerial?: string; depreciationPerYear?: number; referenceTable?: string;
  quantity?: number; unit?: string; unitPrice?: number; priceSource?: string;
  counterparty?: string; stake?: string; interestReturn?: string; endsOn?: string; createIncomingBills?: boolean;
  monthlyRevenue?: number; renewsOrExpiresOn?: string;
};
export type UpdateInvestmentDto = Partial<CreateInvestmentDto>;

export type CreateInvestmentEntryDto = Pick<FinanceInvestmentEntry, 'investmentId' | 'amount' | 'date'> & { notes?: string };

export const financeApi = {
  getOverview: async (month?: string, startDate?: string, endDate?: string): Promise<FinanceOverview> => {
    const params: any = {};
    if (month) params.month = month;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await apiClient.get('/finance/overview', { params });
    return data;
  },

  // Projection & net worth
  getProjection: async (horizon: number): Promise<FinanceProjection> => {
    const { data } = await apiClient.get('/finance/projection', { params: { horizon } });
    return data;
  },
  getNetWorth: async (): Promise<FinanceNetWorth> => {
    const { data } = await apiClient.get('/finance/net-worth');
    return data;
  },
  getUpcomingBillsAndStatements: async (days: number): Promise<UpcomingBillItem[]> => {
    const { data } = await apiClient.get('/finance/upcoming-bills', { params: { days } });
    return data;
  },
  getBalanceHistory: async (days: number): Promise<FinanceBalanceHistory> => {
    const { data } = await apiClient.get('/finance/balance-history', { params: { days } });
    return data;
  },
  getCashFlow: async (months: number): Promise<FinanceCashFlow> => {
    const { data } = await apiClient.get('/finance/cash-flow', { params: { months } });
    return data;
  },

  // Accounts
  getAccounts: async (includeArchived?: boolean): Promise<FinanceAccount[]> => {
    const { data } = await apiClient.get('/finance/accounts', { params: includeArchived ? { includeArchived: true } : {} });
    return data;
  },
  createAccount: async (dto: CreateAccountDto): Promise<FinanceAccount> => {
    const { data } = await apiClient.post('/finance/accounts', dto);
    return data;
  },
  updateAccount: async (id: string, dto: UpdateAccountDto): Promise<FinanceAccount> => {
    const { data } = await apiClient.patch(`/finance/accounts/${id}`, dto);
    return data;
  },
  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/accounts/${id}`);
  },

  recalculateBalance: async (id: string): Promise<{ balance: number }> => {
    const { data } = await apiClient.post(`/finance/accounts/${id}/recalculate-balance`);
    return data;
  },

  // Categories
  getCategories: async (type?: CategoryType): Promise<FinanceCategory[]> => {
    const { data } = await apiClient.get('/finance/categories', { params: type ? { type } : {} });
    return data;
  },
  createCategory: async (dto: CreateCategoryDto): Promise<FinanceCategory> => {
    const { data } = await apiClient.post('/finance/categories', dto);
    return data;
  },
  updateCategory: async (id: string, dto: UpdateCategoryDto): Promise<FinanceCategory> => {
    const { data } = await apiClient.patch(`/finance/categories/${id}`, dto);
    return data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/categories/${id}`);
  },

  // Transactions
  getTransactions: async (params?: { accountId?: string; startDate?: string; endDate?: string; type?: string }): Promise<FinanceTransaction[]> => {
    const { data } = await apiClient.get('/finance/transactions', { params });
    return data;
  },
  createTransaction: async (dto: CreateTransactionDto): Promise<FinanceTransaction> => {
    const { data } = await apiClient.post('/finance/transactions', dto);
    return data;
  },
  updateTransaction: async (id: string, dto: UpdateTransactionDto): Promise<FinanceTransaction> => {
    const { data } = await apiClient.patch(`/finance/transactions/${id}`, dto);
    return data;
  },
  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/transactions/${id}`);
  },
  getTransactionsPaged: async (params: {
    month?: string; accountId?: string; categoryId?: string; search?: string; offset?: number; limit?: number;
  }): Promise<PagedTransactionsResponse> => {
    const { data } = await apiClient.get('/finance/transactions/page', { params });
    return data;
  },
  uploadReceipt: async (file: File): Promise<{ attachmentUrl: string }> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const { data } = await apiClient.post('/finance/transactions/upload-receipt', formData, {
      timeout: 30000,
      headers: { 'Content-Type': undefined },
    });
    return data;
  },
  bulkDeleteTransactions: async (ids: string[]): Promise<{ deleted: number }> => {
    const { data } = await apiClient.post('/finance/transactions/bulk-delete', { ids });
    return data;
  },
  bulkRecategorizeTransactions: async (ids: string[], categoryId: string | null): Promise<{ updated: number }> => {
    const { data } = await apiClient.post('/finance/transactions/bulk-recategorize', { ids, categoryId });
    return data;
  },

  // Spending by category
  getSpendingByCategory: async (month?: string): Promise<SpendingByCategoryResponse> => {
    const { data } = await apiClient.get('/finance/spending-by-category', { params: month ? { month } : {} });
    return data;
  },

  // Budgets
  getBudgets: async (month?: string): Promise<FinanceBudget[]> => {
    const { data } = await apiClient.get('/finance/budgets', { params: month ? { month } : {} });
    return data;
  },
  createBudget: async (dto: CreateBudgetDto): Promise<FinanceBudget> => {
    const { data } = await apiClient.post('/finance/budgets', dto);
    return data;
  },
  updateBudget: async (id: string, dto: UpdateBudgetDto): Promise<FinanceBudget> => {
    const { data } = await apiClient.patch(`/finance/budgets/${id}`, dto);
    return data;
  },
  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/budgets/${id}`);
  },

  // Investments
  getInvestments: async (): Promise<FinanceInvestment[]> => {
    const { data } = await apiClient.get('/finance/investments');
    return data;
  },
  createInvestment: async (dto: CreateInvestmentDto): Promise<FinanceInvestment> => {
    const { data } = await apiClient.post('/finance/investments', dto);
    return data;
  },
  updateInvestment: async (id: string, dto: UpdateInvestmentDto): Promise<FinanceInvestment> => {
    const { data } = await apiClient.patch(`/finance/investments/${id}`, dto);
    return data;
  },
  deleteInvestment: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/investments/${id}`);
  },
  getInvestmentEntries: async (investmentId: string): Promise<FinanceInvestmentEntry[]> => {
    const { data } = await apiClient.get(`/finance/investments/${investmentId}/entries`);
    return data;
  },
  createInvestmentEntry: async (dto: CreateInvestmentEntryDto): Promise<FinanceInvestmentEntry> => {
    const { data } = await apiClient.post('/finance/investments/entries', dto);
    return data;
  },
  deleteInvestmentEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/investments/entries/${id}`);
  },
  getInvestmentsSummary: async (): Promise<InvestmentsSummaryResponse> => {
    const { data } = await apiClient.get('/finance/investments/summary');
    return data;
  },
  bulkUpdateValuations: async (updates: { id: string; currentValue: number; valuedDate: string }[]): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch('/finance/investments/bulk-valuations', { updates });
    return data;
  },
  getInvestmentValuations: async (investmentId: string): Promise<FinanceInvestmentValuation[]> => {
    const { data } = await apiClient.get(`/finance/investments/${investmentId}/valuations`);
    return data;
  },
  exportBackup: async (): Promise<{ exportedAt: string; data: Record<string, any[]> }> => {
    const { data } = await apiClient.get('/finance/export/backup');
    return data;
  },

  // Statements
  getCurrentStatement: async (accountId: string): Promise<FinanceStatement> => {
    const { data } = await apiClient.get(`/finance/accounts/${accountId}/statement/current`);
    return data;
  },
  getStatements: async (accountId: string): Promise<FinanceStatement[]> => {
    const { data } = await apiClient.get(`/finance/accounts/${accountId}/statements`);
    return data;
  },
  closeStatement: async (accountId: string): Promise<FinanceStatement> => {
    const { data } = await apiClient.post(`/finance/accounts/${accountId}/statement/close`);
    return data;
  },
  payStatement: async (accountId: string, statementId: string, dto: { fromAccountId: string; amount: number }): Promise<{ id: string; status: string; paymentTransactionId: string }> => {
    const { data } = await apiClient.post(`/finance/accounts/${accountId}/statements/${statementId}/pay`, dto);
    return data;
  },
};
