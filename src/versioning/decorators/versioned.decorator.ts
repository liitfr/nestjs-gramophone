import { Inject, Injectable, Type } from '@nestjs/common';

import { checkIfIsTrackable } from '../../utils/entities/simple-entity.decorator';
import { EntityStore } from '../../utils/entities/entity-store.service';
import { ServiceStore } from '../../utils/services/service-store.service';
import { Constructor } from '../../utils/types/constructor.type';

import { VersioningService } from '../services/versioning.service';
import { IdableAndTrackable } from '../types/idable-and-trackable.type';
import { SetServiceMetadata } from '../../utils/services/set-service-metadata.decorator';

export const versioningServices: {
  VersionedEntity: Type<IdableAndTrackable>;
  versionedServiceToken: symbol;
  versioningServiceToken: symbol;
  hasBeenProcessed?: boolean;
}[] = [];

export const markAllVersioningServicesAsProcessed = () => {
  for (const versioningService of versioningServices) {
    versioningService.hasBeenProcessed = true;
  }
};

export function registerVersioningService<E extends IdableAndTrackable>(
  VersionedEntity: Type<E>,
  versionedServiceToken: symbol,
) {
  const existingVersioningService = versioningServices.find(
    (v) => v.versionedServiceToken === versionedServiceToken,
  );

  if (existingVersioningService) {
    return existingVersioningService;
  }

  const versioningServiceToken: unique symbol = Symbol(
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

export function Versioned<E extends IdableAndTrackable>(
  VersionedEntity: Type<E>,
) {
  const { entityToken } = EntityStore.get(VersionedEntity);

  if (!checkIfIsTrackable(VersionedEntity)) {
    throw new Error(
      `Entity ${
        entityToken.description ?? entityToken.toString()
      } must be trackable to be versioned`,
    );
  }

  return <T extends Constructor>(constructor: T) => {
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

    SetServiceMetadata({
      isVersioned: true,
    })(VersionedService);

    return VersionedService;
  };
}
