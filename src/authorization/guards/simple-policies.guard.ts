import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { getUserFromContext } from '../../users/utils/get-user-from-context.util';

import {
  AppAbility,
  CaslAbilityFactory,
} from '../factories/casl-ability.factory';
import { PolicyHandler } from '../handlers/policy.handler';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';

@Injectable()
export class SimplePoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const user = getUserFromContext(context);
    const ability = await this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
