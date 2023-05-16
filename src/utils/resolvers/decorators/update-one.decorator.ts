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
import { CheckRelationsPipe } from '../../../data/pipes/check-relations.pipe';
import { UserActionEnum } from '../../../references/enums/user-action.enum';
import { VersionDataInput } from '../../../versioning/dtos/version-data.input';

import { Constructor } from '../../types/constructor.type';
import { pascalCase } from '../../utils/string.util';
import { Id } from '../../types/id.type';
import { Pipe } from '../../types/pipe.type';
import { Conditional } from '../../decorators/conditional.decorator';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { SimpleFilter } from '../types/simple-filter.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';
import { SimpleUpdatePayload } from '../types/simple-update-payload.type';
import { addTrackableData } from '../utils/add-trackable-data.util';
import { PartialSimpleApiInputObj } from '../types/simple-api-input.type';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type UpdateOneOptions<E extends object> = MutationOptions & {
  Filter?: SimpleFilter<E>;
  filterPipes?: readonly Pipe[];
  Payload?: SimpleUpdatePayload<E>;
  payloadPipes?: readonly Pipe[];
};

export function WithUpdateOne<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
  isVersioned,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    updateOne:
      pOptions.updateOne === false
        ? false
        : {
            ...defaultMutationOptions,
            enable: false,
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

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.updateOne === false ||
      !options.updateOne?.enable
    ) {
      return constructor;
    }

    const Filter = options.updateOne.Filter ?? PartialInput;
    const Payload = options.updateOne.Payload ?? PartialInput;

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
      @SetResolverOperation(ResolverOperationEnum.UpdateOne)
      @SetUserAction(UserActionEnum.Update)
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
          ...(checkRelations ? [new CheckRelationsPipe(Entity)] : []),
          ...(options.updateOne && options.updateOne?.payloadPipes
            ? options.updateOne.payloadPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        update: PartialSimpleApiInputObj<E>,
        @Conditional(
          isVersioned ?? false,
          Args('versionData', {
            type: () => VersionDataInput,
            nullable: true,
          }),
        )
        versionData?: VersionDataInput,
      ) {
        const trackableData = {
          updaterId: userId,
          updatedAt: new Date(),
        };

        return this.simpleService.updateOne({
          filter,
          update: addTrackableData<E>({ obj: update, Entity, trackableData }),
          versionData,
        });
      }
    }

    return ResolverWithUpdateOne;
  };
}
