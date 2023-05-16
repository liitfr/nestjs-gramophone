import { Types as MongooseTypes } from 'mongoose';

export const IdFactory = (str?: string) =>
  str ? new MongooseTypes.ObjectId(str) : new MongooseTypes.ObjectId();
