import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, UserFilters, SystemSettings } from '@/lib/api/services/admin';

export const useAdminOverview = () =>
  useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.getOverview, staleTime: 60 * 1000 });

export const useAdminSales = () =>
  useQuery({ queryKey: ['admin', 'sales'], queryFn: adminApi.getSales, staleTime: 60 * 1000 });

export const useAdminAnalytics = () =>
  useQuery({ queryKey: ['admin', 'analytics'], queryFn: adminApi.getAnalytics, staleTime: 60 * 1000 });

export const useAdminActivity = () =>
  useQuery({ queryKey: ['admin', 'activity'], queryFn: adminApi.getActivity, staleTime: 60 * 1000 });

export const useAdminFunnel = () =>
  useQuery({ queryKey: ['admin', 'funnel'], queryFn: adminApi.getFunnel, staleTime: 60 * 1000 });

export const useAdminModuleUsage = () =>
  useQuery({ queryKey: ['admin', 'module-usage'], queryFn: adminApi.getModuleUsage, staleTime: 60 * 1000 });

export const useAdminServicesStatus = () =>
  useQuery({ queryKey: ['admin', 'services-status'], queryFn: adminApi.getServicesStatus, staleTime: 30 * 1000 });

export const useAdminUsers = (filters: UserFilters) =>
  useQuery({ queryKey: ['admin', 'users', filters], queryFn: () => adminApi.getUsers(filters), staleTime: 30 * 1000 });

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.promoteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uid,
      dto,
    }: {
      uid: string;
      dto: { displayName?: string; email?: string; role?: 'user' | 'admin'; plan?: 'free' | 'core' | 'pro' | 'elite' };
    }) => adminApi.updateUser(uid, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useGeneratePasswordResetLink = () =>
  useMutation({ mutationFn: (uid: string) => adminApi.generatePasswordResetLink(uid) });

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => adminApi.suspendUser(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => adminApi.reactivateUser(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useAdminSettings = () =>
  useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.getSettings, staleTime: 60 * 1000 });

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<SystemSettings>) => adminApi.updateSettings(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
};

export const useCleanupInactiveUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.cleanupInactiveUsers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
};
