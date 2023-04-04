import { HydratedDocument } from 'mongoose';

import { TypeEnum } from '../enums/type.enum';
import { SimpleReferenceEntityFactory } from '../factories/simple-reference-entity.factory';

const { SimpleReference: Type, SimpleReferenceSchema: TypeSchema } =
  SimpleReferenceEntityFactory(TypeEnum, 'Type');

export type TypeDocument = HydratedDocument<typeof Type>;

export { Type, TypeSchema };
