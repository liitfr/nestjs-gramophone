import { registerEnumType } from '@nestjs/graphql';

export enum IconEnum {
  NewReleases = 'NewReleases',
  Drafts = 'Drafts',
  DeleteForever = 'DeleteForever',
  Verified = 'Verified',
  MarkEmailRead = 'MarkEmailRead',
}

registerEnumType(IconEnum, {
  name: 'IconEnum',
});
