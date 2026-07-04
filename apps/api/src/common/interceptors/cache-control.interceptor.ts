import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, EMPTY, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      switchMap((data) => {
        if (req.method !== 'GET' || !data) return of(data);

        const etag = `"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

        if (req.headers['if-none-match'] === etag) {
          res.status(304).end();
          return EMPTY; // prevents NestJS from trying to send the body
        }

        return of(data);
      }),
    );
  }
}
