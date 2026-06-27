import { apiClient } from '../client';

export type AccountType = 'checking' | 'savings' | 'credit' | 'wallet' | 'other';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurringType = 'income' | 'expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type InvestmentType = 'stock' | 'crypto' | 'fund' | 'real_estate' | 'other';

export interface FinanceAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
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
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceRecurring {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: RecurringType;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  description: string;
  notes?: string;
  isActive: boolean;
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
  totalBalance: number;
  income: number;
  expenses: number;
  net: number;
  month: string;
  recentTransactions: FinanceTransaction[];
}

export type CreateAccountDto = Pick<FinanceAccount, 'name' | 'type'> & { balance?: number; currency?: string; color?: string };
export type UpdateAccountDto = Partial<CreateAccountDto>;

export type CreateCategoryDto = Pick<FinanceCategory, 'name' | 'type'> & { color?: string; icon?: string };
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export type CreateTransactionDto = Pick<FinanceTransaction, 'accountId' | 'categoryId' | 'amount' | 'type' | 'date'> & { description?: string; notes?: string; toAccountId?: string; recurringId?: string };
export type UpdateTransactionDto = Partial<CreateTransactionDto>;

export type CreateRecurringDto = Pick<FinanceRecurring, 'accountId' | 'categoryId' | 'amount' | 'type' | 'frequency' | 'startDate' | 'description'> & { notes?: string; isActive?: boolean };
export type UpdateRecurringDto = Partial<CreateRecurringDto> & { isActive?: boolean };

export type CreateBudgetDto = Pick<FinanceBudget, 'categoryId' | 'amount' | 'month'>;
export type UpdateBudgetDto = Partial<CreateBudgetDto>;

export type CreateInvestmentDto = Pick<FinanceInvestment, 'name' | 'type'> & { ticker?: string; currency?: string; notes?: string };
export type UpdateInvestmentDto = Partial<CreateInvestmentDto>;

export type CreateInvestmentEntryDto = Pick<FinanceInvestmentEntry, 'investmentId' | 'amount' | 'date'> & { notes?: string };

export const financeApi = {
  getOverview: async (month?: string): Promise<FinanceOverview> => {
    const { data } = await apiClient.get('/finance/overview', { params: month ? { month } : {} });
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

  // Recurring
  getRecurring: async (isActive?: boolean): Promise<FinanceRecurring[]> => {
    const { data } = await apiClient.get('/finance/recurring', { params: isActive !== undefined ? { isActive } : {} });
    return data;
  },
  createRecurring: async (dto: CreateRecurringDto): Promise<FinanceRecurring> => {
    const { data } = await apiClient.post('/finance/recurring', dto);
    return data;
  },
  updateRecurring: async (id: string, dto: UpdateRecurringDto): Promise<FinanceRecurring> => {
    const { data } = await apiClient.patch(`/finance/recurring/${id}`, dto);
    return data;
  },
  deleteRecurring: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/recurring/${id}`);
  },
  applyRecurring: async (id: string): Promise<{ transaction: FinanceTransaction; nextDueDate: string }> => {
    const { data } = await apiClient.post(`/finance/recurring/${id}/apply`);
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
};
