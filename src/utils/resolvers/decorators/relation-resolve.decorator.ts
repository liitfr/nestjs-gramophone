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
import { EntityStore } from '../../entities/entity-store.service';
import { Id } from '../../types/id.type';

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

export type RelationResolveOptions = ResolveFieldOptions;

export function WithRelationResolve<E extends object>({
  Entity,
  options: pOptions,
  entityToken,
  entityRelations,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    relationResolve: {
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

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableResolveFields ||
      options.relationResolve === false ||
      !options.relationResolve?.enable
    ) {
      return constructor;
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

          const { Entity: Relation, entityToken: relationToken } =
            targetMetadata;

          const relationTokenDescription = relationToken.description;

          if (!relationTokenDescription) {
            throw new Error(
              `Description not found for token ${entityToken.toString()}`,
            );
          }

          if (resolve) {
            Object.defineProperty(constructor.prototype, resolvedName, {
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
              constructor.prototype,
              resolvedName,
            );

            if (!descriptorResolveField) {
              throw new Error(
                `The descriptor for the method ${resolvedName} does not exist in the resolver ${constructor.name}`,
              );
            }

            // HACK : we can only use ResolveField in a class that is decorated with @Resolver
            Resolver(() => Entity)(constructor);

            ResolveField(() => (multiple ? [Relation] : Relation), {
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
        }
      });
    }

    return constructor;
  };
}
