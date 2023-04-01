import { Type } from '@nestjs/common';

import { addSpaceToPascalCase } from '../string.util';

export const REPOSITORY_METADATA = Symbol('repositoryMetadata');

export interface RepositoryMetadata {
  repositoryName?: string;
  repositoryDescription?: string;
}

export const isRepositoryDecorated = (classRef: Type): boolean =>
  !!Reflect.getMetadata(REPOSITORY_METADATA, classRef);

export const getRepositoryMetadata = (classRef: Type): RepositoryMetadata => {
  const repositoryMetadata = Reflect.getMetadata(REPOSITORY_METADATA, classRef);
  return {
    repositoryName: classRef.name,
    repositoryDescription: addSpaceToPascalCase(classRef.name),
    ...repositoryMetadata,
  };
};
