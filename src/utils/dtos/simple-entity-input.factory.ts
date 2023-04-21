import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Logger, Type } from '@nestjs/common';

import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../types/id.type';
import {
  Idable,
  Trackable,
  checkIfIsIdable,
  checkIfIsTrackable,
} from '../entities/simple-entity.decorator';
import { EntityStore } from '../entities/entity-store.service';

interface Options<E> {
  isIdMandatory?: boolean;
  removeTrackable?: boolean;
  removeFields?: readonly (keyof E)[];
  addFields?: Type<unknown>[];
}

export { Options as SimpleEntityInputFactoryOptions };

// BUG : fix typing that is brut force casted to Partial<E>
export type SimpleInput<E> = Type<Partial<E>>;

export function SimpleEntityInputFactory<E extends object>(
  Entity: Type<E>,
  {
    isIdMandatory = false,
    removeTrackable = true,
    removeFields,
    addFields,
  }: Options<E> = {
    isIdMandatory: false,
    removeTrackable: true,
  },
): SimpleInput<E> {
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

  let Result: Type<Partial<E>> = OmitType(Entity, [] as const);

  if (removeFields) {
    Result = OmitType(Result, removeFields) as unknown as Type<Partial<E>>;
  }

  if (!isIdMandatory && checkIfIsIdable(Entity)) {
    Result = OmitType(
      Result as unknown as Type<Idable>,
      ['_id'] as const,
    ) as unknown as Type<Partial<E>>;
    Result = IntersectionType(Result, OptionalIdField);
  }

  if (removeTrackable && checkIfIsTrackable(Entity)) {
    Result = OmitType(
      Result as unknown as Type<Trackable>,
      ['createdAt', 'updatedAt', 'creatorId', 'updaterId'] as const,
    ) as unknown as Type<Partial<E>>;
  }

  Result = OmitType(Result, [], InputType) as unknown as Type<Partial<E>>;

  if (!isIdMandatory && checkIfIsIdable(Entity)) {
    Result = IntersectionType(Result, OptionalIdField);
  }

  if (addFields) {
    addFields.forEach((field) => {
      Result = IntersectionType(Result, field);
    });
  }

  return Result;
}
