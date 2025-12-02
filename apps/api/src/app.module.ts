import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { FirebaseModule } from './config/firebase.module';
import cloudinaryConfig from './config/cloudinary.config';
import { AuthModule } from './modules/auth/auth.module';
import { LifeAreasModule } from './modules/life-areas/life-areas.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { ActionPlansModule } from './modules/action-plans/action-plans.module';
import { ProfileModule } from './modules/profile/profile.module';
import { HabitsModule } from './modules/habits/habits.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { EnterpriseWaitlistModule } from './enterprise-waitlist/enterprise-waitlist.module';
import { VisionBoardModule } from './modules/vision-board/vision-board.module';
import { AdminModule } from './modules/admin/admin.module';
import { JournalModule } from './modules/journal/journal.module';
import { ValuesModule } from './modules/values/values.module';

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
      load: [cloudinaryConfig],
    }),
    // Inicializa Firebase Admin SDK
    FirebaseModule,
    // Sistema de autenticação
    AuthModule,
    // User Profile (perfil do usuário)
    ProfileModule,
    // Life Areas (áreas da vida)
    LifeAreasModule,
    // Objectives (OKR methodology)
    ObjectivesModule,
    // Key Results (measurable outcomes)
    KeyResultsModule,
    // Action Plans (5W2H method)
    ActionPlansModule,
    // Habits (rastreamento de hábitos)
    HabitsModule,
    // Tracking (métricas e progresso)
    TrackingModule,
    // Tasks (gerenciamento Kanban + Pomodoro)
    TasksModule,
    // Enterprise Waitlist (formulário de interesse corporativo)
    EnterpriseWaitlistModule,
    // Vision Board (quadro de visualização de objetivos com imagens)
    VisionBoardModule,
    // Admin (dashboard administrativo)
    AdminModule,
    // Journal (personal journaling for daily reflections)
    JournalModule,
    // Values (core personal values definition and alignment)
    ValuesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
