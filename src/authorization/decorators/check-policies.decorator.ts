import { SetMetadata } from '@nestjs/common';

import { PolicyHandler } from '../handlers/policy.handler';

export const CHECK_POLICIES_KEY = Symbol('checkPolicies');

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
