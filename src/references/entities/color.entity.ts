import { HydratedDocument } from 'mongoose';

import { ColorEnum } from '../enums/color.enum';
import { SimpleReferenceEntityFactory } from '../factories/simple-reference-entity.factory';

const { SimpleReference: Color, SimpleReferenceSchema: ColorSchema } =
  SimpleReferenceEntityFactory(ColorEnum, 'Color');

export type ColorDocument = HydratedDocument<typeof Color>;

export { Color, ColorSchema };
