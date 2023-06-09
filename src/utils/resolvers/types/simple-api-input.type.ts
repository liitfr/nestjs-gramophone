import { Type } from '@nestjs/common';

import { Trackable } from '../../types/trackable.type';

import { TransformEntityToInput } from './transform-entity-to-input.type';
import { DeepEntityPartial } from './deep-entity-partial.type';

// API input is like repository input but without trackable fields (resolved in resolvers)
// and with optional _ids (if client wants to generate them)

export type SimpleApiInputObj<
  TEntity extends object,
  TRemove extends PropertyKey = keyof Trackable,
> = TransformEntityToInput<TEntity, TRemove>;

export type PartialSimpleApiInputObj<E extends object> = DeepEntityPartial<
  SimpleApiInputObj<E>
>;

export type SimpleApiInput<E extends object> = Type<SimpleApiInputObj<E>>;

export type PartialSimpleApiInput<E extends object> = Type<
  PartialSimpleApiInputObj<E>
>;
