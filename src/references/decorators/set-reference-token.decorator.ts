import { SetMetadata } from '@nestjs/common';

import { Constructor } from '../../utils/types/constructor.type';

import { REFERENCE_METADATA } from '../utils/reference.util';

export function SetReferenceToken(referenceToken: symbol | undefined) {
  return <T extends Constructor>(constructor: T) => {
    SetMetadata<symbol, { referenceToken: symbol }>(REFERENCE_METADATA, {
      referenceToken: referenceToken ?? Symbol(constructor.name),
    })(constructor);
    return constructor;
  };
}
