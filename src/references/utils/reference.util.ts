import { Type } from '@nestjs/common';

import { Constructor } from '../../utils/types/constructor.type';

import { SetReferenceToken } from '../decorators/set-reference-token.decorator';
import { SetReferenceMetadata } from '../decorators/set-reference-metadata.decorator';
import { ReferenceStore } from '../services/reference-store.service';
import { ReferenceEnum } from '../enums/reference.enum';

export const REFERENCE_METADATA: unique symbol = Symbol('referenceMetadata');

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
  let referenceMetadata: Partial<ReferenceMetadata>;

  const referenceToken = defaultToken ?? Symbol(constructor.name);

  if (
    !referenceToken?.description ||
    !ReferenceEnum[referenceToken?.description]
  ) {
    throw new Error(`ReferenceEnum.${String(referenceToken)} is not defined`);
  }

  if (!getReferenceToken(constructor)) {
    SetReferenceToken(defaultToken)(constructor);
    referenceMetadata = {
      referenceToken,
    };
    SetReferenceMetadata(referenceMetadata)(constructor);
  } else {
    referenceMetadata = ReferenceStore.get(constructor);
  }

  return referenceMetadata;
};
