import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { Type } from '../../references/entities/type.entity';
import { Relation } from '../../data/decorators/relation.decorator';
import { Color } from '../../references/entities/color.entity';
import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';
import { Id } from '../../utils/types/id.type';
import { Nested } from '../../data/decorators/nested.decorator';
import { Chip } from '../../references/entities/chip.entity';
import { Idable } from '../../utils/types/idable.type';
import { Trackable } from '../../utils/types/trackable.type';
import { Memoable } from '../../utils/types/memoable.type';

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

  @Relation('Author', { reversible: true, reversedIdName: 'postIds' })
  authorId: Id;

  @Nested(Chip, { nullable: true })
  chip?: Chip;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
