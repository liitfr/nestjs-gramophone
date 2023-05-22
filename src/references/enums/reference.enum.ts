import { registerEnumType } from '@nestjs/graphql';

export enum ReferenceEnum {
  Color = 'Color',
  Reference = 'Reference',
  Type = 'Type',
  UserAction = 'UserAction',
  UserRole = 'UserRole',
}

registerEnumType(ReferenceEnum, {
  name: 'ReferenceEnum',
});
