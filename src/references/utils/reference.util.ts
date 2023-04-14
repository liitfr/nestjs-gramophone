import { Type } from '@nestjs/common';

export const REFERENCE_METADATA = Symbol('referenceMetadata');

export interface ReferenceMetadata {
  referenceToken: symbol;
  addChip?: boolean;
}

export const isReferenceDecorated = (Reference: Type): boolean =>
  !!Reflect.getMetadata(REFERENCE_METADATA, Reference);

export const getReferenceMetadata = (Reference: Type): ReferenceMetadata => {
  const referenceMetadata = Reflect.getMetadata(REFERENCE_METADATA, Reference);
  return {
    addChip: false,
    ...referenceMetadata,
  };
};
