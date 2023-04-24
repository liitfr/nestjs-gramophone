import { Type } from '@nestjs/common';

import { PolicyHandler } from '../../../authorization/handlers/policy.handler';
import { AppAbility } from '../../../authorization/factories/casl-ability.factory';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Filter } from '../../types/filter.type';
import { Guard } from '../../types/guard.type';
import { Interceptor } from '../../types/interceptor.type';
import { Pipe } from '../../types/pipe.type';

export interface GeneralOptions {
  managePolicyHandler?: PolicyHandler;
  createPolicyHandler?: PolicyHandler;
  readPolicyHandler?: PolicyHandler;
  updatePolicyHandler?: PolicyHandler;
  removePolicyHandler?: PolicyHandler;
  // ==========================
  resolverGuards?: readonly Guard[];
  resolverInterceptors?: readonly Interceptor[];
  resolverFilters?: readonly Filter[];
  resolverPublic?: boolean;
  // ==========================
  enableQueries?: boolean;
  defaultQueryGuards?: readonly Guard[];
  defaultQueryInterceptors?: readonly Interceptor[];
  defaultQueryFilters?: readonly Filter[];
  defaultQueryPublic?: boolean;
  defaultQueryPipes?: readonly Pipe[];
  defaultQueryCheckPolicies?: boolean;
  // ==========================
  enableMutations?: boolean;
  defaultMutationGuards?: readonly Guard[];
  defaultMutationInterceptors?: readonly Interceptor[];
  defaultMutationFilters?: readonly Filter[];
  defaultMutationPublic?: boolean;
  defaultMutationPipes?: readonly Pipe[];
  defaultMutationCheckRelations?: boolean;
  defaultMutationCheckPolicies?: boolean;
  // ==========================
  enableResolveFields?: boolean;
  defaultResolveFieldGuards?: readonly Guard[];
  defaultResolveFieldInterceptors?: readonly Interceptor[];
  defaultResolveFieldFilters?: readonly Filter[];
  defaultResolveFieldPublic?: boolean;
  defaultResolveFieldPipes?: readonly Pipe[];
  defaultResolveFieldCheckPolicies?: boolean;
}

export const getDefaultGeneralOptions = <E extends object>(
  Entity: Type<E>,
): GeneralOptions =>
  ({
    managePolicyHandler: (ability: AppAbility) =>
      ability.can(UserActionEnum.Manage, Entity),
    createPolicyHandler: (ability: AppAbility) =>
      ability.can(UserActionEnum.Create, Entity),
    readPolicyHandler: (ability: AppAbility) =>
      ability.can(UserActionEnum.Read, Entity),
    updatePolicyHandler: (ability: AppAbility) =>
      ability.can(UserActionEnum.Update, Entity),
    removePolicyHandler: (ability: AppAbility) =>
      ability.can(UserActionEnum.Remove, Entity),
    // ==========================
    resolverPublic: false,
    // ==========================
    enableQueries: true,
    defaultQueryPublic: false,
    defaultQueryCheckPolicies: true,
    // ==========================
    enableMutations: true,
    defaultMutationPublic: false,
    defaultMutationCheckRelations: true,
    defaultMutationCheckPolicies: true,
    // ==========================
    enableResolveFields: true,
    defaultResolveFieldPublic: false,
    defaultResolveFieldCheckPolicies: true,
  } as const);
