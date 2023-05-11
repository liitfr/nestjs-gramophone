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
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type FindAllOptions = QueryOptions;

export function WithFindAll<E extends object>({
  Entity,
  options: pOptions,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    findAll:
      pOptions.findAll === false
        ? false
        : {
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

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
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
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.findAll && options.findAll?.interceptors?.length
          ? options.findAll.interceptors
          : options.general?.defaultQueryInterceptors ?? []),
      )
      @UseFilters(
        ...(options.findAll && options.findAll?.filters?.length
          ? options.findAll.filters
          : options.general?.defaultQueryFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findAll && options.findAll?.policyHandlers
          ? options.findAll.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.FindAll)
      @SetUserAction(UserActionEnum.Read)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findAll && options.findAll?.public) ??
          options.general?.defaultQueryPublic ??
          false,
      )
      @Query(() => [Entity], {
        nullable: false,
        description: `${entityDescription} : Find all query`,
        name: `findAll${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async findAll(): Promise<E[]> {
        return this.simpleService.findAll();
      }
    }

    return ResolverWithFindAll;
  };
}
