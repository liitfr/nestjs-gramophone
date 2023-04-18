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
import { Inject, Logger, PipeTransform, Type } from '@nestjs/common';

import { Repository } from '../../data/abstracts/repository.abstract';
import { CheckRelations } from '../../data/pipes/check-relations.pipe';
import { CurrentUserId } from '../../users/decorators/current-user-id.decorator';

import { IdScalar } from '../scalars/id.scalar';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { Id } from '../id.type';
import { checkIfIsTrackable } from '../entities/simple-entity.decorator';
import { EntityStore } from '../entities/entity-store.service';

interface Options {
  noMutation?: boolean;
  FindSomeFilterType?: Type<unknown>;
  findSomeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  CountSomeFilterType?: Type<unknown>;
  countSomeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  CreateType?: Type<unknown>;
  createPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateOneFilterType?: Type<unknown>;
  updateOneFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateOneUpdateType?: Type<unknown>;
  updateOneUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateManyFilterType?: Type<unknown>;
  updateManyFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateManyUpdateType?: Type<unknown>;
  updateManyUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  FindOneAndUpdateFilterType?: Type<unknown>;
  findOneAndUpdateFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  FindOneAndUpdateUpdateType?: Type<unknown>;
  findOneAndUpdateUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  RemoveFilterType?: Type<unknown>;
  removeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
}

const addRelationResolvers = (
  Resolver: Type<unknown>,
  Entity: Type<unknown>,
) => {
  const metadata = EntityStore.get(Entity);

  const { entityRelations, entityDescription, entityToken } = metadata;

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      'Description not found for token ' + entityToken.toString(),
    );
  }

  if (entityRelations && entityRelations.length) {
    entityRelations.forEach(({ target, details }) => {
      const {
        idName,
        partitionQueries,
        resolve,
        resolvedName,
        resolvedDescription,
        nullable,
        multiple,
      } = details;

      if (resolve || partitionQueries) {
        const targetMetadata = EntityStore.get(target);

        const {
          Entity: Relation,
          entityToken: relationToken,
          entityDescription: relationDescription,
          EntityPartition: RelationPartition,
          entityPartitioner: relationPartitioner,
          entityServiceToken: relationServiceToken,
        } = targetMetadata;

        const relationTokenDescription = relationToken.description;

        if (!relationTokenDescription) {
          throw new Error(
            'Description not found for token ' + entityToken.toString(),
          );
        }

        if (!relationServiceToken) {
          throw new Error(
            `The entity ${relationTokenDescription} does not have a service`,
          );
        }

        const relationServicePropertyName = camelCase(
          relationServiceToken.description,
        ) as keyof typeof Resolver;

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
            value: async function (parent: Record<string, unknown>) {
              if (!parent[idName]) {
                throw new Error(
                  'The parent object does not have the property ' + idName,
                );
              }
              if (multiple) {
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

          const descriptorResolveField = Object.getOwnPropertyDescriptor(
            Resolver.prototype,
            resolvedName,
          );

          if (!descriptorResolveField) {
            throw new Error(
              `The descriptor for the method ${resolvedName} does not exist in the resolver ${Resolver.name}`,
            );
          }

          ResolveField(() => (multiple ? [Relation] : Relation), {
            name: resolvedName,
            nullable,
            description: resolvedDescription,
          })(Resolver.prototype, resolvedName, descriptorResolveField);
        }

        if (partitionQueries) {
          if (!RelationPartition || !relationPartitioner) {
            throw new Error(
              `The entity ${relationServiceToken.description} does not have a partitioner`,
            );
          }

          const pCRelationName = pascalCase(relationTokenDescription);
          Object.entries(RelationPartition).forEach(([key]) => {
            const pCPartition = pascalCase(key);
            const resolverFindAllMethodName = `findAll${pascalCase(
              pluralize(entityTokenDescription),
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

            const descriptorFindAllMethodName = Object.getOwnPropertyDescriptor(
              Resolver.prototype,
              resolverFindAllMethodName,
            );

            if (!descriptorFindAllMethodName) {
              throw new Error(
                `The method ${resolverFindAllMethodName} does not exist in the resolver ${Resolver.name}`,
              );
            }

            Query(() => [Entity], {
              nullable: false,
              description: `${entityDescription}: Find all with ${pCPartition} ${relationDescription} query`,
              name: resolverFindAllMethodName,
            })(
              Resolver.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            const resolverCountAllMethodName = `countAll${pascalCase(
              pluralize(entityTokenDescription),
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

            const descriptorCountAllMethodName =
              Object.getOwnPropertyDescriptor(
                Resolver.prototype,
                resolverCountAllMethodName,
              );

            if (!descriptorCountAllMethodName) {
              throw new Error(
                `The method ${resolverCountAllMethodName} does not exist in the resolver ${Resolver.name}`,
              );
            }

            Query(() => Int, {
              nullable: false,
              description: `${entityDescription} : Count all with ${pCPartition} ${relationDescription} query`,
              name: resolverCountAllMethodName,
            })(
              Resolver.prototype,
              resolverCountAllMethodName,
              descriptorCountAllMethodName,
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
  options?: Options,
) {
  const { entityToken, entityDescription, entityRelations } =
    EntityStore.get(Entity);

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      'Description not found for token ' + entityToken.toString(),
    );
  }

  Logger.verbose(
    `SimpleResolver for ${entityTokenDescription}`,
    'SimpleResolverFactory',
  );

  const isTrackable = checkIfIsTrackable(Entity);

  const hasRelations = entityRelations && entityRelations?.length > 0;

  @InputType(`${entityTokenDescription}PartialInput`)
  class PartialInput extends PartialType(Input) {}

  const {
    noMutation,
    FindSomeFilterType,
    findSomeFilterPipes,
    CountSomeFilterType,
    countSomeFilterPipes,
    CreateType,
    createPipes,
    UpdateOneFilterType,
    updateOneFilterPipes,
    UpdateOneUpdateType,
    updateOneUpdatePipes,
    UpdateManyFilterType,
    updateManyFilterPipes,
    UpdateManyUpdateType,
    updateManyUpdatePipes,
    FindOneAndUpdateFilterType,
    findOneAndUpdateFilterPipes,
    FindOneAndUpdateUpdateType,
    findOneAndUpdateUpdatePipes,
    RemoveFilterType,
    removeFilterPipes,
  } = Object.assign(
    {},
    {
      noMutation: false,
      FindSomeFilterType: PartialInput,
      findSomeFilterPipes: [],
      CountSomeFilterType: PartialInput,
      countSomeFilterPipes: [],
      CreateType: Input,
      createPipes: [],
      UpdateOneFilterType: PartialInput,
      updateOneFilterPipes: [],
      UpdateOneUpdateType: PartialInput,
      updateOneUpdatePipes: [],
      UpdateManyFilterType: PartialInput,
      updateManyFilterPipes: [],
      UpdateManyUpdateType: PartialInput,
      updateManyUpdatePipes: [],
      FindOneAndUpdateFilterType: PartialInput,
      findOneAndUpdateFilterPipes: [],
      FindOneAndUpdateUpdateType: PartialInput,
      findOneAndUpdateUpdatePipes: [],
      RemoveFilterType: PartialInput,
      removeFilterPipes: [],
    },
    options,
  );

  @Resolver(() => Entity)
  class ResolverWithAutoGetters {
    @Inject(Service)
    readonly simpleService!: S;

    @Query(() => Entity, {
      nullable: false,
      description: `${entityDescription} : Find one query`,
      name: `findOne${pascalCase(entityTokenDescription ?? 'unknown')}`,
    })
    async findOne(
      @Args('id', { type: () => IdScalar }) id: Id,
    ): Promise<D | null> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find all query`,
      name: `findAll${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    async findAll(): Promise<D[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find some query`,
      name: `findSome${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    async findSome(
      @Args(
        'filter',
        { type: () => FindSomeFilterType },
        ...findSomeFilterPipes,
      )
      filter: typeof FindSomeFilterType,
    ): Promise<D[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count all query`,
      name: `countAll${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    async countAll(): Promise<number> {
      return this.simpleService.countAll();
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count some query`,
      name: `countSome${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    async countSome(
      @Args(
        'filter',
        { type: () => CountSomeFilterType },
        ...countSomeFilterPipes,
      )
      filter: typeof CountSomeFilterType,
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
        name: `create${pascalCase(entityTokenDescription ?? 'unknown')}`,
      })
      async create(
        @CurrentUserId() userId: Id,
        @Args(
          camelCase(entityTokenDescription ?? 'unknown'),
          {
            type: () => CreateType,
          },
          ...createPipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        doc: typeof CreateType,
      ) {
        return this.simpleService.create({
          ...doc,
          ...(isTrackable
            ? {
                creatorId: userId,
                createdAt: new Date(),
                updaterId: userId,
                updatedAt: new Date(),
              }
            : {}),
        });
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update one mutation`,
        name: `updateOne${pascalCase(entityTokenDescription ?? 'unknown')}`,
      })
      async updateOne(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => UpdateOneFilterType },
          ...updateOneFilterPipes,
        )
        filter: typeof UpdateOneFilterType,
        @Args(
          'update',
          { type: () => UpdateOneUpdateType },
          ...updateOneUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: typeof UpdateOneUpdateType,
      ) {
        return this.simpleService.updateOne(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async updateMany(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => UpdateManyFilterType },
          ...updateManyFilterPipes,
        )
        filter: typeof UpdateManyFilterType,
        @Args(
          'update',
          { type: () => UpdateManyUpdateType },
          ...updateManyUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: typeof UpdateManyUpdateType,
      ) {
        return this.simpleService.updateMany(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one and update mutation`,
        name: `findOneAndUpdate${pascalCase(
          entityTokenDescription ?? 'unknown',
        )}`,
      })
      async findOneAndUpdte(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => FindOneAndUpdateFilterType },
          ...findOneAndUpdateFilterPipes,
        )
        filter: typeof FindOneAndUpdateFilterType,
        @Args(
          'update',
          { type: () => FindOneAndUpdateUpdateType },
          ...findOneAndUpdateUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: typeof FindOneAndUpdateUpdateType,
      ) {
        return this.simpleService.findOneAndUpdate(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }

      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Remove mutation`,
        name: `remove${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async remove(
        @Args('filter', { type: () => RemoveFilterType }, ...removeFilterPipes)
        filter: typeof RemoveFilterType,
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
