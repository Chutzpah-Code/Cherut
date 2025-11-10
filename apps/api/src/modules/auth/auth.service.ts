import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { RegisterDto, LoginDto } from './dto';

/**
 * 📚 EXPLICAÇÃO: Auth Service
 *
 * Este service é o CORAÇÃO do sistema de autenticação.
 *
 * RESPONSABILIDADES:
 * 1. Criar usuários no Firebase Auth
 * 2. Validar Firebase ID tokens do cliente
 * 3. Gerenciar dados do usuário no Firestore
 * 4. Verificar tokens Firebase para autenticação
 *
 * DEPENDENCY INJECTION:
 * - FirebaseService → Acesso ao Firebase Auth e Firestore
 *
 * FLUXO DE REGISTRO:
 * 1. Cliente: POST /auth/register { email, password, displayName }
 * 2. register() → Cria usuário no Firebase Auth
 * 3. Cria registro inicial no Firestore (users collection)
 * 4. Gera token JWT
 * 5. Retorna: { user, accessToken }
 *
 * FLUXO DE LOGIN (Firebase-Only):
 * 1. Cliente autentica via Firebase Client SDK
 * 2. Cliente envia Firebase ID token para POST /auth/login
 * 3. Backend valida ID token com Firebase Admin SDK
 * 4. Retorna dados do usuário do Firestore
 *
 * SEGURANÇA:
 * - Usa exclusivamente Firebase ID tokens (RS256)
 * - Tokens validados pelo Google diretamente
 * - Não geramos JWTs próprios - mais seguro
 * - Cliente sempre autentica via Firebase Client SDK
 */

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Registra novo usuário
   *
   * IMPORTANTE: Esta rota ainda cria usuários direto no backend
   * para compatibilidade. Em produção, considere fazer registro
   * via Firebase Client SDK também.
   *
   * PASSOS:
   * 1. Cria usuário no Firebase Auth
   * 2. Cria documento inicial no Firestore (users/{uid})
   * 3. Retorna dados do usuário (sem JWT próprio)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;

    try {
      // 1. Criar usuário no Firebase Auth
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        this.logger.error('Firebase Auth not initialized');
        throw new Error('Firebase service not available');
      }

      const userRecord = await auth.createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0],
      });

      this.logger.log(`User registered: ${userRecord.uid} (${email})`);

      // 2. Criar documento no Firestore
      const db = this.firebaseService.getFirestore();
      if (!db) {
        this.logger.error('Firestore not initialized');
        throw new Error('Database service not available');
      }

      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Campos do sistema Cherut
        onboardingCompleted: false,
        lifePurpose: null,
        subscription: {
          plan: 'free', // Começa no plano grátis
          status: 'active',
          startDate: new Date().toISOString(),
        },
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      // 3. Retornar dados do usuário
      // Cliente deve autenticar via Firebase Client SDK para obter ID token
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        message: 'User registered successfully. Please authenticate via Firebase Client SDK.',
      };
    } catch (error) {
      this.logger.error('Registration error:', error);

      // Firebase error codes: https://firebase.google.com/docs/auth/admin/errors
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already registered');
      }

      if (error.message?.includes('Firebase') || error.message?.includes('Database service')) {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }

      throw error;
    }
  }

  /**
   * Valida Firebase ID Token (Firebase-Only Login)
   *
   * FLUXO SEGURO:
   * 1. Cliente autentica via Firebase Client SDK
   * 2. Cliente envia Firebase ID token nesta rota
   * 3. Backend valida token com Firebase Admin SDK
   * 4. Retorna dados do usuário se token válido
   *
   * SEGURANÇA:
   * - Token validado diretamente pelo Google
   * - Não validamos senhas no backend
   * - Evita problemas de segurança
   */
  async login(loginDto: LoginDto) {
    const { firebaseIdToken } = loginDto;

    if (!firebaseIdToken) {
      throw new BadRequestException(
        'Firebase ID token required. Please authenticate via Firebase Client SDK first.'
      );
    }

    try {
      // 1. Valida Firebase ID token
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const decodedToken = await auth.verifyIdToken(firebaseIdToken);
      this.logger.log(`Token validated for user: ${decodedToken.uid}`);

      // 2. Buscar dados completos do Firestore
      const db = this.firebaseService.getFirestore();
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        // Se usuário não existe no Firestore, criar registro inicial
        const userData = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email?.split('@')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          onboardingCompleted: false,
          lifePurpose: null,
          subscription: {
            plan: 'free',
            status: 'active',
            startDate: new Date().toISOString(),
          },
        };

        await db.collection('users').doc(decodedToken.uid).set(userData);
        this.logger.log(`Created Firestore record for existing Firebase user: ${decodedToken.uid}`);

        return {
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: userData.displayName,
          },
        };
      }

      const userData = userDoc.data()!;

      this.logger.log(`User logged in: ${decodedToken.uid} (${decodedToken.email})`);

      return {
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: userData.displayName || decodedToken.name || decodedToken.email?.split('@')[0],
        },
      };
    } catch (error) {
      this.logger.error('Login error:', error);

      if (error.code?.includes('auth/')) {
        throw new UnauthorizedException('Invalid Firebase ID token');
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Valida Firebase ID token e retorna dados do usuário
   * Usado pelo FirebaseStrategy para autenticar requisições
   */
  async validateToken(uid: string) {
    try {
      const db = this.firebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return null;
      }

      return {
        uid,
        ...userDoc.data(),
      };
    } catch (error) {
      this.logger.error('Token validation error:', error);
      return null;
    }
  }
}
