import { Field, Int } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ReferenceEnum } from '../enums/reference.enum';
import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';

export type ReferenceDocument = HydratedDocument<Reference>;

@SimpleReference(ReferenceEnum)
export class Reference {
  @Field(() => Int, {
    nullable: false,
    description: "Reference's active version",
  })
  @Prop({ required: true })
  activeVersion: number;
}

export const ReferenceSchema = SchemaFactory.createForClass(Reference);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Reference extends ISimpleReference {}
