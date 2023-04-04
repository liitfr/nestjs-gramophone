import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  Idable,
  SimpleEntity,
} from 'src/utils/entities/simple-entity.decorator';

export type LineDocument = HydratedDocument<Line>;

@ObjectType()
@Schema()
@SimpleEntity({ isIdable: true })
export class Line {
  @Field({ nullable: false })
  @Prop()
  content: string;
}

export const LineSchema = SchemaFactory.createForClass(Line);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Line extends Idable {}
