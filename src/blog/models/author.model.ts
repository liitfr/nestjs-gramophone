import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  // HydratedDocument,
  Document as MongooseDocument,
  Types as MongooseTypes,
} from 'mongoose';

import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';
import { entityDescription } from '../../utils/entity-decorator';

// export type AuthorDocument = HydratedDocument<Author>;
export type AuthorDocument = Author & MongooseDocument<MongooseTypes.ObjectId>;

@ObjectType()
@Schema()
export class Author {
  static [entityDescription] = 'Author';

  @Field(() => MongoObjectIdScalar)
  _id: MongooseTypes.ObjectId;

  @Field({ nullable: false })
  @Prop()
  firstName: string;

  @Field({ nullable: false })
  @Prop()
  lastName: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
