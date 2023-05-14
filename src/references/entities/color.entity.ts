import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';
import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { ColorEnum } from '../enums/color.enum';

@CreateReferenceRepository()
@SimpleReference(ColorEnum)
export class Color {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Color extends ISimpleReference<false> {}
