import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';
import { SetMetadata } from '@nestjs/common';

import { generateCollectionName } from '../string.util';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';

import {
  ENTITY_METADATA,
  EntityMetadata,
  enhancerCheckerFactory,
  getEntityMetadata,
} from './entity.util';

const IS_IDABLE = 'IS_IDABLE';

export interface Idable {
  _id: Id;
}

export const checkIfIsIdable = enhancerCheckerFactory<Idable>(IS_IDABLE);

export function Idable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);
    const { entityName, entityDescription, entityEnhancers } = originalMetadata;

    @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityEnhancers: [...(entityEnhancers ?? []), IS_IDABLE],
    })
    @ObjectType(entityName)
    @Schema({ collection: generateCollectionName(entityName) })
    class Ided extends constructor implements Idable {
      @Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescription}'s id`,
      })
      _id: Id;
    }

    Object.defineProperty(Ided, 'name', { value: constructor.name });

    return Ided;
  };
}
