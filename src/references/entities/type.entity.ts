import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { TypeEnum } from '../enums/type.enum';
import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';

@CreateReferenceRepository()
@SimpleReference(TypeEnum)
export class Type {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Type extends ISimpleReference<false> {}
