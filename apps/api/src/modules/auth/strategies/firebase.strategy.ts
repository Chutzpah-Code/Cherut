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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('No token provided');
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      this.logger.log(`Validating Firebase token: ${token.substring(0, 20)}...`);

      // Verifica o token com Firebase Admin SDK
      const auth = this.firebaseService.getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      this.logger.log(`Token validated for user: ${decodedToken.uid}`);

      // Busca dados do usuário no Firestore
      const user = await this.authService.validateToken(decodedToken.uid);

      if (!user) {
        this.logger.error(`User not found: ${decodedToken.uid}`);
        throw new UnauthorizedException('User not found');
      }

      this.logger.log(`User authenticated: ${user.uid}`);
      return user;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
