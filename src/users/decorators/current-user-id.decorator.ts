import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Id } from '../../utils/id.type';

import { getUserFromContext } from '../utils/get-user-from-context.util';

export const CurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): Id =>
    getUserFromContext(context)._id,
);
