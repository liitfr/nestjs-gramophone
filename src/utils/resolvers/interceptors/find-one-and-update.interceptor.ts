import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export const FILTER_VALUE = Symbol('filterValue');

// Pass filter payload to update payload

@Injectable()
export class FindOneAndUpdateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgByIndex(1);
    // const user = getUserFromContext(context);

    args.update[FILTER_VALUE] = args.filter;

    return next.handle();
  }
}
