import { Logger, Provider } from '@nestjs/common';

import { EntityStore } from '../../utils/entities/entity-store.service';

import {
  markAllVersioningServicesAsProcessed,
  versioningServices,
} from '../decorators/versioned.decorator';
import { VersioningService } from '../services/versioning.service';

import { VersioningEntityFactory } from './versioning-entity.factory';
import { VersioningResolverFactory } from './versioning-resolver.factory';

export const VersioningProvidersFactory = () => {
  const serviceProviders: Provider[] = [VersioningService];
  const resolverProviders: Provider[] = [VersioningService];

  const versioningServicesToProcess = versioningServices.filter(
    (service) => !service.hasBeenProcessed,
  );

  for (const {
    versioningServiceToken,
    VersionedEntity,
  } of versioningServicesToProcess) {
    const VersioningEntity = VersioningEntityFactory(VersionedEntity);

    const { entityToken, entityRepositoryToken } =
      EntityStore.get(VersioningEntity);

    if (!entityRepositoryToken) {
      throw new Error(
        `Versioning entity repository token not found for entity ${entityToken.description}`,
      );
    }

    const versioningEntityName = entityToken.description;

    Logger.verbose(
      `VersioningService for ${versioningEntityName}`,
      'VersioningModuleFactory',
    );

    serviceProviders.push({
      provide: versioningServiceToken,
      useFactory: (repository) => new VersioningService(repository),
      inject: [{ token: entityRepositoryToken, optional: false }],
    });

    const resolver = VersioningResolverFactory(
      VersioningEntity,
      versioningServiceToken,
    );

    Logger.verbose(
      `VersioningResolver for ${versioningEntityName}`,
      'VersioningModuleFactory',
    );

    resolverProviders.push(resolver);
  }

  markAllVersioningServicesAsProcessed();

  return { serviceProviders, resolverProviders };
};
