import { SetMetadata } from '@nestjs/common';

import { REFERENCE_METADATA } from '../utils/reference.util';

export function SetReferenceToken(referenceToken: symbol | undefined) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    SetMetadata<symbol, { referenceToken: symbol }>(REFERENCE_METADATA, {
      referenceToken: referenceToken ?? Symbol(constructor.name),
    })(constructor);
    return constructor;
  };
}
