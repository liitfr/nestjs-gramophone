import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { Type } from '../../references/entities/type.entity';
import { AddRelations } from '../../utils/relations/add-relations.decorator';
import { Color } from '../../references/entities/color.entity';
import {
  Idable,
  Memoable,
  SimpleEntity,
  Trackable,
} from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';

import { Author } from './author.entity';

@ObjectType()
@Schema()
@CreateRepository()
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
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
