import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResolveField } from '@nestjs/graphql';

import {
  ResolveFieldOptions,
  defaultResolveFieldOptions,
} from '../../utils/resolvers/options/resolve-field-options';
import { ResolverOptions } from '../../utils/resolvers/types/options.type';
import { Constructor } from '../../utils/types/constructor.type';
import { Id } from '../../utils/types/id.type';
import { IS_PUBLIC_KEY } from '../../authentication/decorators/public.decorator';
import { UserActionEnum } from '../../references/enums/user-action.enum';
import { SetUserAction } from '../../utils/resolvers/decorators/set-user-action.decorator';
import { ResolverOperationEnum } from '../../utils/resolvers/enums/resolver-operation.enum';
import { SetResolverOperation } from '../../utils/resolvers/decorators/set-resolver-operation.decorator';
import { CheckPolicies } from '../../authorization/decorators/check-policies.decorator';
import { SimplePoliciesGuard } from '../../authorization/guards/simple-policies.guard';

import { ReversedRelationResolverDecoratorParams } from '../types/reversed-relation-resolver-decorator-params.type';
import { RepositoryStore } from '../services/repository-store.service';

export type ReversedRelationResolveOptions = ResolveFieldOptions;

export function WithReversedRelationResolve<E extends object>({
  options: pOptions,
  reversedRelationsMetadata,
}: ReversedRelationResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    reversedRelationResolve:
      pOptions.reversedRelationResolve === false
        ? false
        : {
            ...defaultResolveFieldOptions,
            ...pOptions.reversedRelationResolve,
          },
  };

  const checkPolicies =
    options.reversedRelationResolve &&
    options.reversedRelationResolve?.checkPolicies !== null &&
    typeof options.reversedRelationResolve?.checkPolicies !== 'undefined'
      ? options.reversedRelationResolve?.checkPolicies
      : options.general?.defaultResolveFieldCheckPolicies !== null &&
        typeof options.general?.defaultResolveFieldCheckPolicies !== 'undefined'
      ? options.general?.defaultResolveFieldCheckPolicies
      : true;

  return <T extends Constructor>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.reversedRelationResolve === false ||
      !options.reversedRelationResolve?.enable
    ) {
      return constructor;
    }

    if (reversedRelationsMetadata) {
      for (const { details, sourceMetadata } of reversedRelationsMetadata) {
        const {
          idName,
          multiple,
          reversible,
          reversedResolvedName,
          reversedResolvedDescription,
          reverseResolve,
        } = details;

        if (reversible) {
          if (reverseResolve) {
            if (!reversedResolvedName) {
              throw new Error(
                'The reversed relation is resolved but reversedResolvedName is not defined.',
              );
            }

            const { entityToken: sourceToken, Entity: Source } = sourceMetadata;

            Object.defineProperty(constructor.prototype, reversedResolvedName, {
              value: async function (parent: E) {
                if (!parent['_id']) {
                  throw new Error(
                    'The parent object does not have the property _id',
                  );
                }

                const parentId = parent['_id'] as Id;

                if (multiple) {
                  return RepositoryStore.getInstanceByEntity(
                    sourceToken,
                  ).uncertainFind({
                    [idName]: { $in: parentId },
                  });
                }

                return RepositoryStore.getInstanceByEntity(
                  sourceToken,
                ).uncertainFind({
                  [idName]: parentId,
                });
              },
              writable: true,
              enumerable: true,
              configurable: true,
            });

            const descriptorReversedResolved = Object.getOwnPropertyDescriptor(
              constructor.prototype,
              reversedResolvedName,
            );

            if (!descriptorReversedResolved) {
              throw new Error(
                `The descriptor for the method ${reversedResolvedName} does not exist in the resolver ${constructor.name}`,
              );
            }

            ResolveField(() => [Source], {
              name: reversedResolvedName,
              description: reversedResolvedDescription,
            })(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            SetMetadata(
              IS_PUBLIC_KEY,
              (options.reversedRelationResolve &&
                options.reversedRelationResolve?.public) ??
                options.general?.defaultResolveFieldPublic ??
                false,
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            SetUserAction(UserActionEnum.Read)(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            SetResolverOperation(ResolverOperationEnum.ReversedRelationResolve)(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            CheckPolicies(
              ...(!checkPolicies
                ? [() => true]
                : options.reversedRelationResolve &&
                  options.reversedRelationResolve?.policyHandlers
                ? options.reversedRelationResolve.policyHandlers
                : [options.general?.readPolicyHandler ?? (() => false)]),
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            UseFilters(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.filters?.length
                ? options.reversedRelationResolve.filters
                : options.general?.defaultResolveFieldFilters ?? []),
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            UseInterceptors(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.interceptors?.length
                ? options.reversedRelationResolve.interceptors
                : options.general?.defaultResolveFieldInterceptors ?? []),
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );

            UseGuards(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.guards?.length
                ? options.reversedRelationResolve.guards
                : options.general?.defaultResolveFieldGuards ?? []),
              ...(checkPolicies ? [SimplePoliciesGuard] : []),
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved,
            );
          }
        }
      }
    }

    return constructor;
  };
}
