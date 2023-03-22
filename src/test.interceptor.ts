import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TestInterceptor.name);

  async intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    this.logger.log('start');

    return next.handle().pipe(
      tap({
        finalize: () => this.logger.log('intercept'),
      }),
    );
  }
}
