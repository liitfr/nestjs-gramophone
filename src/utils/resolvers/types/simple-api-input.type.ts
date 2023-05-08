import { Type } from '@nestjs/common';
import { Object } from 'ts-toolbelt';

import { Trackable } from '../../entities/simple-entity.decorator';

import { TransformEntityToInput } from './transform-entity-to-input.type';

export type SimpleApiInputObj<
  TEntity extends object,
  TRemove extends PropertyKey = keyof Trackable,
> = TransformEntityToInput<TEntity, TRemove>;

export type PartialSimpleApiInputObj<E extends object> = Object.Partial<
  SimpleApiInputObj<E>,
  'deep'
>;

export type SimpleApiInput<E extends object> = Type<SimpleApiInputObj<E>>;

export type PartialSimpleApiInput<E extends object> = Type<
  PartialSimpleApiInputObj<E>
>;
