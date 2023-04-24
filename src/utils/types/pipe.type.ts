import { PipeTransform, Type } from '@nestjs/common';

export type Pipe<T = unknown, R = unknown> =
  | PipeTransform<T, R>
  | Type<PipeTransform<T, R>>;
