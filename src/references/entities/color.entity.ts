import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { ColorEnum } from '../enums/color.enum';

export type ColorDocument = HydratedDocument<Color>;

@SimpleReference(ColorEnum)
export class Color {}

export const ColorSchema = SchemaFactory.createForClass(Color);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Color extends ISimpleReference {}
