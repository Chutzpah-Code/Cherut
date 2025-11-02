import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * 📚 EXPLICAÇÃO: Auth Module
 *
 * Este módulo organiza tudo relacionado a autenticação:
 * - Controller (rotas HTTP)
 * - Service (lógica de negócio)
 * - Strategy (validação de JWT)
 * - Guards (proteção de rotas) → Serão importados onde necessário
 *
 * IMPORTS:
 *
 * 1. PassportModule:
 *    - Biblioteca de autenticação do NestJS
 *    - Estratégia padrão: 'jwt'
 *
 * 2. JwtModule.registerAsync():
 *    - Configura JWT dinamicamente
 *    - useFactory → Função que retorna configuração
 *    - inject: [ConfigService] → Injeta ConfigService para acessar .env
 *    - secret: JWT_SECRET do .env
 *    - signOptions: { expiresIn } → Token expira em 7 dias
 *
 * 3. ConfigModule:
 *    - Já é global (configurado no AppModule)
 *    - Mas importamos aqui para type safety
 *
 * PROVIDERS:
 * - AuthService → Lógica de autenticação
 * - JwtStrategy → Valida tokens JWT
 *
 * CONTROLLERS:
 * - AuthController → Rotas /auth/*
 *
 * EXPORTS:
 * - AuthService → Permite outros módulos usarem (se necessário)
 */

@Module({
  imports: [
    // Passport com estratégia JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configura JWT dinamicamente com valores do .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
