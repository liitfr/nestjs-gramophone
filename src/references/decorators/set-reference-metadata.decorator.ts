import { SetMetadata } from '@nestjs/common';

import { REFERENCE_METADATA, ReferenceMetadata } from '../utils/reference.util';
import { ReferenceStore } from '../services/reference-store.service';

export function SetReferenceMetadata(metadata: ReferenceMetadata) {
  const { referenceToken } = metadata;

  const newMetadata = {
    ...(ReferenceStore.get(referenceToken) ?? {}),
    ...metadata,
  };

  ReferenceStore.set(referenceToken, newMetadata);

  return SetMetadata<symbol, ReferenceMetadata>(
    REFERENCE_METADATA,
    newMetadata,
  );
}
