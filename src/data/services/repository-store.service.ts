import { Injectable, Type } from '@nestjs/common';

import { pascalCase, pluralize } from '../../utils/string.util';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { getEntityToken } from '../../utils/entities/entity.util';

import { Repository as IRepository } from '../abstracts/repository.abstract';

interface Options<S> {
  SchemaTransformer?: (Schema: S) => S;
  isDiscriminator?: boolean;
  discriminators?: () => Type<object>[];
}

type Item<E extends object, S = unknown> = {
  Entity: Type<E>;
  entityToken: symbol;
  entityRepositoryToken: symbol;
  instance?: IRepository<E>;
  options?: Options<S>;
};

type RegisteredRepository<E extends object, S> = Item<E, S> & {
  instance: IRepository<E>;
};

export { Options as RepositoryStoreRegisterOptions };

export { Item as RepositoryStoreItem };

@Injectable()
export class RepositoryStore {
  private static repositories: Item<object>[] = [];

  public static register<E extends object, S>(
    Entity: Type<E>,
    options?: Options<S>,
  ) {
    const {
      entityToken,
      entityRepositoryToken: existingEntityRepositoryToken,
    } = EntityStore.get(Entity);

    const existingRepository = RepositoryStore.repositories.find(
      (r) => r.entityToken === entityToken,
    );

    const entityTokenDescription = entityToken.description;

    if (!entityTokenDescription) {
      throw new Error(
        `Description not found for token ${entityToken.toString()}`,
      );
    }

    const entityRepositoryToken =
      existingEntityRepositoryToken ??
      Symbol(`${pluralize(pascalCase(entityTokenDescription))}Repository`);

    SetEntityMetadata({
      entityRepositoryToken,
    })(Entity);

    if (existingRepository) {
      if (existingRepository.entityRepositoryToken !== entityRepositoryToken) {
        throw new Error(
          `Repository for entity ${entityTokenDescription} already exists with token ${existingRepository.entityRepositoryToken.description}`,
        );
      }

      return existingRepository;
    }

    const newRepository = {
      Entity,
      entityToken,
      entityRepositoryToken,
      options,
    };

    RepositoryStore.repositories.push(newRepository);

    return newRepository;
  }

  public static getByEntity<E extends object, S>(
    entity: symbol | string | Type<E>,
  ): RegisteredRepository<E, S> {
    let repository: Item<E, S> | undefined;
    let description: string | undefined;
    if (typeof entity === 'string') {
      repository = RepositoryStore.repositories.find<Item<E, S>>(
        (r): r is Item<E, S> => r.entityToken.description === entity,
      );
      description = entity;
    } else if (typeof entity === 'symbol') {
      repository = RepositoryStore.repositories.find<Item<E, S>>(
        (r): r is Item<E, S> => r.entityToken === entity,
      );
      description = entity.description;
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (resolvedEntityToken) {
        repository = RepositoryStore.repositories.find<Item<E, S>>(
          (r): r is Item<E, S> => r.entityToken === resolvedEntityToken,
        );
        description = resolvedEntityToken.description;
      }
    }

    if (!repository || !description) {
      throw new Error(`Repository not found for entity ${entity.toString()}`);
    }

    if (!repository.entityRepositoryToken) {
      throw new Error(
        `Entity repository token not found for entity ${description} repository`,
      );
    }

    return repository as RegisteredRepository<E, S>;
  }

  public static getInstanceByEntity<E extends object, S>(
    entity: symbol | string | Type<E>,
  ): IRepository<E> {
    const repository = RepositoryStore.getByEntity<E, S>(entity);

    if (!repository.instance) {
      throw new Error(
        `Repository for entity ${entity.toString()} not registered`,
      );
    }

    return repository.instance;
  }

  public static getAll() {
    return RepositoryStore.repositories;
  }
}
