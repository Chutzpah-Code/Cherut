import { IsString, MinLength } from 'class-validator';

/**
 * 📚 EXPLICAÇÃO: Login DTO (Firebase-Only)
 *
 * Para estratégia Firebase-Only, o cliente autentica
 * via Firebase Client SDK e envia o ID token.
 *
 * FLUXO DE LOGIN SEGURO:
 * 1. Cliente autentica via Firebase Client SDK
 * 2. Cliente recebe Firebase ID token
 * 3. Cliente envia: POST /auth/login { firebaseIdToken }
 * 4. Backend valida token com Firebase Admin SDK
 * 5. Se válido → Retorna dados do usuário
 *
 * VANTAGENS:
 * - Senha nunca trafega para o backend
 * - Token validado diretamente pelo Google
 * - Mais seguro que validação manual
 */

export class LoginDto {
  /**
   * Firebase ID Token obtido via Firebase Client SDK
   * Este token é assinado pelo Google e validado pelo Firebase Admin SDK
   */
  @IsString()
  @MinLength(100, { message: 'Firebase ID token must be valid' })
  firebaseIdToken: string;
}
