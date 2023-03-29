export const repositoryDescription = Symbol('repositoryDescription');
export const repositoryName = Symbol('repositoryName');

export abstract class RepositoryDecorator {
  static [repositoryName]: string;
  static [repositoryDescription]?: string;
}

export const isRepositoryDecorator = (
  object: any,
): object is RepositoryDecorator =>
  !!Object.getOwnPropertyDescriptor(object, repositoryName);

export const getRepositoryName = (object: any): string => {
  if (isRepositoryDecorator(object)) {
    const repositoryNameValue = Object.getOwnPropertyDescriptor(
      object,
      repositoryName,
    )?.value;
    if (!repositoryNameValue) {
      throw new Error('Repository name is not defined');
    }
    return repositoryNameValue;
  }

  return object.name;
};

export const getRepositoryDescription = (object: any): string =>
  object[repositoryDescription] ?? getRepositoryName(object);
