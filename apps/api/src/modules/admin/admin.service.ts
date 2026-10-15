import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';
import {
  CreateAdminDto,
  PromoteUserDto,
  UserFiltersDto,
  UpdateUserDto,
  UpdateSystemSettingsDto,
  SubscriptionPlan,
  SubscriptionStatus,
} from './dto/admin.dto';

const DEFAULT_SETTINGS = {
  general: { appName: 'Cherut', supportEmail: 'contact@hanielrolemberg.com', maintenanceMode: false },
  security: { requireEmailVerification: true, sessionTimeoutMinutes: 60, maxLoginAttempts: 5 },
  email: { fromName: 'Cherut', fromEmail: 'contact@hanielrolemberg.com', notificationsEnabled: true },
  notifications: { newUserSignup: true, newSubscription: true, weeklyDigest: false },
};

// Users considered abandoned signups, safe for the maintenance cleanup
// action to remove: never finished onboarding, no paid/active subscription,
// and created long enough ago that they're not just mid-signup right now.
const INACTIVE_CLEANUP_THRESHOLD_DAYS = 90;

/**
 * Admin Service
 *
 * Responsável por todas as operações administrativas:
 * - Gestão de usuários
 * - Analytics e métricas
 * - Relatórios de vendas
 * - Controle de assinaturas
 */

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * 👥 GESTÃO DE USUÁRIOS
   */

  /**
   * Lista todos os usuários com filtros opcionais
   */
  async getUsers(filters: UserFiltersDto) {
    try {
      const db = this.firebaseService.getFirestore();
      let query: any = db.collection('users');

      // Apply filters
      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }

      if (filters.plan) {
        query = query.where('subscription.plan', '==', filters.plan);
      }

      if (filters.status) {
        query = query.where('subscription.status', '==', filters.status);
      }

      // Limit results
      const limit = filters.limit ? parseInt(filters.limit) : 50;
      query = query.limit(limit);

      // Apply offset if provided
      if (filters.offset) {
        const offset = parseInt(filters.offset);
        query = query.offset(offset);
      }

      // Order by creation date
      query = query.orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Text search filter (done in memory since Firestore doesn't have full-text search)
      let filteredUsers = users;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = users.filter((user: any) =>
          user.email?.toLowerCase().includes(searchTerm) ||
          user.displayName?.toLowerCase().includes(searchTerm)
        );
      }

      this.logger.log(`Retrieved ${filteredUsers.length} users with filters: ${JSON.stringify(filters)}`);

      return {
        users: filteredUsers,
        total: filteredUsers.length,
        filters: filters,
      };
    } catch (error) {
      this.logger.error('Error getting users:', error);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  /**
   * Cria novo usuário administrador
   */
  async createAdmin(createAdminDto: CreateAdminDto) {
    const { email, password, displayName } = createAdminDto;

    try {
      const auth = this.firebaseService.getAuth();
      const db = this.firebaseService.getFirestore();

      // Criar usuário no Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        emailVerified: true,
      });

      // Criar documento no Firestore
      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: 'admin',
        isSystemAdmin: false, // Não é admin do sistema (criado pelo script)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: true,
        lifePurpose: 'Administration',
        subscription: {
          plan: 'elite',
          status: 'active',
          startDate: new Date().toISOString(),
          isAdminAccount: true,
        },
        adminCreatedAt: new Date().toISOString(),
        permissions: ['admin'],
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      this.logger.log(`New admin created: ${userRecord.uid} (${email})`);

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: 'admin',
        },
        message: 'Admin user created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating admin:', error);

      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email already registered');
      }

      throw new BadRequestException('Failed to create admin user');
    }
  }

  /**
   * Promove usuário existente para admin
   */
  async promoteUser(promoteUserDto: PromoteUserDto) {
    const { email } = promoteUserDto;

    try {
      const db = this.firebaseService.getFirestore();

      // Buscar usuário por email
      const usersQuery = await db.collection('users').where('email', '==', email).get();

      if (usersQuery.empty) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const userDoc = usersQuery.docs[0];
      const userData = userDoc.data();

      // Verificar se já é admin
      if (userData.role === 'admin') {
        return {
          message: 'User is already an admin',
          user: userData,
        };
      }

      // Promover para admin
      await userDoc.ref.update({
        role: 'admin',
        promotedToAdminAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['admin'],
        subscription: {
          ...userData.subscription,
          plan: 'elite', // Automatic upgrade
        },
      });

      // Sync role to Firebase Auth custom claims so JWT carries it
      const auth = this.firebaseService.getAuth();
      await auth.setCustomUserClaims(userDoc.id, { role: 'admin' });

      this.logger.log(`User promoted to admin: ${userDoc.id} (${email})`);

      return {
        message: 'User promoted to admin successfully',
        user: {
          uid: userDoc.id,
          email,
          role: 'admin',
        },
      };
    } catch (error) {
      this.logger.error('Error promoting user:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to promote user');
    }
  }

  /**
   * Atualiza o perfil/role de um usuário existente
   */
  async updateUser(uid: string, dto: UpdateUserDto) {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException(`User ${uid} not found`);

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (dto.displayName !== undefined) updates.displayName = dto.displayName;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.role !== undefined) updates.role = dto.role;

    await docRef.update(updates);

    // Keep the Auth record and JWT custom claims in sync with Firestore.
    const auth = this.firebaseService.getAuth();
    const authUpdates: Record<string, unknown> = {};
    if (dto.displayName !== undefined) authUpdates.displayName = dto.displayName;
    if (dto.email !== undefined) authUpdates.email = dto.email;
    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(uid, authUpdates);
    }
    if (dto.role !== undefined) {
      await auth.setCustomUserClaims(uid, { role: dto.role });
    }

    this.logger.log(`User updated: ${uid}`);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  /**
   * 🩺 SAÚDE DOS SERVIÇOS — checagens reais, não status fabricado
   */
  async getServicesHealth() {
    const checkDatabase = async () => {
      const start = Date.now();
      try {
        await this.firebaseService.getFirestore().collection('users').limit(1).get();
        return { name: 'database', status: 'online' as const, latencyMs: Date.now() - start };
      } catch {
        return { name: 'database', status: 'down' as const, latencyMs: null };
      }
    };

    const checkImageService = async () => {
      const start = Date.now();
      try {
        const ok = await this.cloudinaryService.ping();
        const status: 'online' | 'degraded' = ok ? 'online' : 'degraded';
        return { name: 'imageService', status, latencyMs: Date.now() - start };
      } catch {
        return { name: 'imageService', status: 'down' as const, latencyMs: null };
      }
    };

    const [database, imageService] = await Promise.all([checkDatabase(), checkImageService()]);

    return {
      services: [
        // If this request is executing at all, the API process is up.
        { name: 'api', status: 'online' as const, latencyMs: 0 },
        database,
        imageService,
        // No job queue/scheduler exists in this stack today — report that
        // honestly instead of inventing a status for something that isn't
        // configured.
        { name: 'backgroundJobs', status: 'not_configured' as const, latencyMs: null },
      ],
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * ⚙️ CONFIGURAÇÕES DO SISTEMA — persistidas de verdade (não mock)
   */
  async getSettings() {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('systemSettings').doc('global').get();
    if (!doc.exists) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...doc.data() };
  }

  async updateSettings(dto: UpdateSystemSettingsDto) {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('systemSettings').doc('global');
    const current = (await docRef.get()).data() ?? DEFAULT_SETTINGS;

    const updated = {
      general: { ...current.general, ...dto.general },
      security: { ...current.security, ...dto.security },
      email: { ...current.email, ...dto.email },
      notifications: { ...current.notifications, ...dto.notifications },
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(updated, { merge: true });
    this.logger.log('System settings updated');
    return updated;
  }

  /**
   * 🧹 MANUTENÇÃO — remove cadastros abandonados (nunca completaram
   * onboarding, sem assinatura ativa, criados há mais de
   * INACTIVE_CLEANUP_THRESHOLD_DAYS dias). Nunca remove admins.
   */
  async cleanupInactiveUsers() {
    const db = this.firebaseService.getFirestore();
    const cutoff = new Date(Date.now() - INACTIVE_CLEANUP_THRESHOLD_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await db
      .collection('users')
      .where('onboardingCompleted', '==', false)
      .get();

    const toDelete = snapshot.docs.filter((doc) => {
      const data = doc.data() as any;
      return data.role !== 'admin' && data.createdAt && data.createdAt < cutoff && data.subscription?.status !== 'active';
    });

    const auth = this.firebaseService.getAuth();
    const batch = db.batch();
    toDelete.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    await Promise.allSettled(toDelete.map((doc) => auth.deleteUser(doc.id)));

    this.logger.log(`Cleanup: removed ${toDelete.length} inactive user(s)`);
    return { deletedCount: toDelete.length };
  }

  /**
   * 🕒 ATIVIDADE RECENTE — eventos reais (cadastros + lições concluídas),
   * não um feed fabricado. Sem uma coleção de eventos dedicada, isso é a
   * melhor aproximação real disponível hoje.
   */
  async getRecentActivity(limit = 8) {
    const db = this.firebaseService.getFirestore();
    // Single-field orderBy only (no composite index to deploy) — completedAt
    // is only ever set on docs where completed=true, and null sorts last in
    // a descending query, so this naturally surfaces real completions first.
    const [usersSnap, progressSnap] = await Promise.all([
      db.collection('users').orderBy('createdAt', 'desc').limit(limit).get(),
      db.collection('lessonProgress').orderBy('completedAt', 'desc').limit(limit).get(),
    ]);

    const signups = usersSnap.docs.map((doc) => {
      const data = doc.data() as any;
      return { type: 'signup' as const, name: data.displayName || data.email, at: data.createdAt };
    });

    const completionUserIds = [...new Set(progressSnap.docs.map((d) => (d.data() as any).userId))];
    const completionUsers = completionUserIds.length
      ? await db.getAll(...completionUserIds.map((id) => db.collection('users').doc(id)))
      : [];
    const nameByUserId = new Map(
      completionUsers.filter((d) => d.exists).map((d) => [d.id, (d.data() as any).displayName || (d.data() as any).email]),
    );

    const completions = progressSnap.docs.map((doc) => {
      const data = doc.data() as any;
      return { type: 'lessonCompleted' as const, name: nameByUserId.get(data.userId) ?? 'A user', at: data.completedAt };
    });

    return [...signups, ...completions]
      .filter((e) => !!e.at)
      .sort((a, b) => (b.at > a.at ? 1 : -1))
      .slice(0, limit);
  }

  /**
   * 🪜 FUNIL DE ATIVAÇÃO — estágios reais derivados de users/matrículas/progresso
   */
  async getActivationFunnel() {
    const db = this.firebaseService.getFirestore();
    const [usersSnap, enrollmentsSnap, progressSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('courseEnrollments').get(),
      db.collection('lessonProgress').where('completed', '==', true).get(),
    ]);

    const signedUp = usersSnap.size;
    const onboarded = usersSnap.docs.filter((d) => (d.data() as any).onboardingCompleted).length;
    const enrolledUserIds = new Set(enrollmentsSnap.docs.map((d) => (d.data() as any).userId));
    const completedUserIds = new Set(progressSnap.docs.map((d) => (d.data() as any).userId));

    return {
      stages: [
        { key: 'signedUp', count: signedUp },
        { key: 'onboarded', count: onboarded },
        { key: 'enrolled', count: enrolledUserIds.size },
        { key: 'completedLesson', count: completedUserIds.size },
      ],
    };
  }

  /**
   * 📚 USO POR MÓDULO/CURSO — matrículas e progresso médio reais
   */
  async getModuleUsage() {
    const db = this.firebaseService.getFirestore();
    const [coursesSnap, enrollmentsSnap, lessonsSnap, progressSnap] = await Promise.all([
      db.collection('courses').get(),
      db.collection('courseEnrollments').get(),
      db.collection('lessons').get(),
      db.collection('lessonProgress').where('completed', '==', true).get(),
    ]);

    const enrollmentsByCourse = new Map<string, number>();
    enrollmentsSnap.docs.forEach((d) => {
      const courseId = (d.data() as any).courseId;
      enrollmentsByCourse.set(courseId, (enrollmentsByCourse.get(courseId) ?? 0) + 1);
    });

    const lessonCountByCourse = new Map<string, number>();
    lessonsSnap.docs.forEach((d) => {
      const courseId = (d.data() as any).courseId;
      lessonCountByCourse.set(courseId, (lessonCountByCourse.get(courseId) ?? 0) + 1);
    });

    const completedByUserCourse = new Map<string, number>();
    progressSnap.docs.forEach((d) => {
      const data = d.data() as any;
      const key = `${data.userId}::${data.courseId}`;
      completedByUserCourse.set(key, (completedByUserCourse.get(key) ?? 0) + 1);
    });

    return coursesSnap.docs.map((doc) => {
      const course = doc.data() as any;
      const enrolled = enrollmentsByCourse.get(doc.id) ?? 0;
      const totalLessons = lessonCountByCourse.get(doc.id) ?? 0;

      let averageProgress = 0;
      if (enrolled > 0 && totalLessons > 0) {
        const enrolledUserIds = enrollmentsSnap.docs
          .filter((d) => (d.data() as any).courseId === doc.id)
          .map((d) => (d.data() as any).userId);
        const totalPercent = enrolledUserIds.reduce((sum, userId) => {
          const completed = completedByUserCourse.get(`${userId}::${doc.id}`) ?? 0;
          return sum + Math.round((completed / totalLessons) * 100);
        }, 0);
        averageProgress = Math.round(totalPercent / enrolledUserIds.length);
      }

      return { id: doc.id, title: course.title, enrolled, averageProgress };
    });
  }

  /**
   * 📊 ANALYTICS E MÉTRICAS
   */

  /**
   * Dashboard overview com métricas principais
   */
  async getDashboardOverview() {
    try {
      const db = this.firebaseService.getFirestore();

      // Buscar todas as métricas em paralelo
      const [usersSnapshot, plansSnapshot] = await Promise.all([
        db.collection('users').get(),
        db.collection('users').where('subscription.status', '==', 'active').get(),
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const activePlans = plansSnapshot.docs.map(doc => doc.data());

      // Calcular métricas
      const totalUsers = users.length;
      const totalAdmins = users.filter(user => user.role === 'admin').length;
      const activeSubscriptions = activePlans.length;

      // Plan distribution — over ALL users (not just active subscriptions),
      // so it matches the totalUsers denominator shown alongside it.
      const planDistribution = {
        free: users.filter(user => (user.subscription?.plan ?? 'free') === 'free').length,
        core: users.filter(user => user.subscription?.plan === 'core').length,
        pro: users.filter(user => user.subscription?.plan === 'pro').length,
        elite: users.filter(user => user.subscription?.plan === 'elite').length,
      };

      // New users in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const newUsers = users.filter(user => user.createdAt && user.createdAt > thirtyDaysAgo).length;

      // Users who completed onboarding
      const onboardingCompleted = users.filter(user => user.onboardingCompleted).length;

      return {
        overview: {
          totalUsers,
          totalAdmins,
          activeSubscriptions,
          newUsersLast30Days: newUsers,
          onboardingCompletionRate: Math.round((onboardingCompleted / totalUsers) * 100),
        },
        planDistribution,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error getting dashboard overview:', error);
      throw new BadRequestException('Failed to retrieve dashboard data');
    }
  }

  /**
   * Relatório de vendas e revenue
   */
  async getSalesReport() {
    try {
      const db = this.firebaseService.getFirestore();

      // Buscar todas as assinaturas ativas
      const subscriptionsSnapshot = await db.collection('users')
        .where('subscription.status', '==', 'active')
        .get();

      const subscriptions = subscriptionsSnapshot.docs.map(doc => doc.data());

      // Calculate estimated revenue (demo values - to be replaced with real payment system)
      const planPrices = {
        free: 0,
        core: 9.99,
        pro: 19.99,
        elite: 49.99,
      };

      let monthlyRevenue = 0;
      const salesByPlan = {
        core: 0,
        pro: 0,
        elite: 0,
      };

      subscriptions.forEach(user => {
        const plan = user.subscription?.plan;
        if (plan && planPrices[plan]) {
          monthlyRevenue += planPrices[plan];
          if (plan !== 'free') {
            salesByPlan[plan]++;
          }
        }
      });

      return {
        monthlyRevenue,
        salesByPlan,
        totalPaidUsers: salesByPlan.core + salesByPlan.pro + salesByPlan.elite,
        averageRevenuePerUser: monthlyRevenue / (salesByPlan.core + salesByPlan.pro + salesByPlan.elite || 1),
        conversionRate: Math.round(((salesByPlan.core + salesByPlan.pro + salesByPlan.elite) / subscriptions.length) * 100),
      };
    } catch (error) {
      this.logger.error('Error getting sales report:', error);
      throw new BadRequestException('Failed to retrieve sales data');
    }
  }

  /**
   * Analytics detalhados com dados de crescimento e engajamento
   */
  async getAnalytics() {
    try {
      const db = this.firebaseService.getFirestore();

      // Buscar todos os usuários
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calcular crescimento mensal de usuários
      const monthlyGrowth = this.calculateMonthlyGrowth(users);

      // Calcular revenue mensal
      const monthlyRevenue = this.calculateMonthlyRevenue(users);

      // Métricas de engajamento
      const engagement = this.calculateEngagementMetrics(users);

      // Métricas de assinatura
      const subscriptions = this.calculateSubscriptionMetrics(users);

      return {
        userGrowth: {
          daily: [], // Implementar quando tivermos tracking diário
          monthly: monthlyGrowth,
        },
        revenue: {
          daily: [], // Implementar quando tivermos tracking diário
          monthly: monthlyRevenue,
          byPlan: subscriptions.byPlan,
        },
        engagement,
        subscriptions: {
          conversions: subscriptions.conversions,
          churnRate: subscriptions.churnRate,
          lifetime: subscriptions.lifetime,
        },
      };
    } catch (error) {
      this.logger.error('Error getting analytics:', error);
      throw new BadRequestException('Failed to retrieve analytics data');
    }
  }

  /**
   * Calcula crescimento mensal de usuários
   */
  private calculateMonthlyGrowth(users: any[]) {
    const monthlyData = {};

    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey]++;
      }
    });

    // Converter para array ordenado pelos últimos 6 meses
    const months = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    }).slice(-6);

    return months.map(month => ({
      month: month.split(' ')[0], // Apenas o nome do mês
      users: monthlyData[month],
    }));
  }

  /**
   * Calcula revenue mensal estimado
   */
  private calculateMonthlyRevenue(users: any[]) {
    const planPrices = {
      free: 0,
      core: 9.99,
      pro: 19.99,
      elite: 49.99,
    };

    const monthlyData = {};

    users.forEach(user => {
      if (user.subscription?.status === 'active' && user.subscription?.startDate) {
        const date = new Date(user.subscription.startDate);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }

        const plan = user.subscription.plan;
        if (planPrices[plan]) {
          monthlyData[monthKey] += planPrices[plan];
        }
      }
    });

    // Converter para array ordenado pelos últimos 6 meses
    const months = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    }).slice(-6);

    return months.map(month => ({
      month: month.split(' ')[0], // Apenas o nome do mês
      amount: Math.round(monthlyData[month] || 0),
    }));
  }

  /**
   * Calcula métricas de engajamento
   */
  private calculateEngagementMetrics(users: any[]) {
    const activeUsers = users.filter(u => u.subscription?.status === 'active').length;

    return {
      // Real: users with an active subscription right now.
      monthlyActiveUsers: activeUsers,
      // No session/login event tracking exists yet — report honestly as
      // untracked instead of guessing from a multiplier.
      dailyActiveUsers: null,
      weeklyActiveUsers: null,
      averageSessionDuration: null,
      retentionByCohort: null,
    };
  }

  /**
   * Calcula métricas de assinatura
   */
  private calculateSubscriptionMetrics(users: any[]) {
    const everSubscribed = users.filter(u => u.subscription?.plan && u.subscription.plan !== 'free').length;
    const cancelled = users.filter(u => u.subscription?.status === 'cancelled').length;
    const churnRate = everSubscribed > 0 ? Math.round((cancelled / everSubscribed) * 1000) / 10 : 0;

    const planCounts = {
      free: users.filter(u => u.subscription?.plan === 'free').length,
      core: users.filter(u => u.subscription?.plan === 'core').length,
      pro: users.filter(u => u.subscription?.plan === 'pro').length,
      elite: users.filter(u => u.subscription?.plan === 'elite').length,
    };

    const planPrices = {
      core: 9.99,
      pro: 19.99,
      elite: 49.99,
    };

    return {
      byPlan: Object.entries(planCounts)
        .filter(([plan]) => plan !== 'free')
        .map(([plan, count]) => ({
          plan,
          amount: Math.round(count * planPrices[plan]),
          count,
        })),
      conversions: Object.entries(planCounts)
        .filter(([plan]) => plan !== 'free')
        .map(([plan, count]) => ({
          plan,
          conversions: count,
        })),
      churnRate, // Real: cancelled ÷ ever-subscribed-to-a-paid-plan
      lifetime: Object.entries(planCounts)
        .filter(([plan]) => plan !== 'free')
        .map(([plan, count]) => ({
          plan,
          value: Math.round(count * planPrices[plan] * 12), // LTV anual estimado
        })),
    };
  }
}