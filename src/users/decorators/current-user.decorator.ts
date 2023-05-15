import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getUserFromContext } from '../utils/get-user-from-context.util';
import { User } from '../entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): User =>
    getUserFromContext(context),
);
