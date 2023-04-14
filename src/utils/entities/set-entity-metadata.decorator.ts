import { SetMetadata } from '@nestjs/common';

import { ENTITY_METADATA, EntityMetadata } from './entity.util';

export const entities = new Map<symbol, EntityMetadata>();

export function SetEntityMetadata(metadata: EntityMetadata) {
  const { entityToken } = metadata;

  const newMetadata = {
    ...(entities.get(entityToken) ?? {}),
    ...metadata,
  };

  entities.set(entityToken, newMetadata);

  return SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, newMetadata);
}
