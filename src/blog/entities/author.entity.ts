import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  Idable,
  SimpleEntity,
} from '../../utils/entities/simple-entity.decorator';

export type AuthorDocument = HydratedDocument<Author>;

@ObjectType()
@Schema()
@SimpleEntity({ isIdable: true })
export class Author {
  @Field({ nullable: false })
  @Prop()
  firstName: string;

  @Field({ nullable: false })
  @Prop()
  lastName: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Author extends Idable {}
