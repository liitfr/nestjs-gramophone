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

import { Constructor } from '../../types/constructor.type';
import { Id } from '../../types/id.type';
import { pascalCase } from '../../string.util';
import { IdScalar } from '../../scalars/id.scalar';
import { Pipe } from '../../types/pipe.type';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type FindOneOptions = QueryOptions & {
  filterPipes?: Pipe[];
};

export function WithFindOne<E extends object>({
  Entity,
  options: pOptions,
  entityDescription,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    findOne: {
      ...defaultQueryOptions,
      ...pOptions.findOne,
    },
  };

  const checkPolicies =
    options.findOne &&
    options.findOne?.checkPolicies !== null &&
    typeof options.findOne?.checkPolicies !== 'undefined'
      ? options.findOne?.checkPolicies
      : options.general?.defaultQueryCheckPolicies !== null &&
        typeof options.general?.defaultQueryCheckPolicies !== 'undefined'
      ? options.general?.defaultQueryCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableQueries ||
      options.findOne === false ||
      !options.findOne?.enable
    ) {
      return constructor;
    }

    class ResolverWithFindOne extends constructor {
      @UseGuards(
        ...(options.findOne && options.findOne?.guards?.length
          ? options.findOne.guards
          : options.general?.defaultQueryGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.findOne && options.findOne?.interceptors?.length
          ? options.findOne.interceptors
          : options.general?.defaultQueryInterceptors ?? [])
      )
      @UseFilters(
        ...(options.findOne && options.findOne?.filters?.length
          ? options.findOne.filters
          : options.general?.defaultQueryFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findOne && options.findOne?.policyHandlers
          ? options.findOne.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findOne && options.findOne?.public) ??
          options.general?.defaultQueryPublic ??
          false
      )
      @Query(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one query`,
        name: `findOne${pascalCase(entityTokenDescription ?? 'unknown')}`,
      })
      async findOne(
        @Args(
          'id',
          { type: () => IdScalar },
          ...(options.findOne && options.findOne?.filterPipes
            ? options.findOne.filterPipes
            : options.general?.defaultQueryPipes ?? [])
        )
        id: Id
      ): Promise<E | null> {
        return this.simpleService.findById(id);
      }
    }

    return ResolverWithFindOne;
  };
}
