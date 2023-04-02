import { HydratedDocument } from 'mongoose';

import { TypeEnum } from '../enums/type.enum';

import { SimpleReferenceModelFactory } from './simple-reference-model.factory';

const { SimpleReference: Type, SimpleReferenceSchema: TypeSchema } =
  SimpleReferenceModelFactory(TypeEnum, 'Type');

export type TypeDocument = HydratedDocument<typeof Type>;

export { Type, TypeSchema };
