import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Int, Query } from '@nestjs/graphql';

import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { Constructor } from '../../utils/types/constructor.type';
import { pascalCase, pluralize } from '../../utils/string.util';
import {
  QueryOptions,
  defaultQueryOptions,
} from '../../utils/resolvers/options/query-options';
import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { ResolverOperationEnum } from '../../utils/resolvers/enums/resolver-operation.enum';
import { SetResolverOperation } from '../../utils/resolvers/decorators/set-resolver-operation.decorator';
import { SetUserAction } from '../../utils/resolvers/decorators/set-user-action.decorator';
import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';

import { RelationResolverDecoratorParams } from '../types/relation-resolver-decorator-params.type';
import { RepositoryStore } from '../services/repository-store.service';

export type RelationPartitionCountOptions = QueryOptions;

export function WithRelationPartitionCount<E extends object>({
  options: pOptions,
  relationsMetadata,
  sourceToken,
  sourceTokenDescription,
}: RelationResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
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

  return <T extends Constructor>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.relationPartitionCount === false ||
      !options.relationPartitionCount?.enable
    ) {
      return constructor;
    }

    if (relationsMetadata && relationsMetadata.length) {
      relationsMetadata.forEach(({ targetMetadata, details }) => {
        const { partitionQueries, idName, multiple } = details;

        if (!targetMetadata) {
          throw new Error(`Target metadata not found for ${idName}`);
        }

        const {
          entityToken: targetToken,
          entityDescription: targetDescription,
          EntityPartition: TargetPartition,
          entityPartitioner: targetPartitioner,
          entityRepositoryToken: targetRepositoryToken,
        } = targetMetadata;

        const relationTokenDescription = targetToken.description;

        if (!relationTokenDescription) {
          throw new Error(
            `Description not found for token ${sourceToken.toString()}`,
          );
        }

        if (!targetRepositoryToken) {
          throw new Error(
            `Repository token not found for entity ${relationTokenDescription}`,
          );
        }

        if (partitionQueries) {
          if (!TargetPartition || !targetPartitioner) {
            throw new Error(
              `The relation ${relationTokenDescription} does not have a partitioner`,
            );
          }

          const pCRelationName = pascalCase(relationTokenDescription);
          Object.entries(TargetPartition).forEach(([key]) => {
            const pCPartition = pascalCase(key);

            const resolverCountAllMethodName = `countAll${pascalCase(
              pluralize(sourceTokenDescription),
            )}With${pCPartition}${pCRelationName}`;

            Object.defineProperty(
              constructor.prototype,
              resolverCountAllMethodName,
              {
                value: async function () {
                  const partitionerId =
                    await RepositoryStore.getInstanceByEntity(
                      targetRepositoryToken,
                    ).find({
                      [targetPartitioner]: key,
                    })?.[0]?._id;
                  if (multiple) {
                    return RepositoryStore.getInstanceByEntity(
                      sourceToken,
                    ).count({ [idName]: { $in: [partitionerId] } });
                  }
                  return RepositoryStore.getInstanceByEntity(sourceToken).count(
                    {
                      [idName]: partitionerId,
                    },
                  );
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
              description: `${sourceTokenDescription} : Count all with ${pCPartition} ${targetDescription} query`,
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

            SetResolverOperation(ResolverOperationEnum.RelationPartitionCount)(
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
      });
    }

    return constructor;
  };
}
