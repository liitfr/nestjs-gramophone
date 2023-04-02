import { Type } from '@nestjs/common';
import { addSpaceToPascalCase } from '../string.util';

export const RESOLVER_METADATA = Symbol('resolverMetadata');

export interface ResolverMetadata {
  resolverName?: string;
  resolverDescription?: string;
}

export const isResolverDecorated = (Resolver: Type): boolean =>
  !!Reflect.getMetadata(RESOLVER_METADATA, Resolver);

export const getResolverMetadata = (Resolver: Type): ResolverMetadata => {
  const resolverMetadata = Reflect.getMetadata(RESOLVER_METADATA, Resolver);
  return {
    resolverName: Resolver.name,
    resolverDescription: addSpaceToPascalCase(Resolver.name),
    ...resolverMetadata,
  };
};
