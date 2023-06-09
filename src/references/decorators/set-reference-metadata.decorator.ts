import { Constructor } from '../../utils/types/constructor.type';

import { ReferenceMetadata, getReferenceToken } from '../utils/reference.util';
import { ReferenceStore } from '../services/reference-store.service';

export function SetReferenceMetadata(metadata: Partial<ReferenceMetadata>) {
  return <T extends Constructor>(constructor: T) => {
    const referenceToken = getReferenceToken(constructor);

    if (!referenceToken) {
      throw new Error('Reference token not found');
    }

    const newMetadata = {
      ...(ReferenceStore.uncertainGet(referenceToken) ?? {}),
      Reference: constructor,
      ...metadata,
    };

    ReferenceStore.set(referenceToken, newMetadata);

    return constructor;
  };
}
