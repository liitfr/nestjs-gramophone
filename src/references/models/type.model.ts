import { Type as NestType } from '@nestjs/common';

import { HydratedDocument } from 'mongoose';

import { TypeEnum } from '../enums/type.enum';

import { SimpleReferenceFactory } from './simple-reference.factory';

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceFactory(
  TypeEnum,
  'Type',
);

export type TypeDocument = HydratedDocument<NestType>;

export { SimpleReference as Type };
export { SimpleReferenceSchema as TypeSchema };
