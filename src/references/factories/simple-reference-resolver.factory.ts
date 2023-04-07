import { Type } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { getServiceMetadata } from '../../utils/services/service.util';
import { getEntityMetadata } from '../../utils/entities/entity.util';
import { Repository } from '../../data/abstracts/repository.abstract';

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

  const referenceMetadata = getEntityMetadata(Reference);
  const serviceMetadata = getServiceMetadata(Service);

  const {
    entityToken: referenceToken,
    entityDescription: referenceDescription,
    entityPartitioner: referencePartitioner,
    EntityPartition: ReferencePartition,
  } = referenceMetadata;

  const pCPName = pluralize(pascalCase(referenceToken.description));
  const findAllActiveQueryName = `findAllActive${pCPName}`;

  @Resolver(() => Reference)
  class SimpleReferenceResolver extends SimpleResolver {
    @Query(() => [Reference], {
      name: findAllActiveQueryName,
      nullable: false,
      description: `${referenceToken.description} : Find all active query`,
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
          referenceToken.description,
      );
    }

    Object.entries(ReferencePartition).forEach(([key]) => {
      const pCKey = pascalCase(key);
      const serviceMethodName = `find${pCKey}`;
      const queryName = `find${referenceToken.description}${pCKey}`;

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
