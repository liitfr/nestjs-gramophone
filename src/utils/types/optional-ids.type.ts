import { Id } from './id.type';

export type OptionalId<T, K extends keyof T> = K extends '_id'
  ? Id | undefined
  : T[K] extends Id
  ? T[K]
  : T[K] extends object
  ? OptionalIds<T[K]>
  : T[K];

export type OptionalIds<T> = {
  [K in keyof T]: OptionalId<T, K>;
};
