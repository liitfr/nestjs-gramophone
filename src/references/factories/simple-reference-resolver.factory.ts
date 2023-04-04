import { Type } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

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
  Service: Type<unknown>,
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

  const { referenceName, referenceDescription, ReferencePartitioner } =
    referenceMetadata;

  const pCPName = pascalCase(pluralize(referenceName));
  const findAllActiveQueryName = `findAllActive${pCPName}`;

  @Resolver(() => Reference)
  class SimpleReferenceResolver extends SimpleResolver {
    @Query(() => [Reference], {
      name: findAllActiveQueryName,
      nullable: false,
      description: `${referenceName} : Find all active query`,
    })
    async [findAllActiveQueryName]() {
      if (!this.simpleService[findAllActiveQueryName]) {
        throw new Error(
          'The service ' +
            serviceMetadata.serviceName +
            ' does not implement the method ' +
            findAllActiveQueryName,
        );
      }
      return this.simpleService[findAllActiveQueryName]();
    }
  }

  if (!options.noPartition) {
    Object.entries(ReferencePartitioner).forEach(([key]) => {
      const pCKey = pascalCase(key);
      const serviceMethodName = `find${pCKey}`;
      const queryName = `find${referenceName}${pCKey}`;

      Object.defineProperty(SimpleReferenceResolver.prototype, queryName, {
        value: async function () {
          if (!this.simpleService[serviceMethodName]) {
            throw new Error(
              `The service ${serviceMetadata.serviceName} does not implement the method ${serviceMethodName}`,
            );
          }
          return (await this.simpleService[serviceMethodName]?.())?.[0];
        },
        writable: true,
        enumerable: true,
        configurable: true,
      });

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
