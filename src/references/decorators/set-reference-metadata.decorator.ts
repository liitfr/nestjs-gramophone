import { SetMetadata } from '@nestjs/common';

import { REFERENCE_METADATA, ReferenceMetadata } from '../utils/reference.util';

export const entities = new Map<symbol, ReferenceMetadata>();

export function SetReferenceMetadata(metadata: ReferenceMetadata) {
  const { referenceToken } = metadata;

  const newMetadata = {
    ...(entities.get(referenceToken) ?? {}),
    ...metadata,
  };

  entities.set(referenceToken, newMetadata);

  return SetMetadata<symbol, ReferenceMetadata>(
    REFERENCE_METADATA,
    newMetadata,
  );
}
