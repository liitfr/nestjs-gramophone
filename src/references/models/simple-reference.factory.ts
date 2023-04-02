import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Idable } from '../../utils/entities/idable.decorator';
import { generateCollectionName } from '../../utils/string.util';
import { SetMetadata } from '@nestjs/common';
import { ENTITY_METADATA } from 'src/utils/entities/entity.util';

export function SimpleReferenceFactory(
  CodeEnum: Record<string, string>,
  referenceName: string,
  referenceDescription: string = referenceName,
) {
  @Idable()
  @SetMetadata(ENTITY_METADATA, {
    entityName: referenceName,
    entityDescription: referenceDescription,
  })
  @ObjectType(referenceName, { description: referenceDescription })
  @Schema({ collection: generateCollectionName(referenceName) })
  class SimpleReference {
    @Field(() => CodeEnum, {
      nullable: false,
      description: `${referenceDescription}'s code`,
    })
    @Prop({ type: String, required: true, enum: CodeEnum })
    code: typeof CodeEnum;

    @Field(() => Int, {
      nullable: false,
      description: `${referenceDescription}'s version`,
    })
    @Prop({ required: true })
    version: number;

    @Field(() => Int, {
      nullable: false,
      description: `${referenceDescription}'s index`,
    })
    @Prop({ required: true })
    index: number;

    @Field(() => String, {
      nullable: false,
      description: `${referenceDescription}'s label`,
    })
    @Prop({ required: true })
    label: string;

    @Field(() => Boolean, {
      nullable: false,
      description: `${referenceDescription}'s  is selected by default ?`,
    })
    @Prop({ required: true })
    isSelectedByDefault: boolean;
  }

  const SimpleReferenceSchema = SchemaFactory.createForClass(SimpleReference);

  return { SimpleReference, SimpleReferenceSchema };
}
