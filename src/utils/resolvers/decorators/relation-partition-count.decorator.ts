import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Int, Query } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { EntityStore } from '../../entities/entity-store.service';
import { pascalCase, pluralize } from '../../string.util';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type RelationPartitionCountOptions = QueryOptions;

export function WithRelationPartitionCount<E extends object>({
  options: pOptions,
  entityRelations,
  entityToken,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    relationPartitionCount: {
      ...defaultQueryOptions,
      ...pOptions.relationPartitionCount,
    },
  };

  const checkPolicies =
    options.relationPartitionCount &&
    options.relationPartitionCount?.checkPolicies !== null &&
    typeof options.relationPartitionCount?.checkPolicies !== 'undefined'
      ? options.relationPartitionCount?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.relationPartitionCount === false ||
      !options.relationPartitionCount?.enable
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
              `The target ${target.toString()} of weak relation isn't registered in the EntityStore. Thus, you have to disable resolve or partition queries settings.`,
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
              `Description not found for token ${entityToken.toString()}`,
            );
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

              const resolverCountAllMethodName = `countAll${pascalCase(
                pluralize(entityTokenDescription),
              )}With${pCPartition}${pCRelationName}`;
              const serviceCountAllMethodName = `countAllWith${pCPartition}${pCRelationName}`;

              Object.defineProperty(
                constructor.prototype,
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
                  constructor.prototype,
                  resolverCountAllMethodName,
                );

              if (!descriptorCountAllMethodName) {
                throw new Error(
                  `The method ${resolverCountAllMethodName} does not exist in the resolver ${constructor.name}`,
                );
              }

              Query(() => Int, {
                nullable: false,
                description: `${entityTokenDescription} : Count all with ${pCPartition} ${relationDescription} query`,
                name: resolverCountAllMethodName,
              })(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              SetMetadata(
                IS_PUBLIC_KEY,
                (options.relationPartitionCount &&
                  options.relationPartitionCount?.public) ??
                  options.general?.defaultQueryPublic ??
                  false,
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              SetUserAction(UserActionEnum.Read)(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              SetResolverOperation(
                ResolverOperationEnum.RelationPartitionCount,
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              CheckPolicies(
                ...(!checkPolicies
                  ? [() => true]
                  : options.relationPartitionCount &&
                    options.relationPartitionCount?.policyHandlers
                  ? options.relationPartitionCount.policyHandlers
                  : [options.general?.readPolicyHandler ?? (() => false)]),
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              UseFilters(
                ...(options.relationPartitionCount &&
                options.relationPartitionCount?.filters?.length
                  ? options.relationPartitionCount.filters
                  : options.general?.defaultQueryFilters ?? []),
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              UseInterceptors(
                ...(options.relationPartitionCount &&
                options.relationPartitionCount?.interceptors?.length
                  ? options.relationPartitionCount.interceptors
                  : options.general?.defaultQueryInterceptors ?? []),
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );

              UseGuards(
                ...(options.relationPartitionCount &&
                options.relationPartitionCount?.guards?.length
                  ? options.relationPartitionCount.guards
                  : options.general?.defaultQueryGuards ?? []),
                ...(checkPolicies ? [SimplePoliciesGuard] : []),
              )(
                constructor.prototype,
                resolverCountAllMethodName,
                descriptorCountAllMethodName,
              );
            });
          }
        }
      });
    }

    return constructor;
  };
}
