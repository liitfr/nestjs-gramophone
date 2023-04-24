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
import { SimpleInput } from '../../dtos/simple-entity-input.factory';
import { camelCase, pascalCase } from '../../string.util';
import { Id } from '../../types/id.type';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimplePayload } from '../types/simple-payload.type';
import { BaseResolver } from '../types/base-resolver.type';
import { ResolverDecoratorParams } from '../types/resolver-decorator-params.type';
import { Options } from '../types/options.type';

export type CreateOptions<E extends object> = MutationOptions & {
  Payload: SimplePayload<E>;
  payloadPipes?: Pipe[];
};

export function WithCreate<E extends object>({
  Entity,
  options: pOptions,
  Input,
  entityDescription,
  entityTokenDescription,
  isTrackable,
}: ResolverDecoratorParams<E>) {
  const options: Options<E> = {
    ...pOptions,
    create: {
      ...defaultMutationOptions,
      Payload: Input as SimpleInput<E>, // Bug: how to link simple input & simple entity ?
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

  return <T extends Constructor<BaseResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.create === false ||
      !options.create?.enable
    ) {
      return constructor;
    }

    const Payload = options.create.Payload;

    class ResolverWithCreate extends constructor {
      @UseGuards(
        ...(options.create && options.create?.guards?.length
          ? options.create.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : [])
      )
      @UseInterceptors(
        ...(options.create && options.create?.interceptors?.length
          ? options.create.interceptors
          : options.general?.defaultMutationInterceptors ?? [])
      )
      @UseFilters(
        ...(options.create && options.create?.filters?.length
          ? options.create.filters
          : options.general?.defaultMutationFilters ?? [])
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.create && options.create?.policyHandlers
          ? options.create.policyHandlers
          : [options.general?.createPolicyHandler ?? (() => false)])
      )
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.create && options.create?.public) ??
          options.general?.defaultMutationPublic ??
          false
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
          ...(checkRelations ? [CheckRelations] : []),
          ...(options.create && options.create?.payloadPipes
            ? options.create.payloadPipes
            : options.general?.defaultMutationPipes ?? [])
        )
        doc: InstanceType<typeof Payload>
      ) {
        return this.simpleService.create({
          ...doc,
          ...(isTrackable
            ? {
                creatorId: userId,
                createdAt: new Date(),
                updaterId: userId,
                updatedAt: new Date(),
              }
            : {}),
        });
      }
    }

    return ResolverWithCreate;
  };
}
