import { Inject, Injectable, Type } from '@nestjs/common';

import { checkIfIsTrackable } from '../../utils/entities/simple-entity.decorator';
import { getServiceMetadata } from '../../utils/services/service.util';
import { getEntityMetadata } from '../../utils/entities/entity.util';

import { VersioningService } from '../services/versioning.service';

export const versioners: {
  Entity: Type<unknown>;
  versionedServiceToken: symbol;
  versioningServiceToken: symbol;
}[] = [];

function registerVersioner(
  Entity: Type<unknown>,
  versionedServiceToken: symbol,
) {
  const existingVersioner = versioners.find(
    (v) => v.versionedServiceToken === versionedServiceToken,
  );

  if (existingVersioner) {
    return existingVersioner;
  }

  const versioningServiceToken = Symbol(
    `VersioningServiceFor${versionedServiceToken.description}`,
  );

  const newVersioner = {
    Entity,
    versionedServiceToken: versionedServiceToken,
    versioningServiceToken,
  };

  versioners.push(newVersioner);

  return newVersioner;
}

export function Versioned(Entity: Type<unknown>) {
  const entityMetadata = getEntityMetadata(Entity);

  if (!checkIfIsTrackable(Entity)) {
    throw new Error(
      'Entity ' +
        entityMetadata.entityToken.description +
        ' must be trackable to be versioned',
    );
  }

  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const { serviceToken } = getServiceMetadata(constructor);

    const versioner = registerVersioner(Entity, serviceToken);

    @Injectable()
    class VersionedRepository extends constructor {
      @Inject(versioner.versioningServiceToken)
      versionerService: VersioningService<unknown>;
    }

    return VersionedRepository;
  };
}
