import { PolicyHandler } from '../../../authorization/handlers/policy.handler';

import { Filter } from '../../types/filter.type';
import { Guard } from '../../types/guard.type';
import { Interceptor } from '../../types/interceptors.type';
import { Pipe } from '../../types/pipe.type';

export interface ResolveFieldOptions {
  enable?: boolean;
  guards?: readonly Guard[];
  interceptors?: readonly Interceptor[];
  filters?: readonly Filter[];
  public?: boolean;
  pipes?: readonly Pipe[];
  checkPolicies?: boolean;
  policyHandlers?: readonly PolicyHandler[];
}

export const defaultResolveFieldOptions: ResolveFieldOptions = {
  enable: true,
  public: false,
  checkPolicies: true,
} as const;
