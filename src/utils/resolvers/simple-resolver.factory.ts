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
import { Inject, Logger, Type } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';
import { CheckRelations } from '../../data/pipes/check-relations.pipe';

import { IdScalar } from '../scalars/id.scalar';
import { getEntityMetadata } from '../entities/entity.util';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { Id } from '../id.type';
import { AddTrackableCreationFields } from '../pipes/add-trackable-creation-fields.pipe';
import { AddTrackableUpdateFields } from '../pipes/add-trackable-update-fields.pipe';

interface Options {
  noMutation?: boolean;
}

const addRelationResolvers = (
  Resolver: Type<unknown>,
  Entity: Type<unknown>,
) => {
  const { entityRelations, entityDescription, entityToken } =
    getEntityMetadata(Entity);

  if (entityRelations && entityRelations.length) {
    entityRelations.forEach((relation) => {
      const {
        Relation,
        idName,
        partitionQueries,
        resolve,
        resolvedName,
        resolvedDescription,
        nullable,
      } = relation;

      if (resolve || partitionQueries) {
        const {
          entityToken: relationToken,
          entityDescription: relationDescription,
          EntityPartition: RelationPartition,
          entityPartitioner: RelationPartitioner,
          entityServiceToken: relationServiceToken,
        } = getEntityMetadata(Relation);

        if (!relationServiceToken) {
          throw new Error(
            `The entity ${relationToken.description} does not have a service`,
          );
        }

        const relationServicePropertyName = camelCase(
          relationServiceToken.description,
        );

        if (!Resolver[relationServicePropertyName]) {
          Object.defineProperty(
            Resolver.prototype,
            relationServicePropertyName,
            {
              writable: true,
              enumerable: true,
              configurable: true,
            },
          );

          const relationServiceInjector = Inject(relationServiceToken);
          relationServiceInjector(
            Resolver.prototype,
            relationServicePropertyName,
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
              if (relation.multiple) {
                return this[relationServicePropertyName].find({
                  _id: { $in: parent?.[idName] ?? [] },
                });
              }
              return this[relationServicePropertyName].findById(
                parent?.[idName],
              );
            },
            writable: true,
            enumerable: true,
            configurable: true,
          });

          ResolveField(() => (relation.multiple ? [Relation] : Relation), {
            name: resolvedName,
            nullable,
            description: resolvedDescription,
          })(
            Resolver.prototype,
            resolvedName,
            Object.getOwnPropertyDescriptor(Resolver.prototype, resolvedName),
          );
        }

        if (partitionQueries) {
          if (!RelationPartition || !RelationPartitioner) {
            throw new Error(
              `The entity ${relationServiceToken.description} does not have a partitioner`,
            );
          }

          const pCRelationName = pascalCase(relationToken.description);
          Object.entries(RelationPartition).forEach(([key]) => {
            const pCPartition = pascalCase(key);
            const resolverFindAllMethodName = `findAll${pascalCase(
              pluralize(entityToken.description),
            )}With${pCPartition}${pCRelationName}`;
            const serviceFindAllMethodName = `findAllWith${pCPartition}${pCRelationName}`;

            Object.defineProperty(
              Resolver.prototype,
              resolverFindAllMethodName,
              {
                value: async function () {
                  if (!this.simpleService[serviceFindAllMethodName]) {
                    throw new Error(
                      `The method ${serviceFindAllMethodName} does not exist in the service ${relationServiceToken.description}`,
                    );
                  }
                  return this.simpleService[serviceFindAllMethodName]();
                },
                writable: true,
                enumerable: true,
                configurable: true,
              },
            );

            Query(() => [Entity], {
              nullable: false,
              description: `${entityDescription}: Find all with ${pCPartition} ${relationDescription} query`,
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
              pluralize(entityToken.description),
            )}With${pCPartition}${pCRelationName}`;
            const serviceCountAllMethodName = `countAllWith${pCPartition}${pCRelationName}`;

            Object.defineProperty(
              Resolver.prototype,
              resolverCountAllMethodName,
              {
                value: async function () {
                  if (!this.simpleService[serviceCountAllMethodName]) {
                    throw new Error(
                      `The method ${serviceCountAllMethodName} does not exist in the service ${relationServiceToken.description}`,
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
              description: `${entityDescription} : Count all with ${pCPartition} ${relationDescription} query`,
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
  }
};

export function SimpleResolverFactory<D, S extends Repository<D>>(
  Entity: Type<unknown>,
  Input: Type<unknown>,
  Service: Type<S>,
  { noMutation = false }: Options = {
    noMutation: false,
  },
) {
  const { entityToken, entityDescription } = getEntityMetadata(Entity);

  Logger.verbose(
    `SimpleResolver for ${entityToken.description}`,
    'SimpleResolverFactory',
  );

  // MHO : can't make it work ...  2 issues :
  // 1. ExpectedType isn't respected by class-transformer
  // 2. It looks like this validation generates new Ids ?! instead of ids received
  // So I disabled it for now and use a "CheckRelations" pipe
  // If you want to try, I kept rules IdExistsRule & IdsExistRule in codebase
  // and then use these decorators in createProp in AddRelations
  // class InputValidation extends ValidationPipe {
  //   constructor() {
  //     super({
  //       whitelist: true,
  //       forbidNonWhitelisted: true,
  //       forbidUnknownValues: true,
  //       transform: false,
  //       // transform: true,
  //       // expectedType: Input,
  //     });
  //   }
  // }

  @InputType(`${entityToken.description}PartialInput`)
  class PartialInput extends PartialType(Input) {}

  @Resolver(() => Entity)
  class ResolverWithAutoGetters {
    @Inject(Service)
    readonly simpleService: S;

    @Query(() => Entity, {
      nullable: false,
      description: `${entityDescription} : Find one query`,
      name: `findOne${pascalCase(entityToken.description)}`,
    })
    async findOne(@Args('id', { type: () => IdScalar }) id: Id): Promise<D> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find all query`,
      name: `findAll${pluralize(pascalCase(entityToken.description))}`,
    })
    async findAll(): Promise<D[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find some query`,
      name: `findSome${pluralize(pascalCase(entityToken.description))}`,
    })
    async findSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<D[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count all query`,
      name: `countAll${pluralize(pascalCase(entityToken.description))}`,
    })
    async countAll(): Promise<number> {
      return this.simpleService.countAll();
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count some query`,
      name: `countSome${pluralize(pascalCase(entityToken.description))}`,
    })
    async countSome(
      @Args('filter', { type: () => PartialInput }) filter: PartialInput,
    ): Promise<number> {
      return this.simpleService.count(filter);
    }
  }

  if (!noMutation) {
    const CheckEntityRelations = new CheckRelations(Entity);

    @Resolver(() => Entity)
    class ResolverWithAutoSetters extends ResolverWithAutoGetters {
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Create mutation`,
        name: `create${pascalCase(entityToken.description)}`,
      })
      async create(
        @Args(
          camelCase(entityToken.description),
          {
            type: () => Input,
          },
          CheckEntityRelations,
          AddTrackableCreationFields,
        )
        doc: typeof Input,
      ) {
        return this.simpleService.create(doc);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update one mutation`,
        name: `updateOne${pascalCase(entityToken.description)}`,
      })
      async updateOne(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args(
          'update',
          { type: () => PartialInput },
          CheckEntityRelations,
          AddTrackableUpdateFields,
        )
        update: PartialInput,
      ) {
        return this.simpleService.updateOne(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(pascalCase(entityToken.description))}`,
      })
      async updateMany(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args(
          'update',
          { type: () => PartialInput },
          CheckEntityRelations,
          AddTrackableUpdateFields,
        )
        update: PartialInput,
      ) {
        return this.simpleService.updateMany(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one and update mutation`,
        name: `findOneAndUpdate${pascalCase(entityToken.description)}`,
      })
      async findOneAndUpdte(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
        @Args(
          'update',
          { type: () => PartialInput },
          CheckEntityRelations,
          AddTrackableUpdateFields,
        )
        update: PartialInput,
      ) {
        return this.simpleService.findOneAndUpdate(filter, update);
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Remove mutation`,
        name: `remove${pluralize(pascalCase(entityToken.description))}`,
      })
      async remove(
        @Args('filter', { type: () => PartialInput }) filter: PartialInput,
      ) {
        return this.simpleService.remove(filter);
      }
    }

    addRelationResolvers(ResolverWithAutoSetters, Entity);
    return ResolverWithAutoSetters;
  }

  addRelationResolvers(ResolverWithAutoGetters, Entity);
  return ResolverWithAutoGetters;
}
