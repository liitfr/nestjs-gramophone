import { Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entities/entity.util';
import { pascalCase, pluralize } from '../../utils/string.util';
import { SetEntityMetadata } from '../../utils/entities/set-entity-metadata.decorator';

import { Repository } from '../abstracts/repository.abstract';

interface Options {
  SchemaFactory?: (Schema: unknown) => unknown;
}

export const repositories: {
  Entity: Type<unknown>;
  entityToken: symbol;
  entityRepositoryToken: symbol;
  instance?: Repository<unknown>;
  options?: Options;
}[] = [];

export function registerRepository(Entity: Type<unknown>, options?: Options) {
  const { entityToken, entityRepositoryToken: existingEntityRepositoryToken } =
    getEntityMetadata(Entity);

  const existingRepository = repositories.find(
    (r) => r.entityToken === entityToken,
  );

  const entityRepositoryToken =
    existingEntityRepositoryToken ??
    Symbol(`${pluralize(pascalCase(entityToken.description))}Repository`);

  SetEntityMetadata({
    entityToken,
    entityRepositoryToken,
  })(Entity);

  if (existingRepository) {
    if (existingRepository.entityRepositoryToken !== entityRepositoryToken) {
      throw new Error(
        `Repository for entity ${entityToken.description} already exists with token ${existingRepository.entityRepositoryToken.description}`,
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

  repositories.push(newRepository);

  return newRepository;
}

export function CreateRepository(options?: Options) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    registerRepository(constructor, options);

    return constructor;
  };
}
