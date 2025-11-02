import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './config/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { LifeAreasModule } from './modules/life-areas/life-areas.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';

/**
 * 📚 EXPLICAÇÃO: App Module (Módulo Raiz)
 *
 * MÓDULOS IMPORTADOS:
 * 1. ConfigModule.forRoot() → Carrega variáveis de ambiente do .env
 * 2. FirebaseModule → Inicializa Firebase Admin SDK
 * 3. AuthModule → Sistema de autenticação (NEW!)
 *
 * ConfigModule.forRoot():
 * - isGlobal: true → Configurações ficam disponíveis em toda aplicação
 * - envFilePath: '.env' → Arquivo com variáveis de ambiente
 * - Lê automaticamente process.env e .env file
 *
 * FirebaseModule:
 * - Marcado como @Global() → Disponível em toda aplicação
 * - FirebaseService pode ser injetado em qualquer service
 * - Inicializa quando a aplicação inicia (onModuleInit)
 *
 * AuthModule:
 * - Expõe rotas: /auth/register, /auth/login, /auth/me
 * - Implementa JWT authentication
 * - Integra com Firebase Auth
 */

@Module({
  imports: [
    // Configura variáveis de ambiente globalmente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Inicializa Firebase Admin SDK
    FirebaseModule,
    // Sistema de autenticação
    AuthModule,
    // Life Areas (áreas da vida)
    LifeAreasModule,
    // Objectives (OKR methodology)
    ObjectivesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
