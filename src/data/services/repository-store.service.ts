import { Injectable, Type } from '@nestjs/common';

import { pascalCase, pluralize } from '../../utils/string.util';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';

import { Repository as IRepository } from '../abstracts/repository.abstract';

interface Options {
  SchemaFactory?: (Schema: unknown) => unknown;
}

interface Repository {
  Entity: Type<unknown>;
  entityToken: symbol;
  entityRepositoryToken: symbol;
  instance?: IRepository<unknown>;
  options?: Options;
}

export { Options as RepositoryStoreRegisterOptions };

@Injectable()
export class RepositoryStore {
  private static repositories: Repository[] = [];

  public static register(Entity: Type<unknown>, options?: Options) {
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
        'Description not found for token ' + entityToken.toString(),
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

  public static getByEntity(entity: symbol | string) {
    const repository = RepositoryStore.repositories.find((r) =>
      typeof entity === 'string'
        ? r.entityToken.description === entity
        : r.entityToken === entity,
    );

    const description =
      typeof entity === 'string' ? entity : entity.description;

    if (!repository) {
      throw new Error(`Repository for entity ${description} not found`);
    }

    if (!repository.entityRepositoryToken) {
      throw new Error(
        'Entity repository token not found for entity ' +
          description +
          ' repository',
      );
    }

    if (!repository.instance) {
      throw new Error(`Repository for entity ${description} not registered`);
    }

    return repository.instance;
  }

  public static getAll() {
    return RepositoryStore.repositories;
  }
}
