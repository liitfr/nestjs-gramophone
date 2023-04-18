import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { Type } from '../../references/entities/type.entity';
import { Relation } from '../../utils/relations/relation.decorator';
import { Color } from '../../references/entities/color.entity';
import {
  Idable,
  Memoable,
  SimpleEntity,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';
import { Id } from '../../utils/id.type';

@ObjectType()
@Schema()
@CreateRepository()
@SimpleEntity({ isIdable: true, isTrackable: true, isMemoable: true })
export class Post {
  @Field({ nullable: false, description: "Post's title" })
  @Prop()
  title: string;

  @Field({ nullable: false, description: "Post's content" })
  @Prop()
  content: string;

  @Relation(Type, {
    partitionQueries: true,
  })
  typeId: Id;

  @Relation(Color, {
    partitionQueries: true,
    nullable: true,
  })
  colorId?: Id;

  @Relation('Author')
  authorId: Id;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
