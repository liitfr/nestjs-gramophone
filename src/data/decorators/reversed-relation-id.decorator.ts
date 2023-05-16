import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResolveField } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { Constructor } from '../../utils/types/constructor.type';
import { Id } from '../../utils/types/id.type';
import { IdScalar } from '../../utils/scalars/id.scalar';
import {
  ResolveFieldOptions,
  defaultResolveFieldOptions,
} from '../../utils/resolvers/options/resolve-field-options';
import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { ResolverOperationEnum } from '../../utils/resolvers/enums/resolver-operation.enum';
import { SetResolverOperation } from '../../utils/resolvers/decorators/set-resolver-operation.decorator';
import { SetUserAction } from '../../utils/resolvers/decorators/set-user-action.decorator';

import { ReversedRelationResolverDecoratorParams } from '../types/reversed-relation-resolver-decorator-params.type';
import { RepositoryStore } from '../services/repository-store.service';

export type ReversedRelationIdOptions = ResolveFieldOptions;

export function WithReversedRelationId<E extends object>({
  options: pOptions,
  reversedRelationsMetadata,
}: ReversedRelationResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    reversedRelationId:
      pOptions.reversedRelationId === false
        ? false
        : {
            ...defaultResolveFieldOptions,
            ...pOptions.reversedRelationId,
          },
  };

  const checkPolicies =
    options.reversedRelationId &&
    options.reversedRelationId?.checkPolicies !== null &&
    typeof options.reversedRelationId?.checkPolicies !== 'undefined'
      ? options.reversedRelationId?.checkPolicies
      : options.general?.defaultResolveFieldCheckPolicies !== null &&
        typeof options.general?.defaultResolveFieldCheckPolicies !== 'undefined'
      ? options.general?.defaultResolveFieldCheckPolicies
      : true;

  return <T extends Constructor>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.reversedRelationId === false ||
      !options.reversedRelationId?.enable
    ) {
      return constructor;
    }

    if (reversedRelationsMetadata) {
      for (const { details, sourceMetadata } of reversedRelationsMetadata) {
        const {
          idName,
          multiple,
          reversible,
          reversedIdName,
          reversedIdDescription,
        } = details;

        if (reversible) {
          if (!reversedIdName) {
            throw new Error(
              'The relation is reversible but reversedIdName is not defined.',
            );
          }

          const { entityToken: sourceToken } = sourceMetadata;

          Object.defineProperty(constructor.prototype, reversedIdName, {
            value: async function (parent: E) {
              if (!parent['_id']) {
                throw new Error(
                  'The parent object does not have the property _id',
                );
              }

              const parentId = parent['_id'] as Id;

              if (multiple) {
                return (
                  await RepositoryStore.getInstanceByEntity(
                    sourceToken,
                  ).uncertainFind({
                    filter: {
                      [idName]: { $in: parentId },
                    },
                  })
                ).map((item: Record<string, unknown>) => {
                  if (!item['_id']) {
                    throw new Error('The item does not have the property _id');
                  }
                  return item['_id'];
                });
              }

              return (
                await RepositoryStore.getInstanceByEntity(
                  sourceToken,
                ).uncertainFind({
                  filter: {
                    [idName]: parentId,
                  },
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
            constructor.prototype,
            reversedIdName,
          );

          if (!descriptorReversedId) {
            throw new Error(
              `The descriptor for the method ${reversedIdName} does not exist in the resolver ${constructor.name}`,
            );
          }

          ResolveField(() => [IdScalar], {
            name: reversedIdName,
            description: reversedIdDescription,
          })(constructor.prototype, reversedIdName, descriptorReversedId);

          SetMetadata(
            IS_PUBLIC_KEY,
            (options.reversedRelationId &&
              options.reversedRelationId?.public) ??
              options.general?.defaultResolveFieldPublic ??
              false,
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          SetUserAction(UserActionEnum.Read)(
            constructor.prototype,
            reversedIdName,
            descriptorReversedId,
          );

          SetResolverOperation(ResolverOperationEnum.ReversedRelationId)(
            constructor.prototype,
            reversedIdName,
            descriptorReversedId,
          );

          CheckPolicies(
            ...(!checkPolicies
              ? [() => true]
              : options.reversedRelationId &&
                options.reversedRelationId?.policyHandlers
              ? options.reversedRelationId.policyHandlers
              : [options.general?.readPolicyHandler ?? (() => false)]),
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseFilters(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.filters?.length
              ? options.reversedRelationId.filters
              : options.general?.defaultResolveFieldFilters ?? []),
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseInterceptors(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.interceptors?.length
              ? options.reversedRelationId.interceptors
              : options.general?.defaultResolveFieldInterceptors ?? []),
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseGuards(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.guards?.length
              ? options.reversedRelationId.guards
              : options.general?.defaultResolveFieldGuards ?? []),
            ...(checkPolicies ? [SimplePoliciesGuard] : []),
          )(constructor.prototype, reversedIdName, descriptorReversedId);
        }
      }
    }

    return constructor;
  };
}
