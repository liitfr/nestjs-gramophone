import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Type } from '../../references/entities/type.entity';
import { AddRelations } from '../../utils/relations/add-relations.decorator';
import { Color } from '../../references/entities/color.entity';
import {
  Idable,
  Memoable,
  SimpleEntity,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';
import { Author } from './author.entity';

export type PostDocument = HydratedDocument<Post>;

@ObjectType()
@Schema()
@AddRelations([
  { Relation: Type, partitionQueries: true },
  { Relation: Color, partitionQueries: true, nullable: true },
  Author,
])
@SimpleEntity({ isIdable: true, isTrackable: true, isMemoable: true })
export class Post {
  @Field({ nullable: false, description: "Post's title" })
  @Prop()
  title: string;

  @Field({ nullable: false, description: "Post's content" })
  @Prop()
  content: string;

  // @Field(() => [Line], { nullable: false })
  // @Prop(() => [LineSchema])
  // lines: Line[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
