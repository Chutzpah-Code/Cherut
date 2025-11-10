import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Log detailed validation errors
    this.logger.error(`❌ Validation error on ${request.method} ${request.url}`);
    this.logger.error(`📋 Request body: ${JSON.stringify(request.body, null, 2)}`);
    this.logger.error(`🔍 Validation errors: ${JSON.stringify(exceptionResponse, null, 2)}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exceptionResponse.message || 'Validation failed',
      errors: exceptionResponse.message || [],
    });
  }
}