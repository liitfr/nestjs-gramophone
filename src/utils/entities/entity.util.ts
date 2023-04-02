import { Type } from '@nestjs/common';
import { addSpaceToPascalCase } from '../string.util';

export const ENTITY_METADATA = Symbol('entityMetadata');

export interface EntityReference {
  Reference: Type<unknown>;
  nullable?: boolean;
  resolve?: boolean;
  partitionQueries?: boolean;
  resolvedName?: string;
  idName?: string;
}

export interface EntityMetadata {
  entityName?: string;
  entityDescription?: string;
  entityEnhancers?: string[];
  entityReferences?: EntityReference[];
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
    entityName: Entity.name,
    entityDescription: addSpaceToPascalCase(Entity.name),
    entityEnhancers: [],
    entityReferences: [],
    ...entityMetadata,
  };
};
