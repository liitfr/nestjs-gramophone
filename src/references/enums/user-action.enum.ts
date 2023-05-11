import { registerEnumType } from '@nestjs/graphql';

// Exceptionnaly we don't respect naming convention
// because CASL expects actions to be lowercase

export enum UserActionEnum {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Remove = 'remove',
}

registerEnumType(UserActionEnum, {
  name: 'UserActionEnum',
});
