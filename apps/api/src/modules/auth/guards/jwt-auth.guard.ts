import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 📚 EXPLICAÇÃO: JWT Auth Guard
 *
 * O QUE É UM GUARD:
 * - Guard = "Guarda" que protege rotas
 * - Decide se requisição pode prosseguir ou não
 * - Se sim → Chama controller
 * - Se não → Retorna 401 Unauthorized
 *
 * COMO USAR:
 * ```typescript
 * @Get('protected')
 * @UseGuards(JwtAuthGuard)
 * async protectedRoute(@Request() req) {
 *   // req.user está disponível aqui
 *   return req.user;
 * }
 * ```
 *
 * O QUE ESTE GUARD FAZ:
 * 1. Extende AuthGuard('jwt') do Passport
 * 2. AuthGuard automaticamente:
 *    a) Extrai token do header
 *    b) Chama JwtStrategy.validate()
 *    c) Se validate() retorna dados → Injeta em req.user e permite acesso
 *    d) Se validate() lança erro → Retorna 401 Unauthorized
 *
 * POR QUE CRIAR ESTA CLASSE:
 * - Poderia usar @UseGuards(AuthGuard('jwt')) diretamente
 * - Mas criando JwtAuthGuard:
 *   1. Mais legível: @UseGuards(JwtAuthGuard)
 *   2. Permite customizar comportamento (se necessário no futuro)
 *   3. Facilita testes (mockar JwtAuthGuard)
 *
 * ROTAS PÚBLICAS vs PROTEGIDAS:
 *
 * PÚBLICA (sem guard):
 * @Post('login')
 * async login() { ... }
 * // Qualquer um pode acessar
 *
 * PROTEGIDA (com guard):
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * async getProfile() { ... }
 * // Só usuários autenticados podem acessar
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate() é chamado antes do controller
   *
   * @param context - Contexto de execução (contém request, response, etc.)
   * @returns true = permite acesso | false = bloqueia com 401
   *
   * super.canActivate(context) chama a lógica do AuthGuard:
   * - Extrai token
   * - Valida com JwtStrategy
   * - Retorna true/false
   */
  canActivate(context: ExecutionContext) {
    // Chama lógica do AuthGuard do Passport
    return super.canActivate(context);
  }
}
