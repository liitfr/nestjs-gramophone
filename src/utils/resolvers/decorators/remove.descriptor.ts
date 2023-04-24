import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimpleFilter } from '../types/simple-filter.type';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type RemoveOptions<E extends object> = MutationOptions & {
  Filter: SimpleFilter<E>;
  filterPipes?: Pipe[];
};

export function WithRemove<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    remove: {
      ...defaultMutationOptions,
      Filter: PartialInput,
      ...pOptions.remove,
    },
  };

  const checkPolicies =
    options.remove &&
    options.remove?.checkPolicies !== null &&
    typeof options.remove?.checkPolicies !== 'undefined'
      ? options.remove?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.remove === false ||
      !options.remove?.enable
    ) {
      return constructor;
    }

    const Filter = options.remove.Filter;

    class ResolverWithRemove extends constructor {
      @UseGuards(
        ...(options.remove && options.remove?.guards?.length
          ? options.remove.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.remove && options.remove?.interceptors?.length
          ? options.remove.interceptors
          : options.general?.defaultMutationInterceptors ?? [])
      )
      @UseFilters(
        ...(options.remove && options.remove?.filters?.length
          ? options.remove.filters
          : options.general?.defaultMutationFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.remove && options.remove?.policyHandlers
          ? options.remove.policyHandlers
          : [options.general?.removePolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.remove && options.remove?.public) ??
          options.general?.defaultMutationPublic ??
          false
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Remove mutation`,
        name: `remove${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown')
        )}`,
      })
      async remove(
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.remove && options.remove?.filterPipes
            ? options.remove.filterPipes
            : options.general?.defaultMutationPipes ?? [])
        )
        filter: InstanceType<typeof Filter>
      ) {
        return this.simpleService.remove(filter);
      }
    }

    return ResolverWithRemove;
  };
}
