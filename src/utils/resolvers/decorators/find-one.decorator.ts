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
import { Id } from '../../types/id.type';
import { pascalCase } from '../../utils/string.util';
import { IdScalar } from '../../scalars/id.scalar';
import { Pipe } from '../../types/pipe.type';

import { QueryOptions, defaultQueryOptions } from '../options/query-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetUserAction } from './set-user-action.decorator';
import { SetResolverOperation } from './set-resolver-operation.decorator';

export type FindOneOptions = QueryOptions & {
  filterPipes?: readonly Pipe[];
};

export function WithFindOne<E extends object>({
  Entity,
  options: pOptions,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    findOne:
      pOptions.findOne === false
        ? false
        : {
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

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
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
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.findOne && options.findOne?.interceptors?.length
          ? options.findOne.interceptors
          : options.general?.defaultQueryInterceptors ?? []),
      )
      @UseFilters(
        ...(options.findOne && options.findOne?.filters?.length
          ? options.findOne.filters
          : options.general?.defaultQueryFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findOne && options.findOne?.policyHandlers
          ? options.findOne.policyHandlers
          : [options.general?.readPolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.FindOne)
      @SetUserAction(UserActionEnum.Read)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findOne && options.findOne?.public) ??
          options.general?.defaultQueryPublic ??
          false,
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
            : options.general?.defaultQueryPipes ?? []),
        )
        id: Id,
      ): Promise<E | null> {
        return this.simpleService.findById(id);
      }
    }

    return ResolverWithFindOne;
  };
}
