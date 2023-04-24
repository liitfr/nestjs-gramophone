import { ExceptionFilter } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Filter<T = unknown> = ExceptionFilter<T> | Function;
