import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  financeApi,
  CreateAccountDto, UpdateAccountDto,
  CreateCategoryDto, UpdateCategoryDto,
  CreateTransactionDto, UpdateTransactionDto,
  CreateRecurringDto, UpdateRecurringDto,
  CreateBudgetDto, UpdateBudgetDto,
  CreateInvestmentDto, UpdateInvestmentDto,
  CreateInvestmentEntryDto,
} from '@/lib/api/services/finance';

export function useFinanceOverview(month?: string) {
  return useQuery({
    queryKey: ['finance', 'overview', month],
    queryFn: () => financeApi.getOverview(month),
    staleTime: 60_000,
  });
}

// ─── Accounts ───────────────────────────────────────────────────────────────

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: financeApi.getAccounts,
    staleTime: 60_000,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAccountDto) => financeApi.createAccount(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAccountDto }) => financeApi.updateAccount(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function useFinanceCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['finance', 'categories', type],
    queryFn: () => financeApi.getCategories(type),
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => financeApi.createCategory(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) => financeApi.updateCategory(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'categories'] }),
  });
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function useFinanceTransactions(params?: { accountId?: string; startDate?: string; endDate?: string; type?: string }) {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => financeApi.getTransactions(params),
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => financeApi.createTransaction(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'overview'] });
      qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDto }) => financeApi.updateTransaction(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'overview'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'overview'] });
      qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

// ─── Recurring ───────────────────────────────────────────────────────────────

export function useFinanceRecurring(isActive?: boolean) {
  return useQuery({
    queryKey: ['finance', 'recurring', isActive],
    queryFn: () => financeApi.getRecurring(isActive),
    staleTime: 60_000,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecurringDto) => financeApi.createRecurring(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'recurring'] }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRecurringDto }) => financeApi.updateRecurring(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'recurring'] }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteRecurring(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'recurring'] }),
  });
}

export function useApplyRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.applyRecurring(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'recurring'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'overview'] });
      qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
    },
  });
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export function useFinanceBudgets(month?: string) {
  return useQuery({
    queryKey: ['finance', 'budgets', month],
    queryFn: () => financeApi.getBudgets(month),
    staleTime: 60_000,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBudgetDto) => financeApi.createBudget(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBudgetDto }) => financeApi.updateBudget(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });
}

// ─── Investments ─────────────────────────────────────────────────────────────

export function useFinanceInvestments() {
  return useQuery({
    queryKey: ['finance', 'investments'],
    queryFn: financeApi.getInvestments,
    staleTime: 60_000,
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvestmentDto) => financeApi.createInvestment(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'investments'] }),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteInvestment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'investments'] }),
  });
}

export function useInvestmentEntries(investmentId: string) {
  return useQuery({
    queryKey: ['finance', 'investment-entries', investmentId],
    queryFn: () => financeApi.getInvestmentEntries(investmentId),
    staleTime: 60_000,
    enabled: !!investmentId,
  });
}

export function useCreateInvestmentEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvestmentEntryDto) => financeApi.createInvestmentEntry(dto),
    onSuccess: (_data, dto) => {
      qc.invalidateQueries({ queryKey: ['finance', 'investment-entries', dto.investmentId] });
      qc.invalidateQueries({ queryKey: ['finance', 'investments'] });
    },
  });
}

export function useDeleteInvestmentEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, investmentId }: { id: string; investmentId: string }) =>
      financeApi.deleteInvestmentEntry(id),
    onSuccess: (_data, { investmentId }) => {
      qc.invalidateQueries({ queryKey: ['finance', 'investment-entries', investmentId] });
      qc.invalidateQueries({ queryKey: ['finance', 'investments'] });
    },
  });
}
