import { Injectable, Type } from '@nestjs/common';

import { pascalCase, pluralize } from '../../utils/string.util';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';
import { getEntityToken } from '../../utils/entities/entity.util';

import { Repository as IRepository } from '../abstracts/repository.abstract';

interface Options {
  SchemaFactory?: (Schema: unknown) => unknown;
}

type Repository<E> = {
  Entity: Type<E>;
  entityToken: symbol;
  entityRepositoryToken: symbol;
  instance?: IRepository<E>;
  options?: Options;
};

type RegisteredRepository<E> = Repository<E> & {
  instance: IRepository<E>;
};

export { Options as RepositoryStoreRegisterOptions };

@Injectable()
export class RepositoryStore {
  private static repositories: Repository<object>[] = [];

  public static register<E extends object>(Entity: Type<E>, options?: Options) {
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

  public static getByEntity<E extends object>(
    entity: symbol | string | Type<E>,
  ): IRepository<E> {
    let repository: Repository<E> | undefined;
    let description: string | undefined;
    if (typeof entity === 'string') {
      repository = RepositoryStore.repositories.find<Repository<E>>(
        (r): r is Repository<E> => r.entityToken.description === entity,
      );
      description = entity;
    } else if (typeof entity === 'symbol') {
      repository = RepositoryStore.repositories.find<Repository<E>>(
        (r): r is Repository<E> => r.entityToken === entity,
      );
      description = entity.description;
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (resolvedEntityToken) {
        repository = RepositoryStore.repositories.find<Repository<E>>(
          (r): r is Repository<E> => r.entityToken === resolvedEntityToken,
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

    if (!repository.instance) {
      throw new Error(`Repository for entity ${description} not registered`);
    }

    return (repository as RegisteredRepository<E>).instance;
  }

  public static getAll() {
    return RepositoryStore.repositories;
  }
}
