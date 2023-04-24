import { PolicyHandler } from '../../../authorization/handlers/policy.handler';

import { Filter } from '../../types/filter.type';
import { Guard } from '../../types/guard.type';
import { Interceptor } from '../../types/interceptor.type';
import { Pipe } from '../../types/pipe.type';

export interface MutationOptions {
  enable?: boolean;
  guards?: readonly Guard[];
  interceptors?: readonly Interceptor[];
  filters?: readonly Filter[];
  public?: boolean;
  pipes?: readonly Pipe[];
  checkRelations?: boolean;
  checkPolicies?: boolean;
  policyHandlers?: readonly PolicyHandler[];
}

export const defaultMutationOptions: MutationOptions = {
  enable: true,
  public: false,
  checkRelations: true,
  checkPolicies: true,
} as const;
