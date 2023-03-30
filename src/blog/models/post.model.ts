import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types as MongooseTypes } from 'mongoose';

import { Trackable } from '../../utils/entity-enhancers/trackable.decorator';
import { Memoable } from '../../utils/entity-enhancers/memoable.decorator';
import { entityDescription } from '../../utils/entity-enhancers/enhancers.util';
import { IdScalar } from '../../utils/scalars/id.scalar';
import { Idable } from '../../utils/entity-enhancers/idable.decorator';

export type PostDocument = HydratedDocument<Post>;

@Idable()
@Memoable()
@Trackable()
@ObjectType()
@Schema()
export class Post {
  static [entityDescription] = 'Post';

  @Field({ nullable: false })
  @Prop()
  title: string;

  @Field({ nullable: false })
  @Prop()
  content: string;

  // @Field(() => [Line], { nullable: false })
  // @Prop(() => [LineSchema])
  // lines: Line[];

  @Field(() => IdScalar, {
    nullable: false,
    description: "¨Post's author id",
  })
  @Prop({
    type: MongooseTypes.ObjectId,
    ref: 'Author',
    autopopulate: false,
    required: true,
  })
  authorId: MongooseTypes.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
