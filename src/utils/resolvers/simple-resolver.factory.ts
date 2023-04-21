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
import { Inject, Logger, PipeTransform, Type, UseGuards } from '@nestjs/common';

import { CheckRelations } from '../../data/pipes/check-relations.pipe';
import { CurrentUserId } from '../../users/decorators/current-user-id.decorator';
import { RepositoryStore } from '../../data/services/repository-store.service';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { AppAbility } from '../../authorization/factories/casl-ability.factory';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';

import { IdScalar } from '../scalars/id.scalar';
import { camelCase, pascalCase, pluralize } from '../string.util';
import { Id } from '../id.type';
import { checkIfIsTrackable } from '../entities/simple-entity.decorator';
import { EntityStore } from '../entities/entity-store.service';
import {
  SimpleService,
  SimpleServiceObj,
} from '../services/simple-service.factory';
import { SimpleInput } from '../dtos/simple-entity-input.factory';

interface Options<E> {
  noMutation?: boolean;
  FindSomeFilterType?: Type<Partial<E>>;
  findSomeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  CountSomeFilterType?: Type<Partial<E>>;
  countSomeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  CreateType?: Type<Partial<E>>;
  createPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateOneFilterType?: Type<Partial<E>>;
  updateOneFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateOneUpdateType?: Type<Partial<E>>;
  updateOneUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateManyFilterType?: Type<Partial<E>>;
  updateManyFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  UpdateManyUpdateType?: Type<Partial<E>>;
  updateManyUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  FindOneAndUpdateFilterType?: Type<Partial<E>>;
  findOneAndUpdateFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
  FindOneAndUpdateUpdateType?: Type<Partial<E>>;
  findOneAndUpdateUpdatePipes?: (Type<PipeTransform> | PipeTransform)[];
  RemoveFilterType?: Type<Partial<E>>;
  removeFilterPipes?: (Type<PipeTransform> | PipeTransform)[];
}

const addRelationResolvers = <R, E>(Resolver: Type<R>, Entity: Type<E>) => {
  const metadata = EntityStore.get(Entity);

  const { entityRelations, entityToken } = metadata;

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      `Description not found for token ${entityToken.toString()}`,
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

      const targetMetadata = details.weak
        ? EntityStore.uncertainGet(target)
        : EntityStore.get(target);

      if (resolve || partitionQueries) {
        if (!targetMetadata) {
          throw new Error(
            `The target ${target.toString()} of weak relation isn't registered in the EntityStore. Thus, you have to disable resolve or partition queries settings.`,
          );
        }

        const {
          Entity: Relation,
          entityToken: relationToken,
          entityDescription: relationDescription,
          EntityPartition: RelationPartition,
          entityPartitioner: relationPartitioner,
        } = targetMetadata;

        const relationTokenDescription = relationToken.description;

        if (!relationTokenDescription) {
          throw new Error(
            `Description not found for token ${entityToken.toString()}`,
          );
        }

        if (resolve) {
          Object.defineProperty(Resolver.prototype, resolvedName, {
            value: async function (parent: E) {
              if (parent[idName]) {
                const parentId = parent['idName'] as Id;
                if (multiple) {
                  return RepositoryStore.getByEntity(relationToken).find({
                    _id: { $in: parentId ?? [] },
                  });
                }
                return RepositoryStore.getByEntity(relationToken).findById(
                  parentId,
                );
              }
              return undefined;
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
              `The relation ${relationTokenDescription} does not have a partitioner`,
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
                      `The method ${serviceFindAllMethodName} does not exist in the ${entityTokenDescription} related service`,
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
              description: `${entityTokenDescription}: Find all with ${pCPartition} ${relationDescription} query`,
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
                      `The method ${serviceCountAllMethodName} does not exist in the ${entityTokenDescription} related service`,
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
              description: `${entityTokenDescription} : Count all with ${pCPartition} ${relationDescription} query`,
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

const addReversedRelationResolvers = <R, E>(
  Resolver: Type<R>,
  Entity: Type<E>,
) => {
  const metadata = EntityStore.get(Entity);

  const { entityToken } = metadata;

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      `Description not found for token ${entityToken.toString()}`,
    );
  }

  const reversedRelationMetadatas =
    EntityStore.getReversedRelationMetadata(entityToken);

  if (reversedRelationMetadatas) {
    for (const { details, sourceMetadata } of reversedRelationMetadatas) {
      const {
        idName,
        multiple,
        reversible,
        reversedResolvedName,
        reversedResolvedDescription,
        reversedIdName,
        reversedIdDescription,
        reverseResolve,
      } = details;

      if (reversible) {
        if (!reversedIdName) {
          throw new Error(
            'The relation is reversible but reversedIdName is not defined.',
          );
        }

        Object.defineProperty(Resolver.prototype, reversedIdName, {
          value: async function (parent: E) {
            if (!parent['_id']) {
              throw new Error(
                'The parent object does not have the property _id',
              );
            }

            const parentId = parent['_id'] as Id;

            if (multiple) {
              return (
                await RepositoryStore.getByEntity(
                  sourceMetadata.entityToken,
                ).uncertainFind({
                  [idName]: { $in: parentId },
                })
              ).map((item: Record<string, unknown>) => {
                if (!item['_id']) {
                  throw new Error('The item does not have the property _id');
                }
                return item['_id'];
              });
            }

            return (
              await RepositoryStore.getByEntity(
                sourceMetadata.entityToken,
              ).uncertainFind({
                [idName]: parentId,
              })
            ).map((item: Record<string, unknown>) => {
              if (!item['_id']) {
                throw new Error('The item does not have the property _id');
              }
              return item['_id'];
            });
          },
          writable: true,
          enumerable: true,
          configurable: true,
        });

        const descriptorReversedId = Object.getOwnPropertyDescriptor(
          Resolver.prototype,
          reversedIdName,
        );

        if (!descriptorReversedId) {
          throw new Error(
            `The descriptor for the method ${reversedIdName} does not exist in the resolver ${Resolver.name}`,
          );
        }

        ResolveField(() => [IdScalar], {
          name: reversedIdName,
          description: reversedIdDescription,
        })(Resolver.prototype, reversedIdName, descriptorReversedId);

        if (reverseResolve) {
          if (!reversedResolvedName) {
            throw new Error(
              'The reversed relation is resolved but reversedResolvedName is not defined.',
            );
          }

          Object.defineProperty(Resolver.prototype, reversedResolvedName, {
            value: async function (parent: E) {
              if (!parent['_id']) {
                throw new Error(
                  'The parent object does not have the property _id',
                );
              }

              const parentId = parent['_id'] as Id;

              if (multiple) {
                return RepositoryStore.getByEntity(
                  sourceMetadata.entityToken,
                ).uncertainFind({
                  [idName]: { $in: parentId },
                });
              }

              return RepositoryStore.getByEntity(
                sourceMetadata.entityToken,
              ).uncertainFind({
                [idName]: parentId,
              });
            },
            writable: true,
            enumerable: true,
            configurable: true,
          });

          const descriptorReversedResolved = Object.getOwnPropertyDescriptor(
            Resolver.prototype,
            reversedResolvedName,
          );

          if (!descriptorReversedResolved) {
            throw new Error(
              `The descriptor for the method ${reversedResolvedName} does not exist in the resolver ${Resolver.name}`,
            );
          }

          ResolveField(() => [sourceMetadata.Entity], {
            name: reversedResolvedName,
            description: reversedResolvedDescription,
          })(
            Resolver.prototype,
            reversedResolvedName,
            descriptorReversedResolved,
          );
        }
      }
    }
  }
};

export function SimpleResolverFactory<
  E extends object,
  S extends SimpleServiceObj<E>,
>(
  Entity: Type<E>,
  Input: Type<unknown>, // BUG : somehow it should depend on E if only i could generate correct type for inputs
  Service: SimpleService<E>,
  options?: Options<E>,
) {
  const { entityToken, entityDescription, entityRelations } =
    EntityStore.get(Entity);

  const entityTokenDescription = entityToken.description;

  if (!entityTokenDescription) {
    throw new Error(
      `Description not found for token ${entityToken.toString()}`,
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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PartialInput extends SimpleInput<E> {}

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
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    )
    async findOne(
      @Args('id', { type: () => IdScalar }) id: Id,
    ): Promise<E | null> {
      return this.simpleService.findById(id);
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find all query`,
      name: `findAll${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    )
    async findAll(): Promise<E[]> {
      return this.simpleService.findAll();
    }

    @Query(() => [Entity], {
      nullable: false,
      description: `${entityDescription} : Find some query`,
      name: `findSome${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    )
    async findSome(
      @Args(
        'filter',
        { type: () => FindSomeFilterType },
        ...findSomeFilterPipes,
      )
      filter: InstanceType<typeof FindSomeFilterType>,
    ): Promise<E[]> {
      return this.simpleService.find(filter);
    }

    @Query(() => Int, {
      nullable: false,
      description: `${entityDescription} : Count all query`,
      name: `countAll${pluralize(
        pascalCase(entityTokenDescription ?? 'unknown'),
      )}`,
    })
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    )
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
    @UseGuards(SimplePoliciesGuard)
    @CheckPolicies((ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    )
    async countSome(
      @Args(
        'filter',
        { type: () => CountSomeFilterType },
        ...countSomeFilterPipes,
      )
      filter: InstanceType<typeof CountSomeFilterType>,
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
      @UseGuards(SimplePoliciesGuard)
      @CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Create, Entity),
      )
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
        doc: InstanceType<typeof CreateType>,
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
      @UseGuards(SimplePoliciesGuard)
      @CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Update, Entity),
      )
      async updateOne(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => UpdateOneFilterType },
          ...updateOneFilterPipes,
        )
        filter: InstanceType<typeof UpdateOneFilterType>,
        @Args(
          'update',
          { type: () => UpdateOneUpdateType },
          ...updateOneUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: InstanceType<typeof UpdateOneUpdateType>,
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
      @UseGuards(SimplePoliciesGuard)
      @CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Update, Entity),
      )
      async updateMany(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => UpdateManyFilterType },
          ...updateManyFilterPipes,
        )
        filter: InstanceType<typeof UpdateManyFilterType>,
        @Args(
          'update',
          { type: () => UpdateManyUpdateType },
          ...updateManyUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: InstanceType<typeof UpdateManyUpdateType>,
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
      @UseGuards(SimplePoliciesGuard)
      @CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Update, Entity),
      )
      async findOneAndUpdate(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => FindOneAndUpdateFilterType },
          ...findOneAndUpdateFilterPipes,
        )
        filter: InstanceType<typeof FindOneAndUpdateFilterType>,
        @Args(
          'update',
          { type: () => FindOneAndUpdateUpdateType },
          ...findOneAndUpdateUpdatePipes,
          ...(hasRelations ? [CheckEntityRelations] : []),
        )
        update: InstanceType<typeof FindOneAndUpdateUpdateType>,
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
      @UseGuards(SimplePoliciesGuard)
      @CheckPolicies((ability: AppAbility) =>
        ability.can(UserActionEnum.Remove, Entity),
      )
      async remove(
        @Args('filter', { type: () => RemoveFilterType }, ...removeFilterPipes)
        filter: InstanceType<typeof RemoveFilterType>,
      ) {
        return this.simpleService.remove(filter);
      }
    }

    addRelationResolvers(ResolverWithAutoSetters, Entity);
    addReversedRelationResolvers(ResolverWithAutoSetters, Entity);
    return ResolverWithAutoSetters;
  }

  addRelationResolvers(ResolverWithAutoGetters, Entity);
  addReversedRelationResolvers(ResolverWithAutoGetters, Entity);
  return ResolverWithAutoGetters;
}
