import { Id } from './id.type';

export interface Trackable {
  creatorId: Id;
  updaterId: Id;
  createdAt: Date;
  updatedAt: Date;
}
