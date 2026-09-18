import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// First proof of the machine-readable API error contract: a stable `code`
// + `params` the frontend translates for display, instead of shipping
// English text in the response. See docs from the i18n Phase 2 rollout.
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnauthorizedExceptionFilter.name);

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.warn(`Unauthorized on ${request.method} ${request.url}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code: 'AUTH_UNAUTHORIZED',
      params: {},
      message: exception.message || 'Unauthorized',
    });
  }
}
