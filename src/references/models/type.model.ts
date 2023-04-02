import { Type as NestType } from '@nestjs/common';

import { HydratedDocument } from 'mongoose';

import { TypeEnum } from '../enums/type.enum';

import { SimpleReferenceModelFactory } from './simple-reference-model.factory';

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceModelFactory(
  TypeEnum,
  'Type',
);

export type TypeDocument = HydratedDocument<NestType>;

export { SimpleReference as Type };
export { SimpleReferenceSchema as TypeSchema };
