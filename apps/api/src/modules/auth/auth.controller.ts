import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 📚 EXPLICAÇÃO: Auth Controller
 *
 * O QUE É UM CONTROLLER:
 * - Camada que lida com requisições HTTP
 * - Define rotas (endpoints)
 * - Recebe dados, chama service, retorna resposta
 *
 * DECORATORS USADOS:
 * - @Controller('auth') → Prefixo de rota: /auth/*
 * - @Post() → Método HTTP POST
 * - @Get() → Método HTTP GET
 * - @Body() → Pega dados do body da requisição
 * - @HttpCode() → Define código de status HTTP
 * - @UseGuards() → Protege rota (precisa estar autenticado)
 * - @Request() → Acessa objeto da requisição (com dados do usuário)
 *
 * ROTAS EXPOSTAS:
 * - POST /auth/register → Registrar novo usuário
 * - POST /auth/login → Fazer login
 * - GET /auth/me → Obter dados do usuário logado (protegida)
 *
 * VALIDAÇÃO AUTOMÁTICA:
 * - ValidationPipe valida DTOs automaticamente
 * - Se dados inválidos → Retorna 400 Bad Request
 * - Se válidos → Passa para o service
 *
 * EXEMPLO DE REQUISIÇÕES:
 *
 * 1. REGISTER:
 * POST http://localhost:3000/auth/register
 * Content-Type: application/json
 * {
 *   "email": "joao@example.com",
 *   "password": "senha123",
 *   "displayName": "João Silva"
 * }
 *
 * Resposta (201 Created):
 * {
 *   "user": {
 *     "uid": "abc123",
 *     "email": "joao@example.com",
 *     "displayName": "João Silva"
 *   },
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * 2. LOGIN:
 * POST http://localhost:3000/auth/login
 * Content-Type: application/json
 * {
 *   "email": "joao@example.com",
 *   "password": "senha123"
 * }
 *
 * Resposta (200 OK):
 * {
 *   "user": { ... },
 *   "accessToken": "..."
 * }
 *
 * 3. GET ME (protegida):
 * GET http://localhost:3000/auth/me
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * Resposta (200 OK):
 * {
 *   "uid": "abc123",
 *   "email": "joao@example.com",
 *   "displayName": "João Silva"
 * }
 */

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registra novo usuário
   *
   * @Body: RegisterDto (validado automaticamente)
   * @Returns: { user, accessToken }
   */
  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Faz login
   *
   * @HttpCode(200) → Por padrão POST retorna 201, mas login deve retornar 200
   * @Body: LoginDto (validado automaticamente)
   * @Returns: { user, accessToken }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/me
   * Retorna dados do usuário logado
   *
   * @UseGuards(JwtAuthGuard) → Protege rota (precisa estar autenticado)
   * @Request → Objeto da requisição (contém req.user injetado pelo guard)
   * @Returns: Dados do usuário
   *
   * COMO FUNCIONA:
   * 1. Cliente envia: GET /auth/me + Authorization: Bearer <token>
   * 2. JwtAuthGuard valida token
   * 3. Se válido → Guard injeta dados do usuário em req.user
   * 4. Controller retorna req.user
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }
}
