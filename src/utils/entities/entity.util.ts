import { Type } from '@nestjs/common';

import { RelationDetails, RelationEntity } from '../relations/relation.util';

import { EntityStore } from './entity-store.service';

export const ENTITY_METADATA = Symbol('entityMetadata');

export interface EntityRelation {
  target: RelationEntity;
  details: RelationDetails;
}

export interface EntityMetadata {
  Entity: Type<unknown>;
  entityToken: symbol;
  entityDescription?: string;
  entityEnhancers?: string[];
  entityRelations?: EntityRelation[];
  EntityPartition?: Record<string, string>;
  entityPartitioner?: string;
  entityServiceToken?: symbol;
  entityRepositoryToken?: symbol;
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
