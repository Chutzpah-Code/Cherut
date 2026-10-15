import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminOnly } from '../auth/guards/admin.guard';
import {
  CreateAdminDto,
  PromoteUserDto,
  UserFiltersDto,
  UpdateUserDto,
  UpdateSystemSettingsDto,
} from './dto/admin.dto';

/**
 * Admin Controller
 *
 * Endpoints exclusivos para administradores
 * Todas as rotas protegidas com @AdminOnly()
 */

@Controller('admin')
@AdminOnly() // Aplica proteção admin a todo o controller
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 📊 DASHBOARD E MÉTRICAS
   */

  /**
   * GET /admin/overview
   * Dashboard principal com métricas gerais
   */
  @Get('overview')
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  /**
   * GET /admin/sales
   * Relatório de vendas e revenue
   */
  @Get('sales')
  async getSalesReport() {
    return this.adminService.getSalesReport();
  }

  /**
   * GET /admin/analytics
   * Analytics detalhados do sistema
   */
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  /**
   * 👥 GESTÃO DE USUÁRIOS
   */

  /**
   * GET /admin/users
   * Lista usuários com filtros opcionais
   *
   * Query params:
   * - role: 'user' | 'admin'
   * - plan: 'free' | 'premium' | 'enterprise'
   * - status: 'active' | 'inactive' | 'cancelled'
   * - search: busca por nome ou email
   * - limit: número de resultados (padrão: 50)
   * - offset: para paginação
   */
  @Get('users')
  async getUsers(@Query() filters: UserFiltersDto) {
    return this.adminService.getUsers(filters);
  }

  /**
   * POST /admin/users/create
   * Cria novo usuário administrador
   */
  @Post('users/create')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  /**
   * POST /admin/users/promote
   * Promove usuário existente para admin
   */
  @Post('users/promote')
  async promoteUser(@Body() promoteUserDto: PromoteUserDto) {
    return this.adminService.promoteUser(promoteUserDto);
  }

  /**
   * PATCH /admin/users/:uid
   * Atualiza displayName/email/role de um usuário existente
   */
  @Patch('users/:uid')
  async updateUser(@Param('uid') uid: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(uid, dto);
  }

  @Get('activity')
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Post('users/:uid/reset-password-link')
  async generatePasswordResetLink(@Param('uid') uid: string) {
    return this.adminService.generatePasswordResetLink(uid);
  }

  @Post('users/:uid/suspend')
  async suspendUser(@Param('uid') uid: string) {
    return this.adminService.setUserSuspended(uid, true);
  }

  @Post('users/:uid/reactivate')
  async reactivateUser(@Param('uid') uid: string) {
    return this.adminService.setUserSuspended(uid, false);
  }

  /**
   * 🪜 FUNIL DE ATIVAÇÃO E USO POR CURSO
   */

  @Get('funnel')
  async getActivationFunnel() {
    return this.adminService.getActivationFunnel();
  }

  @Get('module-usage')
  async getModuleUsage() {
    return this.adminService.getModuleUsage();
  }

  @Get('courses/:courseId/enrollments')
  async getCourseEnrollments(@Param('courseId') courseId: string) {
    return this.adminService.getCourseEnrollments(courseId);
  }

  /**
   * ⚙️ CONFIGURAÇÕES DO SISTEMA
   */

  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  async updateSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.adminService.updateSettings(dto);
  }

  /**
   * 🧹 MANUTENÇÃO
   */

  @Post('maintenance/cleanup-inactive-users')
  async cleanupInactiveUsers() {
    return this.adminService.cleanupInactiveUsers();
  }

  /**
   * GET /admin/services-status
   * Status real de cada serviço (não fabricado). Deliberately NOT named
   * with "health" in the path — apiClient's request interceptor skips
   * attaching the auth token for any URL containing that substring
   * (meant for the public /health check), which would 401 this
   * @AdminOnly() route.
   */
  @Get('services-status')
  async getServicesHealth() {
    return this.adminService.getServicesHealth();
  }

  /**
   * 🔍 ENDPOINTS DE TESTE E DEBUG
   */

  /**
   * GET /admin/health
   * Verifica se o sistema admin está funcionando
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'OK',
      message: 'Admin system is operational',
      timestamp: new Date().toISOString(),
    };
  }
}