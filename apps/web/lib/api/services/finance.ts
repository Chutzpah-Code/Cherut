import { apiClient } from '../client';

export type AccountType = 'checking' | 'savings' | 'credit' | 'wallet' | 'other';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type InvestmentType = 'stock' | 'crypto' | 'fund' | 'real_estate' | 'other';

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
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  notes?: string;
  toAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceBudget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceInvestment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  ticker?: string;
  currency: string;
  totalContributed: number;
  notes?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
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
  displayCurrency: string;
  totalBalanceConverted: number;
  totalIncomeConverted: number;
  totalExpensesConverted: number;
  balanceByCurrency: Record<string, number>;
  incomeByCurrency: Record<string, number>;
  expensesByCurrency: Record<string, number>;
  month: string;
  recentTransactions: (FinanceTransaction & { accountName: string })[];
}

export type CreateAccountDto = Pick<FinanceAccount, 'name' | 'type'> & { balance?: number; currency?: string; color?: string; creditLimit?: number; statementClosingDay?: number; statementDueDay?: number };
export type UpdateAccountDto = Partial<CreateAccountDto>;

export type CreateCategoryDto = Pick<FinanceCategory, 'name' | 'type'> & { color?: string; icon?: string };
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export type CreateTransactionDto = Pick<FinanceTransaction, 'accountId' | 'categoryId' | 'amount' | 'type' | 'date'> & { description?: string; notes?: string; toAccountId?: string };
export type UpdateTransactionDto = Partial<CreateTransactionDto>;

export type CreateBudgetDto = Pick<FinanceBudget, 'categoryId' | 'amount' | 'month'>;
export type UpdateBudgetDto = Partial<CreateBudgetDto>;

export type CreateInvestmentDto = Pick<FinanceInvestment, 'name' | 'type'> & { ticker?: string; currency?: string; notes?: string; accountId: string };
export type UpdateInvestmentDto = Partial<CreateInvestmentDto>;

export type CreateInvestmentEntryDto = Pick<FinanceInvestmentEntry, 'investmentId' | 'amount' | 'date'> & { notes?: string };

export const financeApi = {
  getOverview: async (month?: string, displayCurrency?: string, startDate?: string, endDate?: string): Promise<FinanceOverview> => {
    const params: any = {};
    if (month) params.month = month;
    if (displayCurrency) params.displayCurrency = displayCurrency;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await apiClient.get('/finance/overview', { params });
    return data;
  },

  // Accounts
  getAccounts: async (): Promise<FinanceAccount[]> => {
    const { data } = await apiClient.get('/finance/accounts');
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
