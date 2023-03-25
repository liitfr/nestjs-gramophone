import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types as MongooseTypes } from 'mongoose';

import { Trackable } from '../../utils/decorators/trackable.decorator';
import { Memoable } from '../../utils/decorators/memoable.decorator';
import { entityDescription } from '../../utils/entity-decorator.type';
import { MongoObjectIdScalar } from '../../utils/scalars/mongo-id.scalar';

export type PostDocument = HydratedDocument<Post>;

@Memoable()
@Trackable()
@ObjectType()
@Schema()
export class Post {
  static [entityDescription] = 'Post';

  @Field(() => MongoObjectIdScalar)
  _id: MongooseTypes.ObjectId;

  @Field({ nullable: false })
  @Prop()
  title: string;

  @Field({ nullable: false })
  @Prop()
  content: string;

  @Field(() => Int)
  @Prop()
  authorId: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Trackable, Memoable {}
