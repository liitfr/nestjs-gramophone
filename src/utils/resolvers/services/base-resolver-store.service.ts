import { Injectable, Type } from '@nestjs/common';

import { pascalCase, pluralize } from '../../string.util';
import { EntityStore } from '../../entities/entity-store.service';
import { SetEntityMetadata } from '../../entities/set-entity-metadata.decorator';
import { getEntityToken } from '../../entities/entity.util';
import { SSTHandle } from '../../types/handle.type';

import { ResolverOptions } from '../types/options.type';

type Item<E extends object> = {
  Entity: Type<E>;
  entityToken: symbol;
  entityBaseResolverToken: symbol;
  BaseResolver: Type<object>;
  baseResolverOptions?: ResolverOptions<E>;
};

export { Item as BaseResolverStoreItem };

@Injectable()
export class BaseResolverStore {
  private static baseResolvers: Item<object>[] = [];

  public static register<E extends object>(
    Entity: Type<E>,
    BaseResolver: Type<object>,
    baseResolverOptions?: ResolverOptions<E>,
  ) {
    const {
      entityToken,
      entityBaseResolverToken: existingEntityBaseResolverToken,
    } = EntityStore.get(Entity);

    const existingBaseResolver = BaseResolverStore.baseResolvers.find(
      (r) => r.entityToken === entityToken,
    );

    const entityTokenDescription = entityToken.description;

    if (!entityTokenDescription) {
      throw new Error(
        `Description not found for token ${entityToken.toString()}`,
      );
    }

    if (existingBaseResolver) {
      throw new Error(
        `Base Resolver for entity ${entityTokenDescription} already exists.`,
      );
    }

    const entityBaseResolverToken =
      existingEntityBaseResolverToken ??
      Symbol(`${pluralize(pascalCase(entityTokenDescription))}BaseResolver`);

    SetEntityMetadata({
      entityBaseResolverToken,
    })(Entity);

    const newBaseResolver = {
      Entity,
      entityToken,
      entityBaseResolverToken,
      BaseResolver,
      baseResolverOptions,
    };

    BaseResolverStore.baseResolvers.push(newBaseResolver);

    return newBaseResolver;
  }

  public static uncertainGetByEntity<E extends object>(
    entity: SSTHandle<E>,
  ): Item<E> | undefined {
    if (typeof entity === 'string') {
      return BaseResolverStore.baseResolvers.find<Item<E>>(
        (r): r is Item<E> => r.entityToken.description === entity,
      );
    } else if (typeof entity === 'symbol') {
      return BaseResolverStore.baseResolvers.find<Item<E>>(
        (r): r is Item<E> => r.entityToken === entity,
      );
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (resolvedEntityToken) {
        return BaseResolverStore.baseResolvers.find<Item<E>>(
          (r): r is Item<E> => r.entityToken === resolvedEntityToken,
        );
      }
    }
    return undefined;
  }

  public static getByEntity<E extends object>(entity: SSTHandle<E>): Item<E> {
    const baseResolver = BaseResolverStore.uncertainGetByEntity(entity);

    if (!baseResolver) {
      throw new Error(
        `Base Resolver not found for entity ${entity.toString()}`,
      );
    }

    if (!baseResolver.entityBaseResolverToken) {
      throw new Error(
        `Entity Base Resolver token not found for entity ${entity.toString()} repository`,
      );
    }

    return baseResolver;
  }

  public static getAll() {
    return BaseResolverStore.baseResolvers;
  }
}
