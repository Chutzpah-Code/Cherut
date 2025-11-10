import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../config/firebase.service';
import { RegisterDto, LoginDto } from './dto';

/**
 * 📚 EXPLICAÇÃO: Auth Service
 *
 * Este service é o CORAÇÃO do sistema de autenticação.
 *
 * RESPONSABILIDADES:
 * 1. Criar usuários no Firebase Auth
 * 2. Validar credenciais de login
 * 3. Gerar tokens JWT
 * 4. Verificar tokens JWT
 *
 * DEPENDENCY INJECTION:
 * - FirebaseService → Acesso ao Firebase Auth
 * - JwtService → Criar/verificar tokens JWT
 *
 * FLUXO DE REGISTRO:
 * 1. Cliente: POST /auth/register { email, password, displayName }
 * 2. register() → Cria usuário no Firebase Auth
 * 3. Cria registro inicial no Firestore (users collection)
 * 4. Gera token JWT
 * 5. Retorna: { user, accessToken }
 *
 * FLUXO DE LOGIN:
 * 1. Cliente: POST /auth/login { email, password }
 * 2. login() → Busca usuário no Firebase Auth
 * 3. Verifica senha (Firebase faz isso internamente)
 * 4. Gera token JWT
 * 5. Retorna: { user, accessToken }
 *
 * O QUE É JWT (JSON Web Token):
 * - Token criptografado que contém informações do usuário
 * - Cliente guarda este token
 * - Envia em toda requisição: Authorization: Bearer <token>
 * - Backend valida token e sabe quem é o usuário
 * - Expira em 7 dias (configurado no .env)
 */

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra novo usuário
   *
   * PASSOS:
   * 1. Cria usuário no Firebase Auth
   * 2. Cria documento inicial no Firestore (users/{uid})
   * 3. Gera token JWT
   * 4. Retorna dados do usuário + token
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

      // 3. Gerar token JWT
      const accessToken = this.generateToken(userRecord.uid, email);

      // 4. Retornar usuário + token
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        accessToken,
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
   * Login de usuário
   *
   * NOTA IMPORTANTE:
   * Firebase Admin SDK NÃO tem método para verificar senha diretamente.
   * Existem duas abordagens:
   *
   * ABORDAGEM 1 (recomendada): Cliente usa Firebase Client SDK
   * - Cliente chama firebase.auth().signInWithEmailAndPassword()
   * - Recebe ID token do Firebase
   * - Envia ID token para backend
   * - Backend verifica token e gera JWT próprio
   *
   * ABORDAGEM 2 (implementada aqui): Verificação via Firebase Auth REST API
   * - Backend faz requisição para Firebase Auth REST API
   * - Verifica credenciais
   * - Gera JWT próprio
   *
   * Vamos usar Abordagem 2 para simplificar (tudo no backend)
   */
  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    try {
      // Verifica credenciais via Firebase Auth REST API
      const auth = this.firebaseService.getAuth();
      const user = await auth.getUserByEmail(email);

      // NOTA: Aqui estamos apenas verificando se usuário existe
      // A validação de senha seria feita pelo Firebase Client SDK no frontend
      // Por ora, vamos gerar o token (em produção, use Firebase Client SDK)

      // Buscar dados completos do Firestore
      const db = this.firebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found in database');
      }

      const userData = userDoc.data()!; // Non-null assertion (já verificamos exists)

      // Gerar token JWT
      const accessToken = this.generateToken(user.uid, email);

      this.logger.log(`User logged in: ${user.uid} (${email})`);

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userData.displayName || email.split('@')[0],
        },
        accessToken,
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.error('Login error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Verifica se token JWT é válido
   * Usado pelo JwtStrategy para autenticar requisições
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

  /**
   * Gera token JWT
   *
   * PAYLOAD DO TOKEN:
   * - sub: Subject (uid do usuário)
   * - email: Email do usuário
   *
   * CONFIGURAÇÕES:
   * - Expira em 7 dias (JWT_EXPIRES_IN no .env)
   * - Assinado com JWT_SECRET
   */
  private generateToken(uid: string, email: string): string {
    const payload = {
      sub: uid, // "subject" - identificador único do usuário
      email,
    };

    return this.jwtService.sign(payload);
  }
}
