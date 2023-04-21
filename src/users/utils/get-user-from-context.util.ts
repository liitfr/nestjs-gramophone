import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '../entities/user.entity';

export const getUserFromContext = (context: ExecutionContext): User => {
  const ctx = GqlExecutionContext.create(context);
  const req = ctx.getContext().req;
  return req.user as User;
};
