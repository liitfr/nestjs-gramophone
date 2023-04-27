import { registerEnumType } from '@nestjs/graphql';

export enum IconEnum {
  NewReleases = 'newReleases',
  Drafts = 'drafts',
  DeleteForever = 'deleteForever',
  Verified = 'verified',
  MarkEmailRead = 'markEmailRead',
}

registerEnumType(IconEnum, {
  name: 'IconEnum',
});
