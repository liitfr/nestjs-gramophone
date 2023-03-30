import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';
import { Type } from '@nestjs/common';

import {
  EntityDecorator,
  entityDescription,
  entityEnhancers,
  entityName,
  getEntityDescription,
  getEntityName,
} from './enhancers.util';
import { generateCollectionName } from '../string.util';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';

const IS_IDABLE = 'IS_IDABLE';

export interface Idable {
  _id: Id;
}

export const checkIfIsIdable = (classRef: Type): classRef is Type<Idable> =>
  (
    Object.getOwnPropertyDescriptor(classRef, entityEnhancers)?.value ?? []
  ).includes(IS_IDABLE);

export function Idable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: generateCollectionName(entityNameValue) })
    class Ided extends constructor implements EntityDecorator, Idable {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;
      static [entityEnhancers] = [];

      @Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}'s id`,
      })
      _id: Id;
    }

    Object.defineProperty(Ided, 'name', { value: constructor.name });
    Object.defineProperty(Ided, entityEnhancers, {
      value: [
        IS_IDABLE,
        ...(Object.getOwnPropertyDescriptor(constructor, entityEnhancers)
          ?.value ?? []),
      ],
    });

    return Ided;
  };
}
