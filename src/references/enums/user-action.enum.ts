import { registerEnumType } from '@nestjs/graphql';

export enum UserActionEnum {
  Manage = 'Manage',
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Remove = 'Remove',
}

registerEnumType(UserActionEnum, {
  name: 'UserActionEnum',
});
