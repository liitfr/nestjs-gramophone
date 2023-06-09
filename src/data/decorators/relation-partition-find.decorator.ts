import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import {
  QueryOptions,
  defaultQueryOptions,
} from '../../utils/resolvers/options/query-options';
import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { Constructor } from '../../utils/types/constructor.type';
import { pascalCase, pluralize } from '../../utils/utils/string.util';
import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';
import { SetUserAction } from '../../utils/resolvers/decorators/set-user-action.decorator';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { SetResolverOperation } from '../../utils/resolvers/decorators/set-resolver-operation.decorator';
import { ResolverOperationEnum } from '../../utils/resolvers/enums/resolver-operation.enum';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';

import { RelationResolverDecoratorParams } from '../types/relation-resolver-decorator-params.type';
import { RepositoryStore } from '../services/repository-store.service';

export type RelationPartitionFindOptions = QueryOptions;

export function WithRelationPartitionFind<E extends object>({
  Source,
  options: pOptions,
  sourceToken,
  relationsMetadata,
  sourceTokenDescription,
}: RelationResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    relationPartitionFind:
      pOptions.relationPartitionFind === false
        ? false
        : {
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

  return <T extends Constructor>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.relationPartitionFind === false ||
      !options.relationPartitionFind?.enable
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

            const resolverFindAllMethodName = `findAll${pascalCase(
              pluralize(sourceTokenDescription),
            )}With${pCPartition}${pCRelationName}`;

            Object.defineProperty(
              constructor.prototype,
              resolverFindAllMethodName,
              {
                value: async function () {
                  const partitionerId =
                    await RepositoryStore.getInstanceByEntity(
                      targetRepositoryToken,
                    ).find({
                      filter: {
                        [targetPartitioner]: key,
                      },
                    })?.[0]?._id;
                  if (multiple) {
                    return RepositoryStore.getInstanceByEntity(
                      sourceToken,
                    ).find({ filter: { [idName]: { $in: [partitionerId] } } });
                  }
                  return RepositoryStore.getInstanceByEntity(sourceToken).find({
                    filter: {
                      [idName]: partitionerId,
                    },
                  });
                },
                writable: true,
                enumerable: true,
                configurable: true,
              },
            );

            const descriptorFindAllMethodName = Object.getOwnPropertyDescriptor(
              constructor.prototype,
              resolverFindAllMethodName,
            );

            if (!descriptorFindAllMethodName) {
              throw new Error(
                `The method ${resolverFindAllMethodName} does not exist in the resolver ${constructor.name}`,
              );
            }

            Query(() => [Source], {
              nullable: false,
              description: `${sourceTokenDescription}: Find all with ${pCPartition} ${targetDescription} query`,
              name: resolverFindAllMethodName,
            })(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            SetMetadata(
              IS_PUBLIC_KEY,
              (options.relationPartitionFind &&
                options.relationPartitionFind?.public) ??
                options.general?.defaultQueryPublic ??
                false,
            )(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            SetUserAction(UserActionEnum.Read)(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            SetResolverOperation(ResolverOperationEnum.RelationPartitionFind)(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            CheckPolicies(
              ...(!checkPolicies
                ? [() => true]
                : options.relationPartitionFind &&
                  options.relationPartitionFind?.policyHandlers
                ? options.relationPartitionFind.policyHandlers
                : [options.general?.readPolicyHandler ?? (() => false)]),
            )(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            UseFilters(
              ...(options.relationPartitionFind &&
              options.relationPartitionFind?.filters?.length
                ? options.relationPartitionFind.filters
                : options.general?.defaultQueryFilters ?? []),
            )(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            UseInterceptors(
              ...(options.relationPartitionFind &&
              options.relationPartitionFind?.interceptors?.length
                ? options.relationPartitionFind.interceptors
                : options.general?.defaultQueryInterceptors ?? []),
            )(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );

            UseGuards(
              ...(options.relationPartitionFind &&
              options.relationPartitionFind?.guards?.length
                ? options.relationPartitionFind.guards
                : options.general?.defaultQueryGuards ?? []),
              ...(checkPolicies ? [SimplePoliciesGuard] : []),
            )(
              constructor.prototype,
              resolverFindAllMethodName,
              descriptorFindAllMethodName,
            );
          });
        }
      });
    }

    return constructor;
  };
}
