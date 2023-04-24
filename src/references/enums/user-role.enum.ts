import { registerEnumType } from '@nestjs/graphql';

export enum UserRoleEnum {
  User = 'User',
  Admin = 'Admin',
}

registerEnumType(UserRoleEnum, {
  name: 'RoleEnum',
});
