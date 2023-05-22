import { registerEnumType } from '@nestjs/graphql';

// Exceptionnaly we don't respect naming convention
// because CASL expects actions to be lowercase

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
