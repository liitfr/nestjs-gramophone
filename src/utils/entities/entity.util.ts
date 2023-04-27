import { Type } from '@nestjs/common';
import { Schema as MongooseSchema } from 'mongoose';

import { EntityRelation } from '../../data/utils/relation.util';
import { EntityNested } from '../../data/utils/nested.util';

import { pascalCase, splitPascalWithSpaces } from '../string.util';
import { Constructor } from '../types/constructor.type';

import { EntityStore } from './entity-store.service';
import { SetEntityToken } from './set-entity-token.decorator';
import { SetEntityMetadata } from './set-entity-metadata.decorator';

export const ENTITY_METADATA = Symbol('entityMetadata');

export interface EntityMetadata<E extends object = object> {
  Entity: Type<E>;
  entityToken: symbol;
  entityDescription?: string;
  entityEnhancers?: string[];
  entityRelations?: EntityRelation[];
  EntityPartition?: Record<string, string>;
  entityPartitioner?: string;
  entityServiceToken?: symbol;
  entityRepositoryToken?: symbol;
  entitySchema?: MongooseSchema;
  nestedEntities?: EntityNested[];
}

export const enhancerCheckerFactory =
  <E extends object>(enhancerName: string) =>
  (Entity: Type<object>): Entity is Type<E> => {
    const entityMetadata = EntityStore.get(Entity);

    const { entityEnhancers } = entityMetadata ?? { entityEnhancers: [] };

    if (
      !entityEnhancers ||
      !Array.isArray(entityEnhancers) ||
      !entityEnhancers.length ||
      !entityEnhancers.includes(enhancerName)
    ) {
      return false;
    }

    return true;
  };

export const isEntityDecorated = (Entity: Type<object>): boolean =>
  !!Reflect.getMetadata(ENTITY_METADATA, Entity);

export const getEntityToken = (Entity: Type<object>): symbol | undefined => {
  const metadata = Reflect.getMetadata(ENTITY_METADATA, Entity);
  return metadata?.entityToken;
};

export const initEntityMetadata = (
  constructor: Constructor,
  defaultToken?: symbol,
) => {
  let originalEntityMetadata: Partial<EntityMetadata>;

  if (!getEntityToken(constructor)) {
    const entityToken = defaultToken ?? Symbol(constructor.name);
    SetEntityToken(entityToken)(constructor);
    originalEntityMetadata = {
      entityToken,
      entityDescription: splitPascalWithSpaces(pascalCase(constructor.name)),
    };
    SetEntityMetadata(originalEntityMetadata)(constructor);
  } else {
    originalEntityMetadata = EntityStore.get(constructor);
  }

  return originalEntityMetadata;
};
