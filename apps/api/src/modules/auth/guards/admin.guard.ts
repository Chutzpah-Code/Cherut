import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Admin Guard
 *
 * Protege rotas que são exclusivas para administradores
 *
 * USO:
 * @UseGuards(FirebaseAuthGuard, AdminGuard) // Primeiro autentica, depois verifica se é admin
 * @Get('admin/users')
 * getUsers() {}
 *
 * FUNCIONAMENTO:
 * 1. Usuário já deve estar autenticado (FirebaseAuthGuard)
 * 2. Verifica se user.role === 'admin'
 * 3. Bloqueia acesso se não for admin
 *
 * SEGURANÇA:
 * - Sempre usar junto com FirebaseAuthGuard
 * - Logs de tentativas de acesso negado
 * - Verificação dupla de permissões
 */

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Log da tentativa de acesso
    this.logger.log(`Admin access attempt - User: ${user?.uid || 'anonymous'}, Route: ${request.url}`);

    // Verificar se usuário está autenticado
    if (!user) {
      this.logger.warn(`❌ Admin access denied - No authenticated user for route: ${request.url}`);
      throw new ForbiddenException('Authentication required for admin access');
    }

    // Verificar se usuário é admin
    if (!this.isAdmin(user)) {
      this.logger.warn(`❌ Admin access denied - User ${user.uid} (${user.email}) is not admin. Route: ${request.url}`);
      throw new ForbiddenException('Admin privileges required');
    }

    // Log de acesso autorizado
    this.logger.log(`✅ Admin access granted - User ${user.uid} (${user.email})`);
    return true;
  }

  /**
   * Verifica se usuário tem permissões de admin
   */
  private isAdmin(user: any): boolean {
    // Verificação principal: campo role
    if (user.role === 'admin') {
      return true;
    }

    // Verificação adicional: flag isSystemAdmin para segurança extra
    if (user.isSystemAdmin === true) {
      return true;
    }

    // Verificação de permissões específicas
    if (user.permissions && Array.isArray(user.permissions)) {
      if (user.permissions.includes('all') || user.permissions.includes('admin')) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Decorator para facilitar aplicação do AdminGuard
 *
 * USO:
 * @AdminOnly()
 * @Get('sensitive-data')
 * getSensitiveData() {}
 *
 * É equivalente a:
 * @UseGuards(FirebaseAuthGuard, AdminGuard)
 */
import { UseGuards, applyDecorators } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(FirebaseAuthGuard, AdminGuard)
  );
}