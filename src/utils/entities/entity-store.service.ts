import { Injectable } from '@nestjs/common';

import { RelationDetails } from '../../data/utils/relation.util';

import { SSHandle, SSTHandle } from '../types/handle.type';

import { EntityMetadata, getEntityToken } from './entity.util';

type RelationMetadata = {
  targetMetadata?: EntityMetadata;
  details: RelationDetails;
};

type ReversedRelationMetadata = {
  sourceMetadata: EntityMetadata;
  details: RelationDetails;
};

@Injectable()
export class EntityStore {
  private static entities = new Map<symbol, EntityMetadata>();

  public static set(
    entity: SSTHandle<object>,
    metadata: Partial<EntityMetadata>,
  ): EntityMetadata {
    const entityToken = EntityStore.getEntityToken(entity);
    const existingMetadata = EntityStore.entities.get(entityToken);
    const newMetadata = {
      ...existingMetadata,
      ...metadata,
    };
    if (!newMetadata.entityToken || !newMetadata.Entity) {
      throw new Error(
        `Entity metadata not complete for ${entity.toString()} : token : ${newMetadata.entityToken?.toString()}`,
      );
    }
    EntityStore.entities.set(entityToken, newMetadata as EntityMetadata);
    return newMetadata as EntityMetadata;
  }

  public static uncertainGet(
    entity: SSTHandle<object>,
  ): EntityMetadata | undefined {
    const entityToken = EntityStore.uncertainGetEntityToken(entity);
    if (entityToken) {
      return EntityStore.entities.get(entityToken);
    }
    return undefined;
  }

  public static uncertainGetEntityToken(entity: SSTHandle<object>) {
    let entityToken: symbol | undefined;
    if (typeof entity === 'string') {
      entityToken = [...EntityStore.entities.keys()].find(
        (key) => key.description === entity,
      );
    } else if (typeof entity === 'symbol') {
      entityToken = entity;
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (resolvedEntityToken) {
        entityToken = resolvedEntityToken;
      }
    }
    return entityToken;
  }

  public static getEntityToken(entity: SSTHandle<object>) {
    const entityToken = EntityStore.uncertainGetEntityToken(entity);
    if (!entityToken) {
      throw new Error(`Entity not found in EntityStore : ${entity.toString()}`);
    }
    return entityToken;
  }

  public static has = (entity: SSTHandle<object>): boolean =>
    !!EntityStore.uncertainGet(entity);

  public static get(entity: SSTHandle<object>): EntityMetadata {
    const result = EntityStore.uncertainGet(entity);
    if (!result) {
      throw new Error(`Entity not found in EntityStore : ${entity.toString()}`);
    }
    return result;
  }

  public static getRelationMetadata(entity: SSHandle): RelationMetadata[] {
    const entityMetadata = EntityStore.get(entity);
    const relations = entityMetadata?.entityRelations ?? [];
    return relations.map(({ target, details }) => {
      const targetMetadata = details.weak
        ? EntityStore.uncertainGet(target)
        : EntityStore.get(target);
      return { targetMetadata, details };
    });
  }

  public static getReversedRelationMetadata(
    target: SSHandle,
  ): ReversedRelationMetadata[] {
    const targetMetadata = EntityStore.get(target);
    const result: ReversedRelationMetadata[] = [];
    for (const [sourceToken, sourceMetadata] of EntityStore.entities) {
      const relations = EntityStore.getRelationMetadata(sourceToken).filter(
        ({ targetMetadata: sourceTargetMetadata }) =>
          sourceTargetMetadata &&
          sourceTargetMetadata.entityToken === targetMetadata.entityToken,
      );
      if (relations) {
        result.push(
          ...relations.map(({ details }) => ({
            sourceMetadata,
            details,
          })),
        );
      }
    }
    return result;
  }
}
