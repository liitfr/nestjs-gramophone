import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';
import { EntityStore } from '../../entities/entity-store.service';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type RelationPartitionFindOptions = QueryOptions;

export function WithRelationPartitionFind<E extends object>({
  Entity,
  options: pOptions,
  entityToken,
  entityRelations,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    relationPartitionFind: {
      ...defaultQueryOptions,
      ...pOptions.relationPartitionFind,
    },
  };

  const checkPolicies =
    options.relationPartitionFind &&
    options.relationPartitionFind?.checkPolicies !== null &&
    typeof options.relationPartitionFind?.checkPolicies !== 'undefined'
      ? options.relationPartitionFind?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.relationPartitionFind === false ||
      !options.relationPartitionFind?.enable
    ) {
      return constructor;
    }

    if (entityRelations && entityRelations.length) {
      entityRelations.forEach(({ target, details }) => {
        const { partitionQueries, resolve } = details;

        const targetMetadata = details.weak
          ? EntityStore.uncertainGet(target)
          : EntityStore.get(target);

        if (resolve || partitionQueries) {
          if (!targetMetadata) {
            throw new Error(
              `The target ${target.toString()} of weak relation isn't registered in the EntityStore. Thus, you have to disable resolve or partition queries settings.`
            );
          }

          const {
            entityToken: relationToken,
            entityDescription: relationDescription,
            EntityPartition: RelationPartition,
            entityPartitioner: relationPartitioner,
          } = targetMetadata;

          const relationTokenDescription = relationToken.description;

          if (!relationTokenDescription) {
            throw new Error(
              `Description not found for token ${entityToken.toString()}`
            );
          }

          if (partitionQueries) {
            if (!RelationPartition || !relationPartitioner) {
              throw new Error(
                `The relation ${relationTokenDescription} does not have a partitioner`
              );
            }

            const pCRelationName = pascalCase(relationTokenDescription);
            Object.entries(RelationPartition).forEach(([key]) => {
              const pCPartition = pascalCase(key);
              const resolverFindAllMethodName = `findAll${pascalCase(
                pluralize(entityTokenDescription)
              )}With${pCPartition}${pCRelationName}`;
              const serviceFindAllMethodName = `findAllWith${pCPartition}${pCRelationName}`;

              Object.defineProperty(
                constructor.prototype,
                resolverFindAllMethodName,
                {
                  value: async function () {
                    if (!this.simpleService[serviceFindAllMethodName]) {
                      throw new Error(
                        `The method ${serviceFindAllMethodName} does not exist in the ${entityTokenDescription} related service`
                      );
                    }
                    return this.simpleService[serviceFindAllMethodName]();
                  },
                  writable: true,
                  enumerable: true,
                  configurable: true,
                }
              );

              const descriptorFindAllMethodName =
                Object.getOwnPropertyDescriptor(
                  constructor.prototype,
                  resolverFindAllMethodName
                );

              if (!descriptorFindAllMethodName) {
                throw new Error(
                  `The method ${resolverFindAllMethodName} does not exist in the resolver ${constructor.name}`
                );
              }

              Query(() => [Entity], {
                nullable: false,
                description: `${entityTokenDescription}: Find all with ${pCPartition} ${relationDescription} query`,
                name: resolverFindAllMethodName,
              })(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );

              SetMetadata(
                IS_PUBLIC_KEY,
                (options.relationPartitionFind &&
                  options.relationPartitionFind?.public) ??
                  options.general?.defaultQueryPublic ??
                  false
              )(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );

              CheckPolicies(
                ...(!checkPolicies
                  ? [() => true]
                  : options.relationPartitionFind &&
                    options.relationPartitionFind?.policyHandlers
                  ? options.relationPartitionFind.policyHandlers
                  : [options.general?.readPolicyHandler ?? (() => false)])
              )(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );

              UseFilters(
                ...(options.relationPartitionFind &&
                options.relationPartitionFind?.filters?.length
                  ? options.relationPartitionFind.filters
                  : options.general?.defaultQueryFilters ?? [])
              )(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );

              UseInterceptors(
                ...(options.relationPartitionFind &&
                options.relationPartitionFind?.interceptors?.length
                  ? options.relationPartitionFind.interceptors
                  : options.general?.defaultQueryInterceptors ?? [])
              )(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );

              UseGuards(
                ...(options.relationPartitionFind &&
                options.relationPartitionFind?.guards?.length
                  ? options.relationPartitionFind.guards
                  : options.general?.defaultQueryGuards ?? []),
                ...(checkPolicies ? [SimplePoliciesGuard] : [])
              )(
                constructor.prototype,
                resolverFindAllMethodName,
                descriptorFindAllMethodName
              );
            });
          }
        }
      });
    }

    return constructor;
  };
}
