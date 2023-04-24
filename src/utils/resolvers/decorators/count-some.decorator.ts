import { Args, Int, Query } from '@nestjs/graphql';
import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { SimpleFilter } from '../types/simple-filter.type';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';
import { Pipe } from '../../types/pipe.type';

export type CountSomeOptions<E extends object> = QueryOptions & {
  Filter: SimpleFilter<E>;
  filterPipes?: Pipe[];
};

export function WithCountSome<E extends object>({
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    countSome: {
      ...defaultQueryOptions,
      Filter: PartialInput,
      ...pOptions.countSome,
    },
  };

  const checkPolicies =
    options.countSome &&
    options.countSome?.checkPolicies !== null &&
    typeof options.countSome?.checkPolicies !== 'undefined'
      ? options.countSome?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.countSome === false ||
      !options.countSome?.enable
    ) {
      return constructor;
    }

    const Filter = options.countSome.Filter;

    class ResolverWithCountSome extends constructor {
      @UseGuards(
        ...(options.countSome && options.countSome?.guards?.length
          ? options.countSome.guards
          : options.general?.defaultQueryGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.countSome && options.countSome?.interceptors?.length
          ? options.countSome.interceptors
          : options.general?.defaultQueryInterceptors ?? [])
      )
      @UseFilters(
        ...(options.countSome && options.countSome?.filters?.length
          ? options.countSome.filters
          : options.general?.defaultQueryFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.countSome && options.countSome?.policyHandlers
          ? options.countSome.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.countSome && options.countSome?.public) ??
          options.general?.defaultQueryPublic ??
          false
      )
      @Query(() => Int, {
        nullable: false,
        description: `${entityDescription} : Count some query`,
        name: `countSome${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown')
        )}`,
      })
      async countSome(
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.countSome && options.countSome?.filterPipes
            ? options.countSome.filterPipes
            : options.general?.defaultQueryPipes ?? [])
        )
        filter: InstanceType<typeof Filter>
      ): Promise<number> {
        return this.simpleService.count(filter);
      }
    }

    return ResolverWithCountSome;
  };
}
