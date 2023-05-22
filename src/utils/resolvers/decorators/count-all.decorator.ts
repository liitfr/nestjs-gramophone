import { Int, Query } from '@nestjs/graphql';
import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { pascalCase, pluralize } from '../../utils/string.util';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type CountAllOptions = QueryOptions;

export function WithCountAll<E extends object>({
  options: pOptions,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    countAll: {
      ...defaultQueryOptions,
      ...pOptions.countAll,
    },
  };

  const checkPolicies =
    options.countAll &&
    options.countAll?.checkPolicies !== null &&
    typeof options.countAll?.checkPolicies !== 'undefined'
      ? options.countAll?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends SimpleResolver<E>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.countAll === false ||
      !options.countAll?.enable
    ) {
      return constructor;
    }

    class ResolverWithCountAll extends constructor {
      @UseGuards(
        ...(options.countAll && options.countAll?.guards?.length
          ? options.countAll.guards
          : options.general?.defaultQueryGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.countAll && options.countAll?.interceptors?.length
          ? options.countAll.interceptors
          : options.general?.defaultQueryInterceptors ?? []),
      )
      @UseFilters(
        ...(options.countAll && options.countAll?.filters?.length
          ? options.countAll.filters
          : options.general?.defaultQueryFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.countAll && options.countAll?.policyHandlers
          ? options.countAll.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.CountAll)
      @SetUserAction(UserActionEnum.Read)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.countAll && options.countAll?.public) ??
          options.general?.defaultQueryPublic ??
          false,
      )
      @Query(() => Int, {
        nullable: false,
        description: `${entityDescription} : Count all query`,
        name: `countAll${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async countAll(): Promise<number> {
        return this.simpleService.countAll();
      }
    }

    return ResolverWithCountAll;
  };
}
