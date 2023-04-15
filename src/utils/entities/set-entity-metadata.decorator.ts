import { SetMetadata } from '@nestjs/common';

import { ENTITY_METADATA, EntityMetadata } from './entity.util';
import { EntityStore } from './entity-store.service';

export function SetEntityMetadata(metadata: EntityMetadata) {
  const { entityToken } = metadata;

  const newMetadata = {
    ...(EntityStore.get(entityToken) ?? {}),
    ...metadata,
  };

  EntityStore.set(entityToken, newMetadata);

  return SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, newMetadata);
}
