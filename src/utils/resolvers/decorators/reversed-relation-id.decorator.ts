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

import { Constructor } from '../../types/constructor.type';
import { Id } from '../../types/id.type';
import { IdScalar } from '../../scalars/id.scalar';
import { EntityStore } from '../../entities/entity-store.service';

import {
  ResolveFieldOptions,
  defaultResolveFieldOptions,
} from '../options/resolve-field-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type ReversedRelationIdOptions = ResolveFieldOptions;

export function WithReversedRelationId<E extends object>({
  options: pOptions,
  entityToken,
  Entity,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    reversedRelationId: {
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

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.reversedRelationId === false ||
      !options.reversedRelationId?.enable
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
          reversedIdName,
          reversedIdDescription,
        } = details;

        if (reversible) {
          if (!reversedIdName) {
            throw new Error(
              'The relation is reversible but reversedIdName is not defined.'
            );
          }

          Object.defineProperty(constructor.prototype, reversedIdName, {
            value: async function (parent: E) {
              if (!parent['_id']) {
                throw new Error(
                  'The parent object does not have the property _id'
                );
              }

              const parentId = parent['_id'] as Id;

              if (multiple) {
                return (
                  await RepositoryStore.getByEntity(
                    sourceMetadata.entityToken
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
                  sourceMetadata.entityToken
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
            constructor.prototype,
            reversedIdName
          );

          if (!descriptorReversedId) {
            throw new Error(
              `The descriptor for the method ${reversedIdName} does not exist in the resolver ${constructor.name}`
            );
          }

          // HACK : we can only use ResolveField in a class that is decorated with @Resolver
          Resolver(() => Entity)(constructor);

          ResolveField(() => [IdScalar], {
            name: reversedIdName,
            description: reversedIdDescription,
          })(constructor.prototype, reversedIdName, descriptorReversedId);

          SetMetadata(
            IS_PUBLIC_KEY,
            (options.reversedRelationId &&
              options.reversedRelationId?.public) ??
              options.general?.defaultResolveFieldPublic ??
              false
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          CheckPolicies(
            ...(!checkPolicies
              ? [() => true]
              : options.reversedRelationId &&
                options.reversedRelationId?.policyHandlers
              ? options.reversedRelationId.policyHandlers
              : [options.general?.readPolicyHandler ?? (() => false)])
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseFilters(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.filters?.length
              ? options.reversedRelationId.filters
              : options.general?.defaultResolveFieldFilters ?? [])
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseInterceptors(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.interceptors?.length
              ? options.reversedRelationId.interceptors
              : options.general?.defaultResolveFieldInterceptors ?? [])
          )(constructor.prototype, reversedIdName, descriptorReversedId);

          UseGuards(
            ...(options.reversedRelationId &&
            options.reversedRelationId?.guards?.length
              ? options.reversedRelationId.guards
              : options.general?.defaultResolveFieldGuards ?? []),
            ...(checkPolicies ? [SimplePoliciesGuard] : [])
          )(constructor.prototype, reversedIdName, descriptorReversedId);
        }
      }
    }

    return constructor;
  };
}
