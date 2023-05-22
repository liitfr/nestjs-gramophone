import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Logger, Type } from '@nestjs/common';
import { O } from 'ts-toolbelt';

import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../types/id.type';
import {
  checkIfIsIdable,
  checkIfIsTrackable,
} from '../entities/simple-entity.decorator';
import { EntityStore } from '../entities/entity-store.service';
import { TransformEntityToInput } from '../resolvers/types/transform-entity-to-input.type';
import { MergeClassesToObject } from '../types/merge-classes-to-object.type';
import { Trackable } from '../types/trackable.type';
import { Idable } from '../types/idable.type';

interface Options<
  TEntity extends object,
  TRemove extends readonly (keyof TEntity)[] = [],
  TAdd extends readonly Type[] = [],
> {
  removeFields?: TRemove;
  AddFields?: TAdd;
}

export type SimpleInput<
  TEntity extends object,
  TRemove extends readonly (keyof TEntity)[],
  TAdd extends Array<Type>,
> = Type<
  O.Merge<
    O.Omit<TransformEntityToInput<TEntity>, TRemove[number]>,
    MergeClassesToObject<TAdd>
  >
>;

export { Options as SimpleEntityInputFactoryOptions };

export function SimpleEntityInputFactory<
  TEntity extends object,
  TRemove extends readonly (keyof TEntity)[] = [],
  TAdd extends Array<Type> = [],
>(
  Entity: Type<TEntity>,
  options: Options<TEntity, TRemove, TAdd> = {},
): SimpleInput<TEntity, TRemove, TAdd> {
  const entityMetadata = EntityStore.get(Entity);

  const { entityToken, entityDescription } = entityMetadata;

  Logger.verbose(
    `SimpleEntityInput for ${entityToken.description}`,
    'SimpleEntityInputFactory',
  );

  @InputType({ isAbstract: true })
  class OptionalIdField {
    @Field(() => IdScalar, {
      nullable: true,
      description: `${entityDescription}'s id`,
    })
    readonly _id?: Id;
  }

  let Result = Entity as Type;

  if (options?.removeFields && options.removeFields.length > 0) {
    Result = OmitType(Result, options.removeFields) as Type;
  }

  if (checkIfIsIdable(Entity)) {
    Result = OmitType(
      Result as unknown as Type<Idable>,
      ['_id'] as const,
    ) as Type;
    Result = IntersectionType(Result, OptionalIdField);
  }

  if (checkIfIsTrackable(Entity)) {
    Result = OmitType(
      Result as unknown as Type<Trackable>,
      ['createdAt', 'updatedAt', 'creatorId', 'updaterId'] as const,
    ) as Type;
  }

  Result = OmitType(Result, [], InputType) as Type;

  if (checkIfIsIdable(Entity)) {
    Result = IntersectionType(Result, OptionalIdField);
  }

  if (options?.AddFields && options.AddFields.length > 0) {
    options.AddFields.forEach((field: Type) => {
      Result = IntersectionType(Result, field);
    });
  }

  return Result as SimpleInput<TEntity, TRemove, TAdd>;
}
