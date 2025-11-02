import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';

/**
 * 📚 EXPLICAÇÃO: JWT Strategy
 *
 * O QUE É UMA STRATEGY:
 * - Define COMO validar autenticação
 * - JWT Strategy valida tokens JWT
 * - Outras strategies: Local (user/password), OAuth, etc.
 *
 * COMO FUNCIONA:
 * 1. Cliente faz requisição: GET /auth/me
 *    Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * 2. JwtAuthGuard é ativado (porque rota tem @UseGuards(JwtAuthGuard))
 *
 * 3. Guard chama JwtStrategy automaticamente
 *
 * 4. JwtStrategy:
 *    a) Extrai token do header Authorization
 *    b) Verifica assinatura do token com JWT_SECRET
 *    c) Decodifica payload { sub: "uid", email: "user@example.com" }
 *    d) Chama validate(payload)
 *
 * 5. validate() método:
 *    a) Recebe payload decodificado
 *    b) Busca usuário no banco (via AuthService.validateToken)
 *    c) Se usuário existe → Retorna dados do usuário
 *    d) Se não existe → Lança UnauthorizedException
 *
 * 6. Passport (biblioteca) pega retorno de validate() e injeta em req.user
 *
 * 7. Controller recebe req.user já preenchido
 *
 * CONFIGURAÇÃO:
 * - jwtFromRequest: Extrai token do header "Authorization: Bearer <token>"
 * - ignoreExpiration: false → Rejeita tokens expirados
 * - secretOrKey: Chave secreta para verificar assinatura (do .env)
 *
 * FLUXO VISUAL:
 * Request → Guard → Strategy → validate() → req.user → Controller
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      // Extrai token do header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // false = Rejeita tokens expirados
      ignoreExpiration: false,

      // Chave secreta para verificar assinatura do token
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Valida payload do token JWT
   *
   * @param payload - Dados decodificados do token
   *   Exemplo: { sub: "abc123", email: "user@example.com", iat: 1234567890, exp: 1234567890 }
   *
   * @returns Dados do usuário (injetados em req.user)
   * @throws UnauthorizedException se usuário não existe
   *
   * IMPORTANTE:
   * - Este método é chamado AUTOMATICAMENTE pelo Passport
   * - Você NÃO chama este método diretamente
   * - Passport já verificou a assinatura do token (se chegou aqui, token é válido)
   * - Aqui só verificamos se usuário ainda existe no banco
   */
  async validate(payload: any) {
    const { sub: uid } = payload;

    // Busca usuário no Firestore
    const user = await this.authService.validateToken(uid);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // O que você retornar aqui será injetado em req.user
    return user;
  }
}
