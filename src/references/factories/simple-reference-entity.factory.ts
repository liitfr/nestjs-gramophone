import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SetMetadata } from '@nestjs/common';

import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';
import { generateCollectionName } from '../../utils/string.util';
import {
  ENTITY_METADATA,
  EntityMetadata,
} from '../../utils/entities/entity.util';
import {
  REFERENCE_METADATA,
  ReferenceMetadata,
} from '../../utils/references/reference.util';

export function SimpleReferenceEntityFactory(
  ReferencePartitioner: Record<string, string>,
  referenceName: string,
  referenceDescription: string = referenceName,
) {
  @ObjectType(referenceName, { description: referenceDescription })
  @Schema({ collection: generateCollectionName(referenceName) })
  @SimpleEntity({ isIdable: true })
  @SetMetadata<symbol, ReferenceMetadata>(REFERENCE_METADATA, {
    referenceName,
    referenceDescription,
    ReferencePartitioner,
  })
  @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    entityName: referenceName,
    entityDescription: referenceDescription,
  })
  class SimpleReference {
    @Field(() => ReferencePartitioner, {
      nullable: false,
      description: `${referenceDescription}'s code`,
    })
    @Prop({
      type: String,
      required: true,
      enum: ReferencePartitioner,
      unique: true,
      index: true,
    })
    code: typeof ReferencePartitioner;

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
      description: `${referenceDescription}'s is selected by default ?`,
    })
    @Prop({ required: true })
    isSelectedByDefault: boolean;
  }

  const SimpleReferenceSchema = SchemaFactory.createForClass(SimpleReference);

  return { SimpleReference, SimpleReferenceSchema };
}
