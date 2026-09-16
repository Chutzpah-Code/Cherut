import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  billsApi,
  CreateBillDto,
  UpdateBillDto,
  PayOccurrenceDto,
  UpdateOccurrenceDto,
} from '@/lib/api/services/bills';

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.listBills,
    staleTime: 60_000,
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBillDto) => billsApi.createBill(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
    },
  });
}

export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBillDto }) => billsApi.updateBill(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
    },
  });
}

export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsApi.deleteBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
    },
  });
}

export function usePauseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsApi.pauseBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
    },
  });
}

export function useResumeBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsApi.resumeBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
    },
  });
}

export function useBillOccurrences(month: string) {
  return useQuery({
    queryKey: ['bill-occurrences', month],
    queryFn: () => billsApi.getOccurrences(month),
    staleTime: 15_000,
  });
}

export function useUpcomingOccurrences(days: number) {
  return useQuery({
    queryKey: ['bill-occurrences', 'upcoming', days],
    queryFn: () => billsApi.getUpcomingOccurrences(days),
    staleTime: 15_000,
  });
}

function invalidateAfterOccurrenceChange(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['bill-occurrences'] });
  qc.invalidateQueries({ queryKey: ['finance', 'overview'] });
  qc.invalidateQueries({ queryKey: ['finance', 'accounts'] });
  qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
  qc.invalidateQueries({ queryKey: ['finance', 'transactions-page'] });
  qc.invalidateQueries({ queryKey: ['finance', 'net-worth'] });
  qc.invalidateQueries({ queryKey: ['finance', 'projection'] });
}

export function usePayOccurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PayOccurrenceDto }) =>
      billsApi.payOccurrence(id, dto),
    onSuccess: () => invalidateAfterOccurrenceChange(qc),
  });
}

export function useSkipOccurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsApi.skipOccurrence(id),
    onSuccess: () => invalidateAfterOccurrenceChange(qc),
  });
}

export function useUpdateOccurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOccurrenceDto }) =>
      billsApi.updateOccurrence(id, dto),
    onSuccess: () => invalidateAfterOccurrenceChange(qc),
  });
}

export function useDeleteOccurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsApi.deleteOccurrence(id),
    onSuccess: () => invalidateAfterOccurrenceChange(qc),
  });
}
