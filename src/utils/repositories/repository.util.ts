import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const REPOSITORY_METADATA = Symbol('repositoryMetadata');

export interface RepositoryMetadata {
  repositoryToken: symbol;
  repositoryDescription?: string;
}

export const isRepositoryDecorated = (Repository: Type): boolean =>
  !!Reflect.getMetadata(REPOSITORY_METADATA, Repository);

export const getRepositoryMetadata = (Repository: Type): RepositoryMetadata => {
  const repositoryMetadata = Reflect.getMetadata(
    REPOSITORY_METADATA,
    Repository,
  );
  return {
    repositoryDescription: addSpaceToPascalCase(Repository.name),
    ...repositoryMetadata,
  };
};
