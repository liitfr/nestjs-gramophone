import { registerEnumType } from '@nestjs/graphql';

export enum ColorEnum {
  Error = 'Error',
  Info = 'Info',
  Success = 'Success',
  Warning = 'Warning',
  Default = 'Default',
  Primary = 'Primary',
  Secondary = 'Secondary',
}

registerEnumType(ColorEnum, {
  name: 'ColorEnum',
});
