import { Type } from '@nestjs/common';
import { SchemaFactory } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

interface SimpleReferenceSchema {
  noIndex: Schema;
  indexed: Schema;
}

export const SimpleReferenceSchemasFactory = <R extends Type<unknown>>(
  Reference: R,
): SimpleReferenceSchema => ({
  indexed: SchemaFactory.createForClass(Reference).index(
    { code: 1, version: 1 },
    { unique: true },
  ),
  noIndex: SchemaFactory.createForClass(Reference),
});
