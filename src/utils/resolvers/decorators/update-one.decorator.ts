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
import { pascalCase } from '../../string.util';
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

export type UpdateOneOptions<E extends object> = MutationOptions & {
  Filter: SimpleFilter<E>;
  filterPipes?: Pipe[];
  Payload: SimpleFilter<E>;
  payloadPipes?: Pipe[];
};

export function WithUpdateOne<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
  isTrackable,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    updateOne: {
      ...defaultMutationOptions,
      Filter: PartialInput,
      Payload: PartialInput,
      ...pOptions.updateOne,
    },
  };

  const checkPolicies =
    options.updateOne &&
    options.updateOne?.checkPolicies !== null &&
    typeof options.updateOne?.checkPolicies !== 'undefined'
      ? options.updateOne?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  let checkRelations = true;
  if (
    options.updateOne &&
    options.updateOne?.checkRelations !== null &&
    typeof options.updateOne?.checkRelations !== 'undefined'
  ) {
    checkRelations = options.updateOne.checkRelations;
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
      options.updateOne === false ||
      !options.updateOne?.enable
    ) {
      return constructor;
    }

    const Filter = options.updateOne.Filter;
    const Payload = options.updateOne.Payload;

    class ResolverWithUpdateOne extends constructor {
      @UseGuards(
        ...(options.updateOne && options.updateOne?.guards?.length
          ? options.updateOne.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.updateOne && options.updateOne?.interceptors?.length
          ? options.updateOne.interceptors
          : options.general?.defaultMutationInterceptors ?? []),
      )
      @UseFilters(
        ...(options.updateOne && options.updateOne?.filters?.length
          ? options.updateOne.filters
          : options.general?.defaultMutationFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.updateOne && options.updateOne?.policyHandlers
          ? options.updateOne.policyHandlers
          : [options.general?.updatePolicyHandler ?? (() => false)]),
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.updateOne && options.updateOne?.public) ??
          options.general?.defaultMutationPublic ??
          false,
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update one mutation`,
        name: `updateOne${pascalCase(entityTokenDescription ?? 'unknown')}`,
      })
      async updateOne(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.updateOne && options.updateOne?.filterPipes
            ? options.updateOne.filterPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        filter: InstanceType<typeof Filter>,
        @Args(
          'update',
          { type: () => Payload },
          ...(checkRelations ? [CheckRelations] : []),
          ...(options.updateOne && options.updateOne?.payloadPipes
            ? options.updateOne.payloadPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        update: InstanceType<typeof Payload>,
      ) {
        return this.simpleService.updateOne(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }
    }

    return ResolverWithUpdateOne;
  };
}
