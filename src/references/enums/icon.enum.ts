import { registerEnumType } from '@nestjs/graphql';

export enum IconEnum {
  Inventory = 'inventory',
  Tune = 'tune',
  NewReleases = 'newReleases',
  Drafts = 'drafts',
  DeleteForever = 'deleteForever',
  ToggleOn = 'toggleOn',
  ToggleOff = 'toggleOff',
  ScheduleSend = 'scheduleSend',
  PlayCircle = 'playCircle',
  DoneOutline = 'doneOutline',
  CancelSchedule = 'cancelSchedule',
  Verified = 'verified',
  RequestQuote = 'requestQuote',
  ReceiptLong = 'receiptLong',
  Paid = 'paid',
  Backspace = 'backspace',
  BrowserNotSupported = 'browserNotSupported',
  Print = 'print',
  MarkEmailRead = 'markEmailRead',
  HandShake = 'handShake',
  ThumbDown = 'thumbDown',
  BioTech = 'bioTech',
  NightShelter = 'nightShelter',
  Folder = 'folder',
  CorporateFare = 'corporateFare',
  Business = 'business',
  Notifications = 'notifications',
  LocationOn = 'locationOn',
  SentimentSatisfiedAlt = 'sentimentSatisfiedAlt',
}

registerEnumType(IconEnum, {
  name: 'IconEnum',
});
