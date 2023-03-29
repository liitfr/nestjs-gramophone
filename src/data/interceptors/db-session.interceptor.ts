import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { DbSession } from '../abstracts/db-session.abstract';

@Injectable()
export class DbSessionInterceptor implements NestInterceptor {
  constructor(private readonly dbSession: DbSession<unknown>) {}

  private readonly logger = new Logger(DbSessionInterceptor.name);

  async intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    await this.dbSession.start();

    return next.handle().pipe(
      tap({
        complete: async () => {
          await this.dbSession.commit();
          await this.dbSession.end();
        },
        error: async (err: Error) => {
          await this.dbSession.abort();
          await this.dbSession.end();
          this.logger.error(err);
        },
      }),
    );
  }
}
