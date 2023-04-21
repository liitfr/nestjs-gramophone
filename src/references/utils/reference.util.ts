import { Type } from '@nestjs/common';

export const REFERENCE_METADATA = Symbol('referenceMetadata');

export interface ReferenceMetadata {
  Reference: Type<unknown>;
  referenceToken: symbol;
  addChip?: boolean;
}

export const isReferenceDecorated = (Reference: Type<unknown>): boolean =>
  !!Reflect.getMetadata(REFERENCE_METADATA, Reference);

export const getReferenceToken = (
  Reference: Type<unknown>,
): symbol | undefined => {
  const metadata = Reflect.getMetadata(REFERENCE_METADATA, Reference);
  return metadata?.referenceToken;
};
