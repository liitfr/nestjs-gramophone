import { Type, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';
import { pascalCase, pluralize } from '../../utils/string.util';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { ServiceStore } from '../../utils/services/service-store.service';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { AppAbility } from '../../authorization/factories/casl-ability.factory';
import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';
import { SimpleServiceObj } from '../../utils/services/simple-service.factory';
import { SimpleInput } from '../../utils/dtos/simple-entity-input.factory';

import { UserActionEnum } from '../enums/user-action.enum';

type ReferenceOptions<E extends object> = ResolverOptions<E> & {
  reference: { noPartition?: boolean };
};

const defaultOptions = {
  general: {
    enableMutations: false,
  },
  reference: {
    noPartition: true,
  },
};

export function SimpleReferenceResolverFactory<
  R extends object,
  S extends SimpleServiceObj<R>,
>(
  Reference: Type<R>,
  Input: SimpleInput<R>,
  Service: Type<S>,
  pOptions: ReferenceOptions<R> = defaultOptions,
) {
  const options = { ...defaultOptions, ...pOptions };

  const SimpleResolver = SimpleResolverFactory<R, S>(
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
      `Description not found for token ${referenceToken.toString()}`,
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
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Reference),
    )
    async [findAllActiveQueryName]() {
      if (!this.simpleService[findAllActiveQueryName]) {
        throw new Error(
          `The service ${serviceMetadata.serviceToken.description} does not implement the method ${findAllActiveQueryName}`,
        );
      }
      return this.simpleService[findAllActiveQueryName]();
    }
  }

  if (!options.reference.noPartition) {
    if (!ReferencePartition || !referencePartitioner) {
      throw new Error(
        `Can't partition query since partition or partitioner is missing for ${referenceTokenDescription}`,
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

      CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Read, Reference),
      )(SimpleReferenceResolver.prototype, queryName, descriptor);

      UseGuards(SimplePoliciesGuard)(
        SimpleReferenceResolver.prototype,
        queryName,
        descriptor,
      );

      Query(() => Reference, {
        name: queryName,
        nullable: true,
        description: `${referenceDescription} : Find ${key} query`,
      })(SimpleReferenceResolver.prototype, queryName, descriptor);
    });
  }

  return SimpleReferenceResolver;
}
