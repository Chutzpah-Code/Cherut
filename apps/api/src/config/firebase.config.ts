import { registerAs } from '@nestjs/config';

/**
 * 📚 EXPLICAÇÃO: Firebase Configuration
 *
 * Este arquivo exporta a configuração do Firebase usando o pattern
 * `registerAs` do @nestjs/config.
 *
 * O QUE ELE FAZ:
 * - Lê as variáveis de ambiente do arquivo .env
 * - Organiza as configs do Firebase em um objeto estruturado
 * - Permite injetar essas configs em qualquer lugar da aplicação
 *
 * COMO USAR (futuro):
 * ```typescript
 * constructor(
 *   @Inject(firebaseConfig.KEY)
 *   private config: ConfigType<typeof firebaseConfig>
 * ) {}
 * ```
 *
 * POR QUE USAR registerAs:
 * - Type-safe: TypeScript sabe os tipos das configs
 * - Organizado: Todas as configs do Firebase em um só lugar
 * - Testável: Fácil mockar em testes
 */

export default registerAs('firebase', () => ({
  /**
   * Caminho para o arquivo JSON de credenciais do Firebase Admin SDK
   * Este arquivo é baixado do Firebase Console > Project Settings > Service Accounts
   */
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-credentials.json',

  /**
   * Configs alternativas (caso você queira passar as credenciais via env vars)
   * Útil em ambientes de produção (Render, Vercel) onde você não pode upload arquivos
   */
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix line breaks
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}));
