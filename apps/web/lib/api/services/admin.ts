import { apiClient } from '../client';

export interface DashboardOverview {
  overview: {
    totalUsers: number;
    totalAdmins: number;
    activeSubscriptions: number;
    newUsersLast30Days: number;
    onboardingCompletionRate: number;
  };
  planDistribution: { free: number; core: number; pro: number; elite: number };
  lastUpdated: string;
}

export interface SalesReport {
  monthlyRevenue: number;
  salesByPlan: { core: number; pro: number; elite: number };
  totalPaidUsers: number;
  averageRevenuePerUser: number;
  conversionRate: number;
}

export interface AnalyticsData {
  userGrowth: { monthly: { month: string; users: number }[] };
  revenue: { monthly: { month: string; amount: number }[]; byPlan: { plan: string; amount: number; count: number }[] };
  engagement: {
    monthlyActiveUsers: number;
    dailyActiveUsers: number | null;
    weeklyActiveUsers: number | null;
    averageSessionDuration: number | null;
    retentionByCohort: null;
  };
  subscriptions: {
    conversions: { plan: string; conversions: number }[];
    churnRate: number;
    lifetime: { plan: string; value: number }[];
  };
}

export interface ActivityEvent {
  type: 'signup' | 'lessonCompleted';
  name: string;
  at: string;
}

export interface FunnelStage {
  key: 'signedUp' | 'onboarded' | 'enrolled' | 'completedLesson';
  count: number;
}

export interface ModuleUsage {
  id: string;
  title: string;
  enrolled: number;
  averageProgress: number;
}

export type ServiceStatus = 'online' | 'degraded' | 'down' | 'not_configured';

export interface ServiceHealth {
  services: { name: string; status: ServiceStatus; latencyMs: number | null }[];
  checkedAt: string;
}

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  subscription?: { plan: 'free' | 'core' | 'pro' | 'elite'; status: 'active' | 'inactive' | 'cancelled' };
  createdAt: string;
  onboardingCompleted?: boolean;
  suspended?: boolean;
}

export interface UserFilters {
  role?: 'user' | 'admin';
  plan?: 'free' | 'core' | 'pro' | 'elite';
  status?: 'active' | 'inactive' | 'cancelled';
  search?: string;
  limit?: string;
  offset?: string;
}

export interface SystemSettings {
  general: { appName: string; supportEmail: string; maintenanceMode: boolean };
  security: { requireEmailVerification: boolean; sessionTimeoutMinutes: number; maxLoginAttempts: number };
  email: { fromName: string; fromEmail: string; notificationsEnabled: boolean };
  notifications: { newUserSignup: boolean; newSubscription: boolean; weeklyDigest: boolean };
}

export const adminApi = {
  getOverview: async (): Promise<DashboardOverview> => (await apiClient.get('/admin/overview')).data,
  getSales: async (): Promise<SalesReport> => (await apiClient.get('/admin/sales')).data,
  getAnalytics: async (): Promise<AnalyticsData> => (await apiClient.get('/admin/analytics')).data,
  getActivity: async (): Promise<ActivityEvent[]> => (await apiClient.get('/admin/activity')).data,
  getFunnel: async (): Promise<{ stages: FunnelStage[] }> => (await apiClient.get('/admin/funnel')).data,
  getModuleUsage: async (): Promise<ModuleUsage[]> => (await apiClient.get('/admin/module-usage')).data,
  getServicesStatus: async (): Promise<ServiceHealth> => (await apiClient.get('/admin/services-status')).data,

  getUsers: async (filters: UserFilters): Promise<{ users: AdminUser[]; total: number }> =>
    (await apiClient.get('/admin/users', { params: filters })).data,
  createAdmin: async (dto: { email: string; password: string; displayName?: string }) =>
    (await apiClient.post('/admin/users/create', dto)).data,
  promoteUser: async (dto: { email: string }) => (await apiClient.post('/admin/users/promote', dto)).data,
  updateUser: async (
    uid: string,
    dto: { displayName?: string; email?: string; role?: 'user' | 'admin'; plan?: 'free' | 'core' | 'pro' | 'elite' },
  ): Promise<AdminUser> => (await apiClient.patch(`/admin/users/${uid}`, dto)).data,
  generatePasswordResetLink: async (uid: string): Promise<{ link: string }> =>
    (await apiClient.post(`/admin/users/${uid}/reset-password-link`)).data,
  suspendUser: async (uid: string): Promise<AdminUser> => (await apiClient.post(`/admin/users/${uid}/suspend`)).data,
  reactivateUser: async (uid: string): Promise<AdminUser> => (await apiClient.post(`/admin/users/${uid}/reactivate`)).data,

  getSettings: async (): Promise<SystemSettings> => (await apiClient.get('/admin/settings')).data,
  updateSettings: async (dto: Partial<SystemSettings>): Promise<SystemSettings> =>
    (await apiClient.patch('/admin/settings', dto)).data,

  cleanupInactiveUsers: async (): Promise<{ deletedCount: number }> =>
    (await apiClient.post('/admin/maintenance/cleanup-inactive-users')).data,
};
