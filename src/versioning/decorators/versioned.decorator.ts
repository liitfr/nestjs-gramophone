import { Inject, Injectable, Type } from '@nestjs/common';

import { checkIfIsTrackable } from '../../utils/entity-enhancers/trackable.decorator';
import { getRepositoryName } from '../../utils/repositories/repository.util';

import { VersioningService } from '../services/versioning.service';

export const versioners: {
  repositoryName: string;
  Entity: Type<unknown>;
}[] = [];

export function Versioned(Entity: Type<unknown>) {
  if (!checkIfIsTrackable(Entity)) {
    throw new Error('Entity must be trackable to be versioned');
  }

  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const repositoryNameValue = getRepositoryName(constructor);

    if (!versioners.find((v) => v.repositoryName === repositoryNameValue)) {
      versioners.push({ repositoryName: repositoryNameValue, Entity });
    }

    @Injectable()
    class VersionedRepository extends constructor {
      @Inject(`VersioningServiceFor${repositoryNameValue}`)
      versionerService: VersioningService<unknown>;
    }

    return VersionedRepository;
  };
}
