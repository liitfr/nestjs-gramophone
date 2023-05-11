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
import { camelCase, pascalCase } from '../../string.util';
import { Id } from '../../types/id.type';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimplePayload } from '../types/simple-payload.type';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';
import { SimpleApiInputObj } from '../types/simple-api-input.type';
import { addTrackableData } from '../utils/add-trackable-data.util';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type CreateOptions<E extends object> = MutationOptions & {
  Payload?: SimplePayload<E>;
  payloadPipes?: readonly Pipe[];
};

export function WithCreate<E extends object>({
  Entity,
  options: pOptions,
  Input,
  entityDescription,
  entityTokenDescription,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    create:
      pOptions.create === false
        ? false
        : {
            ...defaultMutationOptions,
            ...pOptions.create,
          },
  };

  const checkPolicies =
    options.create &&
    options.create?.checkPolicies !== null &&
    typeof options.create?.checkPolicies !== 'undefined'
      ? options.create?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  let checkRelations = true;
  if (
    options.create &&
    options.create?.checkRelations !== null &&
    typeof options.create?.checkRelations !== 'undefined'
  ) {
    checkRelations = options.create.checkRelations;
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
      options.create === false ||
      !options.create?.enable
    ) {
      return constructor;
    }

    const Payload = options.create.Payload ?? Input;

    class ResolverWithCreate extends constructor {
      @UseGuards(
        ...(options.create && options.create?.guards?.length
          ? options.create.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.create && options.create?.interceptors?.length
          ? options.create.interceptors
          : options.general?.defaultMutationInterceptors ?? []),
      )
      @UseFilters(
        ...(options.create && options.create?.filters?.length
          ? options.create.filters
          : options.general?.defaultMutationFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.create && options.create?.policyHandlers
          ? options.create.policyHandlers
          : [options.general?.createPolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.Create)
      @SetUserAction(UserActionEnum.Create)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.create && options.create?.public) ??
          options.general?.defaultMutationPublic ??
          false,
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Create mutation`,
        name: `create${pascalCase(entityTokenDescription ?? 'unknown')}`,
      })
      async create(
        @CurrentUserId() userId: Id,
        @Args(
          camelCase(entityTokenDescription ?? 'unknown'),
          { type: () => Payload },
          ...(checkRelations ? [new CheckRelations(Entity)] : []),
          ...(options.create && options.create?.payloadPipes
            ? options.create.payloadPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        doc: SimpleApiInputObj<E>,
      ) {
        const trackableData = {
          creatorId: userId,
          createdAt: new Date(),
          updaterId: userId,
          updatedAt: new Date(),
        };

        return this.simpleService.create(
          addTrackableData({ obj: doc, Entity, trackableData }),
        );
      }
    }

    return ResolverWithCreate;
  };
}
