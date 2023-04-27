import { Type } from '@nestjs/common';

export type THandle<T> = Type<T>;
export type STHandle<T> = string | Type<T>;
export type SSTHandle<T> = symbol | string | Type<T>;
export type SSHandle = string | symbol;
