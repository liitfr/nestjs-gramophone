import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { TypeEnum } from '../enums/type.enum';

export type TypeDocument = HydratedDocument<Type>;

@SimpleReference(TypeEnum)
export class Type {}

export const TypeSchema = SchemaFactory.createForClass(Type);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Type extends ISimpleReference {}
