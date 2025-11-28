import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminOnly } from '../auth/guards/admin.guard';
import { CreateAdminDto, PromoteUserDto, UserFiltersDto } from './dto/admin.dto';

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