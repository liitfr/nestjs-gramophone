import { HydratedDocument } from 'mongoose';

import { ColorEnum } from '../enums/color.enum';

import { SimpleReferenceModelFactory } from './simple-reference-model.factory';

const { SimpleReference: Color, SimpleReferenceSchema: ColorSchema } =
  SimpleReferenceModelFactory(ColorEnum, 'Color');

export type ColorDocument = HydratedDocument<typeof Color>;

export { Color, ColorSchema };
