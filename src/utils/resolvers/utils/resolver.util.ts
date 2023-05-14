import { Type } from '@nestjs/common';

import { splitPascalWithSpaces } from '../../utils/string.util';

export const RESOLVER_METADATA: unique symbol = Symbol('resolverMetadata');

export interface ResolverMetadata {
  resolverName?: string;
  resolverDescription?: string;
}

export const isResolverDecorated = (Resolver: Type<unknown>): boolean =>
  !!Reflect.getMetadata(RESOLVER_METADATA, Resolver);

export const getResolverMetadata = (
  Resolver: Type<unknown>,
): ResolverMetadata => {
  const resolverMetadata = Reflect.getMetadata(RESOLVER_METADATA, Resolver);
  return {
    resolverName: Resolver.name,
    resolverDescription: splitPascalWithSpaces(Resolver.name),
    ...resolverMetadata,
  };
};
