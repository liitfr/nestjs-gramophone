import { Inject, Injectable, Type } from '@nestjs/common';

import { checkIfIsTrackable } from '../../utils/entities/trackable.decorator';
import { getRepositoryMetadata } from '../../utils/repositories/repository.util';

import { VersioningService } from '../services/versioning.service';

export const versioners: {
  repositoryName: string;
  Entity: Type<unknown>;
}[] = [];

export function Versioned(Entity: Type<unknown>) {
  if (!checkIfIsTrackable(Entity)) {
    throw new Error(
      `Entity` + Entity.name + ' must be trackable to be versioned',
    );
  }

  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const { repositoryName } = getRepositoryMetadata(constructor);

    if (!versioners.find((v) => v.repositoryName === repositoryName)) {
      versioners.push({ repositoryName: repositoryName, Entity });
    }

    @Injectable()
    class VersionedRepository extends constructor {
      @Inject(`VersioningServiceFor${repositoryName}`)
      versionerService: VersioningService<unknown>;
    }

    return VersionedRepository;
  };
}
