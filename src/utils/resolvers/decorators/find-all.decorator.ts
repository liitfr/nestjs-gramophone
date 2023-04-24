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

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type FindAllOptions = QueryOptions;

export function WithFindAll<E extends object>({
  Entity,
  options: pOptions,
  entityDescription,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    findAll: {
      ...defaultQueryOptions,
      ...pOptions.findAll,
    },
  };

  const checkPolicies =
    options.findAll &&
    options.findAll?.checkPolicies !== null &&
    typeof options.findAll?.checkPolicies !== 'undefined'
      ? options.findAll?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.findAll === false ||
      !options.findAll?.enable
    ) {
      return constructor;
    }

    class ResolverWithFindAll extends constructor {
      @UseGuards(
        ...(options.findAll && options.findAll?.guards?.length
          ? options.findAll.guards
          : options.general?.defaultQueryGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.findAll && options.findAll?.interceptors?.length
          ? options.findAll.interceptors
          : options.general?.defaultQueryInterceptors ?? [])
      )
      @UseFilters(
        ...(options.findAll && options.findAll?.filters?.length
          ? options.findAll.filters
          : options.general?.defaultQueryFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findAll && options.findAll?.policyHandlers
          ? options.findAll.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findAll && options.findAll?.public) ??
          options.general?.defaultQueryPublic ??
          false
      )
      @Query(() => [Entity], {
        nullable: false,
        description: `${entityDescription} : Find all query`,
        name: `findAll${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown')
        )}`,
      })
      async findAll(): Promise<E[]> {
        return this.simpleService.findAll();
      }
    }

    return ResolverWithFindAll;
  };
}
