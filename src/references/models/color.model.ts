import { Type as NestType } from '@nestjs/common';

import { HydratedDocument } from 'mongoose';

import { ColorEnum } from '../enums/color.enum';

import { SimpleReferenceFactory } from './simple-reference.factory';

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceFactory(
  ColorEnum,
  'Color',
);

export type ColorDocument = HydratedDocument<NestType>;

export { SimpleReference as Color };
export { SimpleReferenceSchema as ColorSchema };
