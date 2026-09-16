import { apiClient } from '../client';

export type BillFrequency = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
export type BillType = 'income' | 'expense';
export type BillOccurrenceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'skipped';

export interface FinanceBill {
  id: string;
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  accountId: string;
  amount: number;
  type: BillType;
  frequency: BillFrequency;
  dueDay: number;
  interval?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceBillOccurrence {
  id: string;
  userId: string;
  billId: string;
  period: string;
  dueDate: string;
  amount: number;
  status: BillOccurrenceStatus;
  paidAt?: string;
  transactionId?: string;
  paymentAccountId?: string;
  notes?: string;
  bill?: FinanceBill;
  createdAt: string;
  updatedAt: string;
}

export type CreateBillDto = {
  name: string;
  categoryId: string;
  accountId: string;
  amount: number;
  type: BillType;
  frequency: BillFrequency;
  dueDay: number;
  interval?: number;
  startDate: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateBillDto = Partial<CreateBillDto>;

export type PayOccurrenceDto = {
  accountId: string;
  amount: number;
  paidAt: string;
  notes?: string;
};

export type UpdateOccurrenceDto = {
  amount?: number;
  dueDate?: string;
  status?: BillOccurrenceStatus;
  notes?: string;
};

export const billsApi = {
  listBills: async (): Promise<FinanceBill[]> => {
    const { data } = await apiClient.get('/bills');
    return data;
  },
  createBill: async (dto: CreateBillDto): Promise<FinanceBill> => {
    const { data } = await apiClient.post('/bills', dto);
    return data;
  },
  updateBill: async (id: string, dto: UpdateBillDto): Promise<FinanceBill> => {
    const { data } = await apiClient.patch(`/bills/${id}`, dto);
    return data;
  },
  deleteBill: async (id: string): Promise<void> => {
    await apiClient.delete(`/bills/${id}`);
  },
  pauseBill: async (id: string): Promise<FinanceBill> => {
    const { data } = await apiClient.post(`/bills/${id}/pause`);
    return data;
  },
  resumeBill: async (id: string): Promise<FinanceBill> => {
    const { data } = await apiClient.post(`/bills/${id}/resume`);
    return data;
  },

  getOccurrences: async (month: string): Promise<FinanceBillOccurrence[]> => {
    const { data } = await apiClient.get('/bills/occurrences', { params: { month } });
    return data;
  },
  getUpcomingOccurrences: async (days: number): Promise<FinanceBillOccurrence[]> => {
    const { data } = await apiClient.get('/bills/occurrences/upcoming', { params: { days } });
    return data;
  },
  payOccurrence: async (
    id: string,
    dto: PayOccurrenceDto,
  ): Promise<{ occurrenceId: string; transactionId: string; status: string; paidAt: string }> => {
    const { data } = await apiClient.post(`/bills/occurrences/${id}/pay`, dto);
    return data;
  },
  skipOccurrence: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/bills/occurrences/${id}/skip`);
    return data;
  },
  updateOccurrence: async (id: string, dto: UpdateOccurrenceDto): Promise<FinanceBillOccurrence> => {
    const { data } = await apiClient.patch(`/bills/occurrences/${id}`, dto);
    return data;
  },
  deleteOccurrence: async (id: string): Promise<void> => {
    await apiClient.delete(`/bills/occurrences/${id}`);
  },
};
