import { HydratedDocument } from 'mongoose';

import { SimpleReferenceFactory } from './simple-reference.factory';
import { ColorEnum } from '../enums/color.enum';
import { ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';

export type ColorDocument = HydratedDocument<Color>;

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceFactory(
  ColorEnum,
  'Color',
);

@ObjectType()
@Schema()
export class Color extends SimpleReference {}

export { SimpleReferenceSchema as ColorSchema };
