import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  Idable,
  SimpleEntity,
} from '../../utils/entities/simple-entity.decorator';
import { CreateRepository } from '../../data/decorators/create-repository.decorator';

export type AuthorDocument = HydratedDocument<Author>;

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
