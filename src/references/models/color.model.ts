import { Type as NestType } from '@nestjs/common';

import { HydratedDocument } from 'mongoose';

import { ColorEnum } from '../enums/color.enum';

import { SimpleReferenceModelFactory } from './simple-reference-model.factory';

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceModelFactory(
  ColorEnum,
  'Color',
);

export type ColorDocument = HydratedDocument<NestType>;

export { SimpleReference as Color };
export { SimpleReferenceSchema as ColorSchema };
