import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { SimpleEntity } from '../../utils/entities/simple-entity.decorator';

import { ColorEnum } from '../enums/color.enum';
import { IconEnum } from '../enums/icon.enum';

@ObjectType({ description: 'Chip' })
@Schema()
@SimpleEntity({ isIdable: true })
export class Chip {
  @Field(() => ColorEnum, {
    nullable: false,
    description: "Chip's color",
  })
  @Prop({ type: String, required: true, enum: ColorEnum })
  color: ColorEnum;

  @Field(() => IconEnum, {
    nullable: false,
    description: "Chip's icon",
  })
  @Prop({ type: String, required: true, enum: IconEnum })
  icon: IconEnum;
}

export const ChipSchemas = {
  noIndex: SchemaFactory.createForClass(Chip),
};
