import { NestInterceptor } from '@nestjs/common';

export type Interceptor<T = unknown, R = unknown> =
  | NestInterceptor<T, R>
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function;
