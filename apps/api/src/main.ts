import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * 📚 EXPLICAÇÃO: Main.ts (Ponto de Entrada)
 *
 * MUDANÇAS:
 * - app.useGlobalPipes(new ValidationPipe()) → Valida DTOs automaticamente
 * - app.enableCors() → Permite requisições de outros domínios (web, mobile)
 *
 * ValidationPipe:
 * - Valida automaticamente todos os DTOs com decorators (class-validator)
 * - whitelist: true → Remove propriedades não definidas no DTO
 * - transform: true → Converte tipos automaticamente (string → number, etc.)
 *
 * CORS (Cross-Origin Resource Sharing):
 * - Permite que frontend (localhost:3002) faça requisições para API (localhost:3000)
 * - Sem CORS, navegador bloqueia requisições entre domínios diferentes
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      transform: true, // Converte tipos automaticamente
    }),
  );

  // Habilita CORS para permitir requisições do frontend
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
