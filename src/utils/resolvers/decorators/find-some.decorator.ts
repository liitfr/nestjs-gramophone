import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';
import { Pipe } from '../../types/pipe.type';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { SimpleFilter } from '../types/simple-filter.type';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type FindSomeOptions<E extends object> = QueryOptions & {
  Filter?: SimpleFilter<E>;
  filterPipes?: readonly Pipe[];
};

export function WithFindSome<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    findSome:
      pOptions.findSome === false
        ? false
        : {
            ...defaultQueryOptions,
            Filter: PartialInput,
            ...pOptions.findSome,
          },
  };

  const checkPolicies =
    options.findSome &&
    options.findSome?.checkPolicies !== null &&
    typeof options.findSome?.checkPolicies !== 'undefined'
      ? options.findSome?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.findSome === false ||
      !options.findSome?.enable
    ) {
      return constructor;
    }

    const Filter = options.findSome.Filter ?? PartialInput;

    class ResolverWithFindSome extends constructor {
      @UseGuards(
        ...(options.findSome && options.findSome?.guards?.length
          ? options.findSome.guards
          : options.general?.defaultQueryGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.findSome && options.findSome?.interceptors?.length
          ? options.findSome.interceptors
          : options.general?.defaultQueryInterceptors ?? []),
      )
      @UseFilters(
        ...(options.findSome && options.findSome?.filters?.length
          ? options.findSome.filters
          : options.general?.defaultQueryFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findSome && options.findSome?.policyHandlers
          ? options.findSome.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.FindSome)
      @SetUserAction(UserActionEnum.Read)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findSome && options.findSome?.public) ??
          options.general?.defaultQueryPublic ??
          false,
      )
      @Query(() => [Entity], {
        nullable: false,
        description: `${entityDescription} : Find some query`,
        name: `findSome${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async findSome(
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.findSome && options.findSome?.filterPipes
            ? options.findSome.filterPipes
            : options.general?.defaultQueryPipes ?? []),
        )
        filter: InstanceType<typeof Filter>,
      ): Promise<E[]> {
        return this.simpleService.find(filter);
      }
    }

    return ResolverWithFindSome;
  };
}
