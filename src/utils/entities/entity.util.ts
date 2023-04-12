import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const ENTITY_METADATA = Symbol('entityMetadata');

export interface EntityRelation {
  Relation: Type<unknown>;
  nullable?: boolean;
  resolve?: boolean;
  partitionQueries?: boolean;
  idName?: string;
  idDescription?: string;
  resolvedName?: string;
  resolvedDescription?: string;
  multiple?: boolean;
}

export interface EntityMetadata {
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
  <E>(enhancerName: string) =>
  (Entity: Type): Entity is Type<E> => {
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA, Entity);

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

export const isEntityDecorated = (Entity: Type): boolean =>
  !!Reflect.getMetadata(ENTITY_METADATA, Entity);

export const getEntityMetadata = (Entity: Type): EntityMetadata => {
  const entityMetadata = Reflect.getMetadata(ENTITY_METADATA, Entity);
  return {
    entityDescription: addSpaceToPascalCase(Entity.name),
    ...entityMetadata,
  };
};
