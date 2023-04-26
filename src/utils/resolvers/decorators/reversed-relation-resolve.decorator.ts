import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResolveField, Resolver } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { RepositoryStore } from '../../../data/services/repository-store.service';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { Id } from '../../types/id.type';
import { EntityStore } from '../../entities/entity-store.service';

import {
  ResolveFieldOptions,
  defaultResolveFieldOptions,
} from '../options/resolve-field-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type ReversedRelationResolveOptions = ResolveFieldOptions;

export function WithReversedRelationResolve<E extends object>({
  options: pOptions,
  entityToken,
  Entity,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    reversedRelationResolve: {
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

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.reversedRelationResolve === false ||
      !options.reversedRelationResolve?.enable
    ) {
      return constructor;
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
          reverseResolve,
        } = details;

        if (reversible) {
          if (reverseResolve) {
            if (!reversedResolvedName) {
              throw new Error(
                'The reversed relation is resolved but reversedResolvedName is not defined.'
              );
            }

            Object.defineProperty(constructor.prototype, reversedResolvedName, {
              value: async function (parent: E) {
                if (!parent['_id']) {
                  throw new Error(
                    'The parent object does not have the property _id'
                  );
                }

                const parentId = parent['_id'] as Id;

                if (multiple) {
                  return RepositoryStore.getInstanceByEntity(
                    sourceMetadata.entityToken
                  ).uncertainFind({
                    [idName]: { $in: parentId },
                  });
                }

                return RepositoryStore.getInstanceByEntity(
                  sourceMetadata.entityToken
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
              reversedResolvedName
            );

            if (!descriptorReversedResolved) {
              throw new Error(
                `The descriptor for the method ${reversedResolvedName} does not exist in the resolver ${constructor.name}`
              );
            }

            // HACK : we can only use ResolveField in a class that is decorated with @Resolver
            Resolver(() => Entity)(constructor);

            ResolveField(() => [sourceMetadata.Entity], {
              name: reversedResolvedName,
              description: reversedResolvedDescription,
            })(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            SetMetadata(
              IS_PUBLIC_KEY,
              (options.reversedRelationResolve &&
                options.reversedRelationResolve?.public) ??
                options.general?.defaultResolveFieldPublic ??
                false
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            SetUserAction(UserActionEnum.Read)(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            SetResolverOperation(ResolverOperationEnum.ReversedRelationResolve)(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            CheckPolicies(
              ...(!checkPolicies
                ? [() => true]
                : options.reversedRelationResolve &&
                  options.reversedRelationResolve?.policyHandlers
                ? options.reversedRelationResolve.policyHandlers
                : [options.general?.readPolicyHandler ?? (() => false)])
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            UseFilters(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.filters?.length
                ? options.reversedRelationResolve.filters
                : options.general?.defaultResolveFieldFilters ?? [])
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            UseInterceptors(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.interceptors?.length
                ? options.reversedRelationResolve.interceptors
                : options.general?.defaultResolveFieldInterceptors ?? [])
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );

            UseGuards(
              ...(options.reversedRelationResolve &&
              options.reversedRelationResolve?.guards?.length
                ? options.reversedRelationResolve.guards
                : options.general?.defaultResolveFieldGuards ?? []),
              ...(checkPolicies ? [SimplePoliciesGuard] : [])
            )(
              constructor.prototype,
              reversedResolvedName,
              descriptorReversedResolved
            );
          }
        }
      }
    }

    return constructor;
  };
}
