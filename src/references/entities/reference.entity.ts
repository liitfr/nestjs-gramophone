import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SimpleReferenceEntityFactory } from '../factories/simple-reference-entity.factory';
import { ReferenceEnum } from '../enums/reference.enum';

const { SimpleReference } = SimpleReferenceEntityFactory(
  ReferenceEnum,
  'Reference',
);

@ObjectType()
@Schema()
export class Reference extends SimpleReference {
  @Field(() => Int, {
    nullable: false,
    description: "Reference's active version",
  })
  @Prop({ required: true })
  activeVersion: number;
}

export type ReferenceDocument = HydratedDocument<Reference>;

export const ReferenceSchema = SchemaFactory.createForClass(Reference);
