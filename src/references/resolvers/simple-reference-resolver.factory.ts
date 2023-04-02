import { Type } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { SimpleService } from '../../utils/services/simple.service';
import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { getEntityMetadata } from '../../utils/entities/entity.util';
import { pascalCase, pluralize } from '../../utils/string.util';
import { getResolverMetadata } from '../../utils/resolvers/resolver.util';
import { getServiceMetadata } from '../../utils/services/service.util';

interface Options {
  noMutation?: boolean;
}

export function SimpleReferenceResolverFactory<D>(
  Entity: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<SimpleService<D>>,
  options: Options = {
    noMutation: true,
  },
) {
  const SimpleResolver = SimpleResolverFactory<D>(
    Entity,
    Input,
    Service,
    options,
  );

  const entityMetadata = getEntityMetadata(Entity);
  const resolverMetadata = getResolverMetadata(SimpleResolver);
  const serviceMetadata = getServiceMetadata(Service);

  const queryName = `getAllActive${pascalCase(
    pluralize(entityMetadata.entityName),
  )}`;

  @Resolver(() => Entity)
  class SimpleReferenceResolver extends SimpleResolver {
    @Query(() => [Entity], { name: queryName })
    async [queryName]() {
      if (!this.simpleService[queryName]) {
        throw new Error(
          'The service ' +
            serviceMetadata.serviceName +
            ' does not implement the method ' +
            queryName,
        );
      }
      return this.simpleService[queryName]();
    }
  }

  Object.defineProperty(SimpleReferenceResolver, 'name', {
    value: resolverMetadata.resolverName,
  });

  return SimpleReferenceResolver;
}
