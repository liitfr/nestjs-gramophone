import { registerEnumType } from '@nestjs/graphql';

export enum ColorEnum {
  Error = 'error',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Default = 'default',
  Primary = 'primary',
  Secondary = 'secondary',
}

registerEnumType(ColorEnum, {
  name: 'ColorEnum',
});
