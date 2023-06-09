import { SetMetadata } from '@nestjs/common';

import { UserActionEnum } from '../../../references/enums/user-action.enum';

export const USER_ACTION: unique symbol = Symbol('userAction');

export const SetUserAction = (userAction: UserActionEnum) =>
  SetMetadata(USER_ACTION, userAction);
