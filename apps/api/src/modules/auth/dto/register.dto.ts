import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * 📚 EXPLICAÇÃO: Register DTO (Data Transfer Object)
 *
 * O QUE É UM DTO:
 * - Objeto que carrega dados entre processos
 * - Define a estrutura de dados que esperamos receber
 * - Valida automaticamente os dados com decorators
 *
 * DECORATORS DE VALIDAÇÃO (class-validator):
 * - @IsEmail() → Valida se é email válido
 * - @IsString() → Valida se é string
 * - @MinLength(6) → Valida se tem no mínimo 6 caracteres
 * - @IsOptional() → Campo opcional
 *
 * COMO FUNCIONA:
 * 1. Cliente envia: POST /auth/register { email, password, displayName }
 * 2. NestJS valida automaticamente usando estes decorators
 * 3. Se inválido → Retorna erro 400 Bad Request
 * 4. Se válido → Controller recebe objeto tipado RegisterDto
 *
 * EXEMPLO DE USO NO CONTROLLER:
 * ```typescript
 * @Post('register')
 * async register(@Body() registerDto: RegisterDto) {
 *   // registerDto já vem validado!
 *   return this.authService.register(registerDto);
 * }
 * ```
 */

export class RegisterDto {
  /**
   * Email do usuário
   * Validações:
   * - Deve ser email válido (formato: user@domain.com)
   *
   * Exemplo: "joao@example.com"
   */
  @IsEmail()
  email: string;

  /**
   * Senha do usuário
   * Validações:
   * - Deve ser string
   * - Mínimo 6 caracteres
   *
   * Exemplo: "senha123"
   */
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Nome de exibição do usuário (opcional)
   * Se não fornecido, usa o nome do email
   *
   * Exemplo: "João Silva"
   */
  @IsOptional()
  @IsString()
  displayName?: string;
}
