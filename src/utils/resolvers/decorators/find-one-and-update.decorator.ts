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
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { Id } from '../../types/id.type';
import { pascalCase } from '../../utils/string.util';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { SimpleFilter } from '../types/simple-filter.type';
import { SimplePayload } from '../types/simple-payload.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';
import { addTrackableData } from '../utils/add-trackable-data.util';
import { PartialSimpleApiInputObj } from '../types/simple-api-input.type';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type FindOneAndUpdateOptions<E extends object> = MutationOptions & {
  Filter?: SimpleFilter<E>;
  filterPipes?: readonly Pipe[];
  Payload?: SimplePayload<E>;
  payloadPipes?: readonly Pipe[];
};

export function WithFindOneAndUpdate<E extends object>({
  Entity,
  options: pOptions,
  Input,
  PartialInput,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    findOneAndUpdate:
      pOptions.findOneAndUpdate === false
        ? false
        : {
            ...defaultMutationOptions,
            Filter: PartialInput,
            Payload: Input,
            ...pOptions.findOneAndUpdate,
          },
  };

  const checkPolicies =
    options.findOneAndUpdate &&
    options.findOneAndUpdate?.checkPolicies !== null &&
    typeof options.findOneAndUpdate?.checkPolicies !== 'undefined'
      ? options.findOneAndUpdate?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  let checkRelations = true;
  if (
    options.findOneAndUpdate &&
    options.findOneAndUpdate?.checkRelations !== null &&
    typeof options.findOneAndUpdate?.checkRelations !== 'undefined'
  ) {
    checkRelations = options.findOneAndUpdate.checkRelations;
  } else if (
    options.general &&
    options.general?.defaultMutationCheckRelations !== null &&
    typeof options.general?.defaultMutationCheckRelations !== 'undefined'
  ) {
    checkRelations = options.general.defaultMutationCheckRelations;
  }

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.findOneAndUpdate === false ||
      !options.findOneAndUpdate?.enable
    ) {
      return constructor;
    }

    const Filter = options.findOneAndUpdate.Filter ?? PartialInput;
    const Payload = options.findOneAndUpdate.Payload ?? Input;

    class ResolverWithFindOneAndUpdate extends constructor {
      @UseGuards(
        ...(options.findOneAndUpdate && options.findOneAndUpdate?.guards?.length
          ? options.findOneAndUpdate.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.findOneAndUpdate &&
        options.findOneAndUpdate?.interceptors?.length
          ? options.findOneAndUpdate.interceptors
          : options.general?.defaultMutationInterceptors ?? []),
      )
      @UseFilters(
        ...(options.findOneAndUpdate &&
        options.findOneAndUpdate?.filters?.length
          ? options.findOneAndUpdate.filters
          : options.general?.defaultMutationFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.findOneAndUpdate && options.findOneAndUpdate?.policyHandlers
          ? options.findOneAndUpdate.policyHandlers
          : [options.general?.updatePolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.FindOneAndUpdate)
      @SetUserAction(UserActionEnum.Update)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.findOneAndUpdate && options.findOneAndUpdate?.public) ??
          options.general?.defaultMutationPublic ??
          false,
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Find one and update mutation`,
        name: `findOneAndUpdate${pascalCase(
          entityTokenDescription ?? 'unknown',
        )}`,
      })
      async findOneAndUpdate(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.findOneAndUpdate && options.findOneAndUpdate?.filterPipes
            ? options.findOneAndUpdate.filterPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        filter: InstanceType<typeof Filter>,
        @Args(
          'update',
          { type: () => Payload },
          ...(checkRelations ? [new CheckRelations(Entity)] : []),
          ...(options.findOneAndUpdate && options.findOneAndUpdate?.payloadPipes
            ? options.findOneAndUpdate.payloadPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        update: PartialSimpleApiInputObj<E>,
      ) {
        const trackableData = {
          updaterId: userId,
          updatedAt: new Date(),
        };

        return this.simpleService.findOneAndUpdate(
          filter,
          addTrackableData<E>({ obj: update, Entity, trackableData }),
        );
      }
    }

    return ResolverWithFindOneAndUpdate;
  };
}
