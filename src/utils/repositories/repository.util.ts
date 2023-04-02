import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const REPOSITORY_METADATA = Symbol('repositoryMetadata');

export interface RepositoryMetadata {
  repositoryName?: string;
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
    repositoryName: Repository.name,
    repositoryDescription: addSpaceToPascalCase(Repository.name),
    ...repositoryMetadata,
  };
};
