import { Injectable } from '@nestjs/common';

import { EntityMetadata } from './entity.util';

@Injectable()
export class EntityStore {
  private static entities = new Map<symbol, EntityMetadata>();

  public static set(entityToken: symbol, metadata: EntityMetadata) {
    EntityStore.entities.set(entityToken, metadata);
  }

  public static get(entityToken: symbol) {
    return EntityStore.entities.get(entityToken);
  }
}
