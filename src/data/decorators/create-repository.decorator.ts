import { SetMetadata, Type } from '@nestjs/common';

import {
  ENTITY_METADATA,
  EntityMetadata,
  getEntityMetadata,
} from '../../utils/entities/entity.util';
import { pascalCase, pluralize } from '../../utils/string.util';

import { Repository } from '../abstracts/repository.abstract';

interface Options {
  SchemaFactory?: any;
}

export const repositories: {
  Entity: Type<unknown>;
  entityToken: symbol;
  entityRepositoryToken: symbol;
  instance?: Repository<unknown>;
  options?: Options;
}[] = [];

export function registerRepository(
  Entity: Type<unknown>,
  entityToken: symbol,
  pEntityRepositoryToken?: symbol,
  options?: Options,
) {
  const existingRepository = repositories.find(
    (r) => r.entityToken === entityToken,
  );

  const entityRepositoryToken =
    pEntityRepositoryToken ??
    Symbol(`${pluralize(pascalCase(entityToken.description))}Repository`);

  const entityMetadata = getEntityMetadata(Entity);

  SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
    ...entityMetadata,
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
    const { entityToken, entityRepositoryToken } =
      getEntityMetadata(constructor);

    registerRepository(
      constructor,
      entityToken,
      entityRepositoryToken,
      options,
    );

    return constructor;
  };
}
