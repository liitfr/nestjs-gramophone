import { HydratedDocument } from 'mongoose';

import { SimpleReferenceFactory } from './simple-reference.factory';
import { TypeEnum } from '../enums/type.enum';
import { ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';

export type TypeDocument = HydratedDocument<Type>;

const { SimpleReference, SimpleReferenceSchema } = SimpleReferenceFactory(
  TypeEnum,
  'Type',
);

@ObjectType()
@Schema()
export class Type extends SimpleReference {}

export { SimpleReferenceSchema as TypeSchema };
