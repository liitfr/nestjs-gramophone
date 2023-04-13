import { HydratedDocument } from 'mongoose';

import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';
import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { ColorEnum } from '../enums/color.enum';

export type ColorDocument = HydratedDocument<Color>;

@CreateReferenceRepository()
@SimpleReference(ColorEnum)
export class Color {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Color extends ISimpleReference {}
