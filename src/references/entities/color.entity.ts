import { HydratedDocument } from 'mongoose';

import { CreateRepository } from '../../data/decorators/create-repository.decorator';

import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { ColorEnum } from '../enums/color.enum';

export type ColorDocument = HydratedDocument<Color>;

@CreateRepository()
@SimpleReference(ColorEnum)
export class Color {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Color extends ISimpleReference {}
