import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { LifeAreasModule } from '../life-areas/life-areas.module';

/**
 * 📚 EXPLICAÇÃO: Auth Module (Firebase-Only)
 *
 * Este módulo organiza autenticação usando exclusivamente Firebase:
 * - Controller (rotas HTTP)
 * - Service (lógica de negócio)
 * - FirebaseStrategy (validação de Firebase ID tokens)
 * - Guards (proteção de rotas) → FirebaseAuthGuard
 *
 * ESTRATÉGIA FIREBASE-ONLY:
 * - Frontend autentica via Firebase Client SDK
 * - Backend valida Firebase ID tokens diretamente
 * - Menos código, usa infraestrutura Firebase completa
 *
 * IMPORTS:
 * 1. PassportModule:
 *    - Biblioteca de autenticação do NestJS
 *    - Estratégia padrão: 'firebase'
 *
 * PROVIDERS:
 * - AuthService → Lógica de autenticação
 * - FirebaseStrategy → Valida Firebase ID tokens
 *
 * CONTROLLERS:
 * - AuthController → Rotas /auth/*
 *
 * EXPORTS:
 * - AuthService → Permite outros módulos usarem
 */

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase' }),
    LifeAreasModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseStrategy],
  exports: [AuthService],
})
export class AuthModule {}
