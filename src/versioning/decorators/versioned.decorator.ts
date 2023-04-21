import { Inject, Injectable, Type } from '@nestjs/common';

import {
  Trackable,
  checkIfIsTrackable,
} from '../../utils/entities/simple-entity.decorator';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { ServiceStore } from '../../utils/services/service-store.service';

import { VersioningService } from '../services/versioning.service';

export const versioningServices: {
  VersionedEntity: Type<Trackable>;
  versionedServiceToken: symbol;
  versioningServiceToken: symbol;
}[] = [];

export function registerVersioningService<E extends Trackable>(
  VersionedEntity: Type<E>,
  versionedServiceToken: symbol,
) {
  const existingVersioningService = versioningServices.find(
    (v) => v.versionedServiceToken === versionedServiceToken,
  );

  if (existingVersioningService) {
    return existingVersioningService;
  }

  const versioningServiceToken = Symbol(
    `VersioningServiceFor${versionedServiceToken.description}`,
  );

  const newVersioningService = {
    VersionedEntity,
    versionedServiceToken,
    versioningServiceToken,
  };

  versioningServices.push(newVersioningService);

  return newVersioningService;
}

export function Versioned<E extends Trackable>(VersionedEntity: Type<E>) {
  const { entityToken } = EntityStore.get(VersionedEntity);

  if (!checkIfIsTrackable(VersionedEntity)) {
    throw new Error(
      `Entity ${
        entityToken.description ?? entityToken.toString()
      } must be trackable to be versioned`,
    );
  }

  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    const { serviceToken } = ServiceStore.get(constructor);

    const versioningService = registerVersioningService(
      VersionedEntity,
      serviceToken,
    );

    @Injectable()
    class VersionedService extends constructor {
      @Inject(versioningService.versioningServiceToken)
      versioningService: VersioningService<E>;
    }

    return VersionedService;
  };
}
