import { Type } from '@nestjs/common';
import { addSpaceToPascalCase } from '../string.util';

export const RESOLVER_METADATA = Symbol('resolverMetadata');

export interface ResolverMetadata {
  resolverName?: string;
  resolverDescription?: string;
}

export const isResolverDecorated = (classRef: Type): boolean =>
  !!Reflect.getMetadata(RESOLVER_METADATA, classRef);

export const getResolverMetadata = (classRef: Type): ResolverMetadata => {
  const resolverMetadata = Reflect.getMetadata(RESOLVER_METADATA, classRef);
  return {
    resolverName: classRef.name,
    resolverDescription: addSpaceToPascalCase(classRef.name),
    ...resolverMetadata,
  };
};
