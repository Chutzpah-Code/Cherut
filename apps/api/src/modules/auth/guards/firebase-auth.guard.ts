import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Firebase Auth Guard
 *
 * Protege rotas usando Firebase Authentication
 * Usa FirebaseStrategy para validar tokens
 */
@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase') {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Log apenas quando não é token válido ou em desenvolvimento
    if (process.env.NODE_ENV !== 'production' || !request.headers.authorization?.startsWith('Bearer ')) {
      const token = request.headers.authorization?.replace('Bearer ', '');
      this.logger.log(`Validating request to: ${request.url}`);
      this.logger.log(`Token: ${token ? token.substring(0, 20) + '...' : 'NO TOKEN'}`);
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`Authentication error: ${err.message}`);
    }

    if (info) {
      this.logger.warn(`Authentication info: ${info.message}`);
    }

    // Log autenticação bem-sucedida apenas em desenvolvimento
    if (user && process.env.NODE_ENV !== 'production') {
      this.logger.log(`User authenticated: ${user.uid}`);
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
