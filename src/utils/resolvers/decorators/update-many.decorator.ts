import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { CurrentUserId } from '../../../users/decorators/current-user-id.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { CheckRelations } from '../../../data/pipes/check-relations.pipe';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';
import { Id } from '../../types/id.type';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';
import { SimpleFilter } from '../types/simple-filter.type';

export type UpdateManyOptions<E extends object> = MutationOptions & {
  Filter: SimpleFilter<E>;
  filterPipes?: Pipe[];
  Payload: SimpleFilter<E>;
  payloadPipes?: Pipe[];
};

export function WithUpdateMany<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
  isTrackable,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    updateMany: {
      ...defaultMutationOptions,
      Filter: PartialInput,
      Payload: PartialInput,
      ...pOptions.updateMany,
    },
  };

  const checkPolicies =
    options.updateMany &&
    options.updateMany?.checkPolicies !== null &&
    typeof options.updateMany?.checkPolicies !== 'undefined'
      ? options.updateMany?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  let checkRelations = true;
  if (
    options.updateMany &&
    options.updateMany?.checkRelations !== null &&
    typeof options.updateMany?.checkRelations !== 'undefined'
  ) {
    checkRelations = options.updateMany.checkRelations;
  } else if (
    options.general &&
    options.general?.defaultMutationCheckRelations !== null &&
    typeof options.general?.defaultMutationCheckRelations !== 'undefined'
  ) {
    checkRelations = options.general.defaultMutationCheckRelations;
  }

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.updateMany === false ||
      !options.updateMany?.enable
    ) {
      return constructor;
    }

    const Filter = options.updateMany.Filter;
    const Payload = options.updateMany.Payload;

    class ResolverWithUpdateMany extends constructor {
      @UseGuards(
        ...(options.updateMany && options.updateMany?.guards?.length
          ? options.updateMany.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.updateMany && options.updateMany?.interceptors?.length
          ? options.updateMany.interceptors
          : options.general?.defaultMutationInterceptors ?? [])
      )
      @UseFilters(
        ...(options.updateMany && options.updateMany?.filters?.length
          ? options.updateMany.filters
          : options.general?.defaultMutationFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.updateMany && options.updateMany?.policyHandlers
          ? options.updateMany.policyHandlers
          : [options.general?.updatePolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.updateMany && options.updateMany?.public) ??
          options.general?.defaultMutationPublic ??
          false
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown')
        )}`,
      })
      async updateMany(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.updateMany && options.updateMany?.filterPipes
            ? options.updateMany.filterPipes
            : options.general?.defaultMutationPipes ?? [])
        )
        filter: InstanceType<typeof Filter>,
        @Args(
          'update',
          { type: () => Payload },
          ...(checkRelations ? [CheckRelations] : []),
          ...(options.updateMany && options.updateMany?.payloadPipes
            ? options.updateMany.payloadPipes
            : options.general?.defaultMutationPipes ?? [])
        )
        update: InstanceType<typeof Payload>
      ) {
        return this.simpleService.updateMany(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }
    }

    return ResolverWithUpdateMany;
  };
}
