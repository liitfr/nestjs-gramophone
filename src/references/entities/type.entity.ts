import { HydratedDocument } from 'mongoose';

import { CreateRepository } from '../../data/decorators/create-repository.decorator';

import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { TypeEnum } from '../enums/type.enum';

export type TypeDocument = HydratedDocument<Type>;

@CreateRepository()
@SimpleReference(TypeEnum)
export class Type {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Type extends ISimpleReference {}
