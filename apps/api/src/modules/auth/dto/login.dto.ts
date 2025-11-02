import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * 📚 EXPLICAÇÃO: Login DTO
 *
 * Similar ao RegisterDto, mas mais simples.
 * Valida apenas email e senha para login.
 *
 * FLUXO DE LOGIN:
 * 1. Cliente envia: POST /auth/login { email, password }
 * 2. NestJS valida com class-validator
 * 3. Se válido → Controller chama AuthService.login()
 * 4. AuthService verifica credenciais no Firebase
 * 5. Se correto → Retorna JWT token
 * 6. Cliente salva token e usa em requisições futuras
 */

export class LoginDto {
  /**
   * Email do usuário
   */
  @IsEmail()
  email: string;

  /**
   * Senha do usuário
   */
  @IsString()
  @MinLength(6)
  password: string;
}
