import { Injectable } from '@nestjs/common';

import { repositories } from '../decorators/create-repository.decorator';

@Injectable()
export class RepositoryFinder {
  public static findByEntityToken(entityToken: symbol) {
    const repository = repositories.find((r) => r.entityToken === entityToken);

    if (!repository) {
      throw new Error(
        `Repository for entity ${entityToken.description} not found`,
      );
    }

    if (!repository.entityRepositoryToken) {
      throw new Error(
        'Entity repository token not found for entity ' +
          entityToken.description +
          ' repository',
      );
    }

    if (!repository.instance) {
      throw new Error(
        `Repository for entity ${entityToken.description} not registered`,
      );
    }

    return repository.instance;
  }
}
