import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Idable } from '../../utils/entity-enhancers/idable.decorator';

export type LineDocument = HydratedDocument<Line>;

@Idable()
@ObjectType()
@Schema()
export class Line {
  @Field({ nullable: false })
  @Prop()
  content: string;
}

export const LineSchema = SchemaFactory.createForClass(Line);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Line extends Idable {}
