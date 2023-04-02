import { registerEnumType } from '@nestjs/graphql';

export enum ReferenceEnum {
  Color = 'Color',
  Type = 'Type',
  References = 'References',
}

registerEnumType(ReferenceEnum, {
  name: 'ReferenceEnum',
});
