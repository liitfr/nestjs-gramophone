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

import { RelationResolverDecoratorParams } from '../types/relation-resolver-decorator-params.type';
import { RepositoryStore } from '../services/repository-store.service';

export type RelationResolveOptions = ResolveFieldOptions;

export function WithRelationResolve<E extends object>({
  options: pOptions,
  sourceToken,
  relationsMetadata,
}: RelationResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    relationResolve:
      pOptions.relationResolve === false
        ? false
        : {
            ...defaultResolveFieldOptions,
            ...pOptions.relationResolve,
          },
  };

  const checkPolicies =
    options.relationResolve &&
    options.relationResolve?.checkPolicies !== null &&
    typeof options.relationResolve?.checkPolicies !== 'undefined'
      ? options.relationResolve?.checkPolicies
      : options.general?.defaultResolveFieldCheckPolicies !== null &&
        typeof options.general?.defaultResolveFieldCheckPolicies !== 'undefined'
      ? options.general?.defaultResolveFieldCheckPolicies
      : true;

  return <T extends Constructor>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.relationResolve === false ||
      !options.relationResolve?.enable
    ) {
      return constructor;
    }

    if (relationsMetadata && relationsMetadata.length) {
      relationsMetadata.forEach(({ targetMetadata, details }) => {
        const {
          idName,
          resolve,
          resolvedName,
          resolvedDescription,
          nullable,
          multiple,
        } = details;

        if (!targetMetadata) {
          throw new Error(`Target metadata not found for ${idName}`);
        }

        const { Entity: Target, entityToken: targetToken } = targetMetadata;

        const targetTokenDescription = targetToken.description;

        if (!targetTokenDescription) {
          throw new Error(
            `Description not found for token ${sourceToken.toString()}`,
          );
        }

        if (resolve) {
          Object.defineProperty(constructor.prototype, resolvedName, {
            value: async function (parent: E) {
              if (parent[idName]) {
                const parentId = parent[idName] as Id;
                if (multiple) {
                  return RepositoryStore.getInstanceByEntity(targetToken).find({
                    filter: {
                      _id: { $in: parentId ?? [] },
                    },
                  });
                }
                return RepositoryStore.getInstanceByEntity(
                  targetToken,
                ).findById({ id: parentId });
              }
              return undefined;
            },
            writable: true,
            enumerable: true,
            configurable: true,
          });

          const descriptorResolveField = Object.getOwnPropertyDescriptor(
            constructor.prototype,
            resolvedName,
          );

          if (!descriptorResolveField) {
            throw new Error(
              `The descriptor for the method ${resolvedName} does not exist in the resolver ${constructor.name}`,
            );
          }

          ResolveField(() => (multiple ? [Target] : Target), {
            name: resolvedName,
            nullable,
            description: resolvedDescription,
          })(constructor.prototype, resolvedName, descriptorResolveField);

          SetMetadata(
            IS_PUBLIC_KEY,
            (options.relationResolve && options.relationResolve?.public) ??
              options.general?.defaultResolveFieldPublic ??
              false,
          )(constructor.prototype, resolvedName, descriptorResolveField);

          SetUserAction(UserActionEnum.Read)(
            constructor.prototype,
            resolvedName,
            descriptorResolveField,
          );

          SetResolverOperation(ResolverOperationEnum.RelationResolve)(
            constructor.prototype,
            resolvedName,
            descriptorResolveField,
          );

          CheckPolicies(
            ...(!checkPolicies
              ? [() => true]
              : options.relationResolve &&
                options.relationResolve?.policyHandlers
              ? options.relationResolve.policyHandlers
              : [options.general?.readPolicyHandler ?? (() => false)]),
          )(constructor.prototype, resolvedName, descriptorResolveField);

          UseFilters(
            ...(options.relationResolve &&
            options.relationResolve?.filters?.length
              ? options.relationResolve.filters
              : options.general?.defaultResolveFieldFilters ?? []),
          )(constructor.prototype, resolvedName, descriptorResolveField);

          UseInterceptors(
            ...(options.relationResolve &&
            options.relationResolve?.interceptors?.length
              ? options.relationResolve.interceptors
              : options.general?.defaultResolveFieldInterceptors ?? []),
          )(constructor.prototype, resolvedName, descriptorResolveField);

          UseGuards(
            ...(options.relationResolve &&
            options.relationResolve?.guards?.length
              ? options.relationResolve.guards
              : options.general?.defaultResolveFieldGuards ?? []),
            ...(checkPolicies ? [SimplePoliciesGuard] : []),
          )(constructor.prototype, resolvedName, descriptorResolveField);
        }
      });
    }

    return constructor;
  };
}
