import { Type } from '@nestjs/common';
import { addSpaceToPascalCase } from '../string.util';

export const ENTITY_METADATA = Symbol('entityMetadata');

export interface EntityMetadata {
  entityName?: string;
  entityDescription?: string;
  entityEnhancers?: string[];
}

export const enhancerCheckerFactory =
  <E>(enhancerName: string) =>
  (classRef: Type): classRef is Type<E> => {
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA, classRef);

    const { entityEnhancers } = entityMetadata;

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

export const isEntityDecorated = (classRef: Type): boolean =>
  !!Reflect.getMetadata(ENTITY_METADATA, classRef);

export const getEntityMetadata = (classRef: Type): EntityMetadata => {
  const entityMetadata = Reflect.getMetadata(ENTITY_METADATA, classRef);
  return {
    entityName: classRef.name,
    entityDescription: addSpaceToPascalCase(classRef.name),
    entityEnhancers: [],
    ...entityMetadata,
  };
};
