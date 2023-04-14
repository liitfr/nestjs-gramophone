import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import mongoose from 'mongoose';

import { Id } from '../../utils/id.type';

// import { User } from '../entities/user.entity';

export const CurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): Id => {
    // const ctx = GqlExecutionContext.create(context);
    // const req = ctx.getContext().req;
    // const user = req.user as User;
    return new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5');
  },
);
