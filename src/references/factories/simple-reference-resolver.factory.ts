import { Type } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { SimpleService } from '../../utils/services/simple.service';
import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { getResolverMetadata } from '../../utils/resolvers/resolver.util';
import { getServiceMetadata } from '../../utils/services/service.util';
import { getReferenceMetadata } from '../../utils/references/reference.util';

interface Options {
  noMutation?: boolean;
  noPartition?: boolean;
}

const defaultOptions: Options = {
  noMutation: true,
  noPartition: true,
};

export function SimpleReferenceResolverFactory<D>(
  Reference: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<SimpleService<D>>,
  pOptions: Options = defaultOptions,
) {
  const options = { ...defaultOptions, ...pOptions };

  const SimpleResolver = SimpleResolverFactory<D>(
    Reference,
    Input,
    Service,
    options,
  );

  const referenceMetadata = getReferenceMetadata(Reference);
  const resolverMetadata = getResolverMetadata(SimpleResolver);
  const serviceMetadata = getServiceMetadata(Service);

  const { referenceName, referenceDescription, referencePartitioner } =
    referenceMetadata;

  const pCPName = pascalCase(pluralize(referenceName));
  const findAllQueryName = `findAllActive${pCPName}`;

  @Resolver(() => Reference)
  class SimpleReferenceResolver extends SimpleResolver {
    @Query(() => [Reference], {
      name: findAllQueryName,
      nullable: false,
      description: `${referenceName} : Find all active query`,
    })
    async [findAllQueryName]() {
      if (!this.simpleService[findAllQueryName]) {
        throw new Error(
          'The service ' +
            serviceMetadata.serviceName +
            ' does not implement the method ' +
            findAllQueryName,
        );
      }
      return this.simpleService[findAllQueryName]();
    }
  }

  Object.defineProperty(SimpleReferenceResolver, 'name', {
    value: resolverMetadata.resolverName,
  });

  if (!options.noPartition) {
    Object.entries(referencePartitioner).forEach(([key]) => {
      const pCKey = pascalCase(key);
      const serviceMethodName = `find${pCKey}`;
      const queryName = `find${referenceName}${pCKey}`;

      SimpleReferenceResolver.prototype[queryName] = async function () {
        if (!this.simpleService[serviceMethodName]) {
          throw new Error(
            'The service ' +
              serviceMetadata.serviceName +
              ' does not implement the method ' +
              serviceMethodName,
          );
        }
        return (await this.simpleService[serviceMethodName]?.())?.[0];
      };

      Query(() => Reference, {
        name: queryName,
        nullable: true,
        description: `${referenceDescription} : Find ${key} query`,
      })(
        SimpleReferenceResolver.prototype,
        queryName,
        Object.getOwnPropertyDescriptor(
          SimpleReferenceResolver.prototype,
          queryName,
        ),
      );
    });
  }

  return SimpleReferenceResolver;
}
