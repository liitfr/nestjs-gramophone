import {
  Args,
  Resolver,
  Query,
  Mutation,
  InputType,
  PartialType,
  Int,
  ResolveField,
} from '@nestjs/graphql';
import { Inject, Type } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';

import { IdScalar } from '../scalars/id.scalar';
import { getEntityMetadata } from '../entities/entity.util';
import {
  camelCase,
  lowerCaseFirstLetter,
  pascalCase,
  pluralize,
} from '../string.util';
import { Id } from '../id.type';
import { AddTrackableCreationFields } from '../pipes/add-trackable-creation-fields.pipe';
import { AddTrackableUpdateFields } from '../pipes/add-trackable-update-fields.pipe';
import { getReferenceMetadata } from '../references/reference.util';
import { getServiceMetadata } from '../services/service.util';

interface Options {
  noMutation?: boolean;
}

const addReferenceResolvers = (
  Resolver: Type<unknown>,
  Entity: Type<unknown>,
) => {
  const { entityReferences, entityDescription, entityName } =
    getEntityMetadata(Entity);

  entityReferences.forEach((reference) => {
    const {
      Reference,
      idName,
      partitionQueries,
      resolve,
      resolvedName,
      resolvedDescription,
      nullable,
    } = reference;

    if (resolve || partitionQueries) {
      const {
        ReferencePartitioner,
        referenceName,
        referenceDescription,
        ReferenceService,
      } = getReferenceMetadata(Reference);
      if (!ReferenceService) {
        throw new Error(
          `The reference ${referenceName} does not have a service`,
        );
      }
      const { serviceName } = getServiceMetadata(ReferenceService);

      const referenceServicePropertyName = camelCase(serviceName);

      if (!Resolver[referenceServicePropertyName]) {
        Object.defineProperty(
          Resolver.prototype,
          referenceServicePropertyName,
          {
            value: null,
            writable: true,
            enumerable: true,
            configurable: true,
          },
        );

        const referenceServiceInjector = Inject(ReferenceService.name);
        referenceServiceInjector(
          Resolver.prototype,
          referenceServicePropertyName,
        );
      }

      if (resolve) {
        Object.defineProperty(Resolver.prototype, resolvedName, {
          value: async function (parent: unknown) {
            if (!parent[idName]) {
              throw new Error(
                'The parent object does not have the property ' + idName,
              );
            }
            const id = parent?.[idName];
            return this[referenceServicePropertyName].findById(id);
          },
          writable: true,
          enumerable: true,
          configurable: true,
        });
        ResolveField(() => Reference, {
          name: resolvedName,
          nullable,
          description: `${entityDescription}'s ${lowerCaseFirstLetter(
            resolvedDescription,
          )}`,
        })(
          Resolver.prototype,
          resolvedName,
          Object.getOwnPropertyDescriptor(Resolver.prototype, resolvedName),
        );
      }

      if (partitionQueries) {
        const pCReferenceName = pascalCase(referenceName);
        Object.entries(ReferencePartitioner).forEach(([key]) => {
          const pCPartitioner = pascalCase(key);
          const resolverFindAllMethodName = `findAll${pascalCase(
            pluralize(entityName),
          )}With${pCPartitioner}${pCReferenceName}`;
          const serviceFindAllMethodName = `findAllWith${pCPartitioner}${pCReferenceName}`;

          Object.defineProperty(Resolver.prototype, resolverFindAllMethodName, {
            value: async function () {
              if (!this.simpleService[serviceFindAllMethodName]) {
                throw new Error(
                  `The method ${serviceFindAllMethodName} does not exist in the service ${serviceName}`,
                );
              }
              return this.simpleService[serviceFindAllMethodName]();
            },
            writable: true,
            enumerable: true,
            configurable: true,
          });

          Query(() => [Entity], {
            nullable: false,
            description: `${entityDescription}: Find all with ${pCPartitioner} ${referenceDescription} query`,
            name: resolverFindAllMethodName,
          })(
            Resolver.prototype,
            resolverFindAllMethodName,
            Object.getOwnPropertyDescriptor(
              Resolver.prototype,
              resolverFindAllMethodName,
            ),
          );

          const resolverCountAllMethodName = `countAll${pascalCase(
            pluralize(entityName),
          )}With${pCPartitioner}${pCReferenceName}`;
          const serviceCountAllMethodName = `countAllWith${pCPartitioner}${pCReferenceName}`;

          Object.defineProperty(
            Resolver.prototype,
            resolverCountAllMethodName,
            {
              value: async function () {
                if (!this.simpleService[serviceCountAllMethodName]) {
                  throw new Error(
                    `The method ${serviceCountAllMethodName} does not exist in the service ${serviceName}`,
                  );
                }
                return this.simpleService[serviceCountAllMethodName]();
              },
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          Query(() => Int, {
            nullable: false,
            description: `${entityDescription} : Count all with ${pCPartitioner} ${referenceDescription} query`,
            name: resolverCountAllMethodName,
          })(
            Resolver.prototype,
            resolverCountAllMethodName,
            Object.getOwnPropertyDescriptor(
              Resolver.prototype,
              resolverCountAllMethodName,
            ),
          );
        });
      }
    }
  });
};

export function SimpleResolverFactory<D>(
  Entity: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<unknown>,
  options: Options = {
    noMutation: false,
  },
) {
  const { entityName, entityDescription } = getEntityMetadata(Entity);

  const setResolverName = (Resolver: Type<unknown>) =>
    Object.defineProperty(Resolver, 'name', {
      value: `${pascalCase(pluralize(entityName))}Resolver`,
      writable: true,
      enumerable: true,
      configurable: true,
    });

  @InputType(`${entityName}PartialInput`)
  class PartialInput extends PartialType(Input) {}

  @Resolver(() => Entity)
  class ResolverWithAutoGetters {
    @Inject(Service)
    readonly simpleService: Repository<D>;

    @Query(() => Entity, {
      nullable: false,
      description: `${entityDescription} : Find one query`,
      name: `findOne${pascalCase(entityName)}`,
    })
    async findOne(@Args('id', { type: () => IdScalar }) id: Id): Promise<D> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find all query`,
      name: `findAll${pluralize(pascalCase(entityName))}`,
    })
    async findAll(): Promise<D[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find some query`,
      name: `findSome${pluralize(pascalCase(entityName))}`,
    })
    async findSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<D[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count all query`,
      name: `countAll${pluralize(pascalCase(entityName))}`,
    })
    async countAll(): Promise<number> {
      return this.simpleService.countAll();
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count some query`,
      name: `countSome${pluralize(pascalCase(entityName))}`,
    })
    async countSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<number> {
      return this.simpleService.count(filter);
    }
  }

  if (!options.noMutation) {
    @Resolver(() => Entity)
    class ResolverWithAutoSetters extends ResolverWithAutoGetters {
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Create mutation`,
        name: `create${pascalCase(entityName)}`,
      })
      async create(
        @Args(
          camelCase(entityName),
          {
            type: () => Input,
          },
          AddTrackableCreationFields,
        )
        doc: typeof Input,
      ) {
        return this.simpleService.create(doc);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update one mutation`,
        name: `updateOne${pascalCase(entityName)}`,
      })
      async updateOne(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.updateOne(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(pascalCase(entityName))}`,
      })
      async updateMany(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.updateMany(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one and update mutation`,
        name: `findOneAndUpdate${pascalCase(entityName)}`,
      })
      async findOneAndUpdte(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args('update', { type: () => PartialInput }, AddTrackableUpdateFields)
        update: PartialInput,
      ) {
        return this.simpleService.findOneAndUpdate(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Remove mutation`,
        name: `remove${pluralize(pascalCase(entityName))}`,
      })
      async remove(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
      ) {
        return this.simpleService.remove(filter);
      }
    }

    setResolverName(ResolverWithAutoSetters);
    addReferenceResolvers(ResolverWithAutoSetters, Entity);
    return ResolverWithAutoSetters;
  }

  setResolverName(ResolverWithAutoGetters);
  addReferenceResolvers(ResolverWithAutoGetters, Entity);
  return ResolverWithAutoGetters;
}
