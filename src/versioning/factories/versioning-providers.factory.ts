import { Logger, Provider } from '@nestjs/common';

import { EntityStore } from '../../utils/entities/entity-store.service';

import { versioningServices } from '../decorators/versioned.decorator';
import { VersioningService } from '../services/versioning.service';

import { VersioningEntityFactory } from './versioning-entity.factory';
import { VersioningResolverFactory } from './versioning-resolver.factory';

export const VersioningProvidersFactory = () => {
  const providers: Provider[] = [VersioningService];

  for (const {
    versioningServiceToken,
    VersionedEntity,
  } of versioningServices) {
    const VersioningEntity = VersioningEntityFactory(VersionedEntity);

    const { entityToken, entityRepositoryToken } =
      EntityStore.get(VersioningEntity);

    if (!entityRepositoryToken) {
      throw new Error(
        'Versioning entity repository token not found for entity ' +
          entityToken.description,
      );
    }

    const versioningEntityName = entityToken.description;

    Logger.verbose(
      `VersioningService for ${versioningEntityName}`,
      'VersioningModuleFactory',
    );

    providers.push({
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

    providers.push(resolver);
  }

  return providers;
};
