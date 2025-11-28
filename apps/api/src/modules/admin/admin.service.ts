import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { CreateAdminDto, PromoteUserDto, UserFiltersDto, SubscriptionPlan, SubscriptionStatus } from './dto/admin.dto';

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

  constructor(private readonly firebaseService: FirebaseService) {}

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

      // Plan distribution
      const planDistribution = {
        free: activePlans.filter(user => user.subscription?.plan === 'free').length,
        core: activePlans.filter(user => user.subscription?.plan === 'core').length,
        pro: activePlans.filter(user => user.subscription?.plan === 'pro').length,
        elite: activePlans.filter(user => user.subscription?.plan === 'elite').length,
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
    const total = users.length;
    const activeUsers = users.filter(u => u.subscription?.status === 'active').length;
    const completedOnboarding = users.filter(u => u.onboardingCompleted).length;

    return {
      dailyActiveUsers: Math.round(activeUsers * 0.7), // Estimativa
      weeklyActiveUsers: Math.round(activeUsers * 0.85), // Estimativa
      monthlyActiveUsers: activeUsers,
      averageSessionDuration: 755, // Em segundos - placeholder
      retentionRate: Math.round((completedOnboarding / total) * 100),
    };
  }

  /**
   * Calcula métricas de assinatura
   */
  private calculateSubscriptionMetrics(users: any[]) {
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
      churnRate: 2.3, // Placeholder - implementar com dados reais
      lifetime: Object.entries(planCounts)
        .filter(([plan]) => plan !== 'free')
        .map(([plan, count]) => ({
          plan,
          value: Math.round(count * planPrices[plan] * 12), // LTV anual estimado
        })),
    };
  }
}