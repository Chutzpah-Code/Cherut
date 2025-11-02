import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import firebaseConfig from './firebase.config';

/**
 * 📚 EXPLICAÇÃO: Firebase Service
 *
 * O QUE ESTE SERVICE FAZ:
 * - Inicializa o Firebase Admin SDK quando a aplicação inicia
 * - Fornece acesso ao Firestore (banco de dados)
 * - Fornece acesso ao Firebase Auth (autenticação)
 *
 * DECORATORS USADOS:
 * - @Injectable() → Permite ser injetado em outros services
 * - OnModuleInit → Interface que força implementar onModuleInit()
 *   - Este método é chamado automaticamente quando o módulo inicializa
 *
 * DEPENDENCY INJECTION:
 * - @Inject(firebaseConfig.KEY) → Injeta as configurações do Firebase
 * - ConfigType<typeof firebaseConfig> → Type-safe configs
 *
 * COMO USAR EM OUTROS SERVICES:
 * ```typescript
 * constructor(private readonly firebaseService: FirebaseService) {}
 *
 * async createUser(email: string) {
 *   const auth = this.firebaseService.getAuth();
 *   return auth.createUser({ email });
 * }
 *
 * async saveToFirestore(data: any) {
 *   const db = this.firebaseService.getFirestore();
 *   return db.collection('users').add(data);
 * }
 * ```
 */

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(
    @Inject(firebaseConfig.KEY)
    private config: ConfigType<typeof firebaseConfig>,
  ) {}

  /**
   * onModuleInit() é chamado automaticamente quando NestJS inicializa este módulo
   * É o lugar ideal para inicializar Firebase Admin SDK
   */
  async onModuleInit() {
    try {
      await this.initializeFirebase();
      this.logger.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  /**
   * Inicializa o Firebase Admin SDK
   *
   * ESTRATÉGIA:
   * 1. Primeiro tenta usar arquivo JSON de credenciais (desenvolvimento)
   * 2. Se não encontrar, tenta usar variáveis de ambiente (produção)
   */
  private async initializeFirebase() {
    // Verifica se Firebase já foi inicializado
    if (admin.apps.length > 0) {
      this.logger.log('Firebase already initialized');
      this.firebaseApp = admin.apps[0]!; // Non-null assertion (já verificamos length > 0)
      return;
    }

    // Tenta inicializar com arquivo JSON
    if (this.config.serviceAccountPath && fs.existsSync(this.config.serviceAccountPath)) {
      this.logger.log(`Initializing Firebase with service account file: ${this.config.serviceAccountPath}`);

      const serviceAccount = JSON.parse(
        fs.readFileSync(this.config.serviceAccountPath, 'utf8'),
      );

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      return;
    }

    // Tenta inicializar com variáveis de ambiente
    if (this.config.projectId && this.config.privateKey && this.config.clientEmail) {
      this.logger.log('Initializing Firebase with environment variables');

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.projectId,
          privateKey: this.config.privateKey,
          clientEmail: this.config.clientEmail,
        }),
      });

      return;
    }

    // Se chegou aqui, não tem credenciais configuradas
    throw new Error(
      'Firebase credentials not found. Please provide either:\n' +
      '1. Service account JSON file (FIREBASE_SERVICE_ACCOUNT_PATH)\n' +
      '2. Environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)',
    );
  }

  /**
   * Retorna a instância do Firebase Admin Auth
   * Use para criar/deletar usuários, verificar tokens, etc.
   */
  getAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }

  /**
   * Retorna a instância do Firestore
   * Use para ler/escrever dados no banco
   */
  getFirestore(): admin.firestore.Firestore {
    return admin.firestore(this.firebaseApp);
  }

  /**
   * Retorna a instância do Firebase App
   * Caso precise de algo mais específico
   */
  getApp(): admin.app.App {
    return this.firebaseApp;
  }
}
