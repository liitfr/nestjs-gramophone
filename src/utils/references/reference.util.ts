import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const REFERENCE_METADATA = Symbol('referenceMetadata');

export interface ReferenceMetadata {
  referenceName?: string;
  referenceDescription?: string;
  referencePartitioner?: Record<string, string>;
}

enum EmptyEnum {}

export const isReferenceDecorated = (Reference: Type): boolean =>
  !!Reflect.getMetadata(REFERENCE_METADATA, Reference);

export const getReferenceMetadata = (Reference: Type): ReferenceMetadata => {
  const referenceMetadata = Reflect.getMetadata(REFERENCE_METADATA, Reference);
  return {
    referenceName: Reference.name,
    referenceDescription: addSpaceToPascalCase(Reference.name),
    referencePartitioner: EmptyEnum,
    ...referenceMetadata,
  };
};
