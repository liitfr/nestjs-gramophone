import { EntityMetadata, getEntityToken } from './entity.util';
import { EntityStore } from './entity-store.service';

export function SetEntityMetadata(metadata: Partial<EntityMetadata>) {
  return <T extends { new (...args: any[]): unknown }>(constructor: T) => {
    const entityToken = getEntityToken(constructor);

    if (!entityToken) {
      throw new Error('Entity token not found');
    }

    const newMetadata = {
      ...(EntityStore.uncertainGet(entityToken) ?? {}),
      Entity: constructor,
      ...metadata,
    };

    EntityStore.set(entityToken, newMetadata);

    return constructor;
  };
}
