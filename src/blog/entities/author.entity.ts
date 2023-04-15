import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  Idable,
  SimpleEntity,
} from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';

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
