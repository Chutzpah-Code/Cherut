import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FirebaseService } from '../../../config/firebase.service';
import { AuthService } from '../auth.service';

/**
 * Firebase Authentication Strategy
 *
 * Valida tokens do Firebase Authentication (ID tokens)
 * Usa Firebase Admin SDK para verificar tokens RS256
 */
@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  private readonly logger = new Logger(FirebaseStrategy.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  /**
   * Valida Firebase ID token
   *
   * @param req - Request object
   * @returns User data
   */
  async validate(req: any) {
    const authHeader = req.headers.authorization;

    // Log headers apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error(`No valid auth header provided. Header: ${authHeader}`);
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Log validação apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`Validating Firebase token: ${token.substring(0, 20)}... (Length: ${token.length})`);
      }

      // Verifica o token com Firebase Admin SDK
      const auth = this.firebaseService.getAuth();

      if (!auth) {
        this.logger.error('Firebase Auth not initialized');
        throw new UnauthorizedException('Authentication service not available');
      }

      const decodedToken = await auth.verifyIdToken(token);

      // Log claims apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`Token validated successfully for user: ${decodedToken.uid}`);
        this.logger.log(`Token claims: ${JSON.stringify(decodedToken)}`);
      }

      // Busca dados do usuário no Firestore
      const user = await this.authService.validateToken(decodedToken.uid);

      if (!user) {
        this.logger.error(`User not found in database: ${decodedToken.uid}`);
        throw new UnauthorizedException('User not found');
      }

      // Log sucesso apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`User authenticated successfully: ${user.uid}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }
}
