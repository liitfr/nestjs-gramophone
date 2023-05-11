import { Types as MongooseTypes } from 'mongoose';

// TODO : Check if T extends ID is equivalent to T extends MongooseSchema.Types.ObjectId
export type Id = MongooseTypes.ObjectId;
