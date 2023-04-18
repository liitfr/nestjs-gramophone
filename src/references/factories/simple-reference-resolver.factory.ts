import { Type } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { Repository } from '../../data/abstracts/repository.abstract';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { ServiceStore } from '../../utils/services/service-store.service';

interface Options {
  noMutation?: boolean;
  noPartition?: boolean;
}

const defaultOptions: Options = {
  noMutation: true,
  noPartition: true,
};

export function SimpleReferenceResolverFactory<D, S extends Repository<D>>(
  Reference: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<S>,
  pOptions: Options = defaultOptions,
) {
  const options = { ...defaultOptions, ...pOptions };

  const SimpleResolver = SimpleResolverFactory<D, S>(
    Reference,
    Input,
    Service,
    options,
  );

  const referenceMetadata = EntityStore.get(Reference);
  const serviceMetadata = ServiceStore.get(Service);

  const {
    entityToken: referenceToken,
    entityDescription: referenceDescription,
    entityPartitioner: referencePartitioner,
    EntityPartition: ReferencePartition,
  } = referenceMetadata;

  const referenceTokenDescription = referenceToken.description;

  if (!referenceTokenDescription) {
    throw new Error(
      'Description not found for token ' + referenceToken.toString(),
    );
  }

  const pCPName = pluralize(pascalCase(referenceTokenDescription));
  const findAllActiveQueryName = `findAllActive${pCPName}`;

  @Resolver(() => Reference)
  class SimpleReferenceResolver extends SimpleResolver {
    @Query(() => [Reference], {
      name: findAllActiveQueryName,
      nullable: false,
      description: `${referenceTokenDescription} : Find all active query`,
    })
    async [findAllActiveQueryName]() {
      if (!this.simpleService[findAllActiveQueryName]) {
        throw new Error(
          'The service ' +
            serviceMetadata.serviceToken.description +
            ' does not implement the method ' +
            findAllActiveQueryName,
        );
      }
      return this.simpleService[findAllActiveQueryName]();
    }
  }

  if (!options.noPartition) {
    if (!ReferencePartition || !referencePartitioner) {
      throw new Error(
        "Can't partition query since partition or partitioner is missing for " +
          referenceTokenDescription,
      );
    }

    Object.entries(ReferencePartition).forEach(([key]) => {
      const pCKey = pascalCase(key);
      const serviceMethodName = `find${pCKey}`;
      const queryName = `find${referenceTokenDescription}${pCKey}`;

      Object.defineProperty(SimpleReferenceResolver.prototype, queryName, {
        value: async function () {
          if (!this.simpleService[serviceMethodName]) {
            throw new Error(
              `The service ${serviceMetadata.serviceToken.description} does not implement the method ${serviceMethodName}`,
            );
          }
          return (await this.simpleService[serviceMethodName]?.())?.[0];
        },
        writable: true,
        enumerable: true,
        configurable: true,
      });

      const descriptor = Object.getOwnPropertyDescriptor(
        SimpleReferenceResolver.prototype,
        queryName,
      );

      if (!descriptor) {
        throw new Error('Descriptor not found.');
      }

      Query(() => Reference, {
        name: queryName,
        nullable: true,
        description: `${referenceDescription} : Find ${key} query`,
      })(SimpleReferenceResolver.prototype, queryName, descriptor);
    });
  }

  return SimpleReferenceResolver;
}
