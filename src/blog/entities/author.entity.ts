import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';
import { Idable } from '../../utils/types/idable.type';

@ObjectType()
@Schema()
@CreateRepository()
@SimpleEntity({ isIdable: true })
export class Author {
  @Field({ nullable: false })
  @Prop()
  firstName: string;

  @Field({ nullable: false })
  @Prop()
  lastName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Author extends Idable {}
