import { Type } from '@nestjs/common';

import { Constructor } from '../../utils/types/constructor.type';

import { SetReferenceToken } from '../decorators/set-reference-token.decorator';
import { SetReferenceMetadata } from '../decorators/set-reference-metadata.decorator';
import { ReferenceStore } from '../services/reference-store.service';

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

export const initReferenceMetadata = (
  constructor: Constructor,
  defaultToken?: symbol,
) => {
  let originalReferenceMetadata: Partial<ReferenceMetadata>;

  if (!getReferenceToken(constructor)) {
    const referenceToken = defaultToken ?? Symbol(constructor.name);
    SetReferenceToken(defaultToken)(constructor);
    originalReferenceMetadata = {
      referenceToken,
    };
    SetReferenceMetadata(originalReferenceMetadata)(constructor);
  } else {
    originalReferenceMetadata = ReferenceStore.get(constructor);
  }

  return originalReferenceMetadata;
};
