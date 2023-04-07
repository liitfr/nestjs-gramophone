import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Provider } from '@nestjs/common';
import { Model } from 'mongoose';

import { getEntityMetadata } from '../../utils/entities/entity.util';

import { versioners } from '../decorators/versioned.decorator';
import { VersioningService } from '../services/versioning.service';

import { VersioningEntityFactory } from './versioning-entity.factory';
import { VersioningResolverFactory } from './versioning-resolver.factory';

function VersioningServiceFactory(
  versioningService: VersioningService<unknown>,
  model: Model<unknown>,
) {
  versioningService.setModel(model);
  return versioningService;
}

export const createVersioners = () => {
  const entities = [];
  const services: Provider<VersioningService<unknown>>[] = [VersioningService];
  for (const { versioningServiceToken, Entity } of versioners) {
    const { EntityVersion, EntityVersionSchemas } =
      VersioningEntityFactory(Entity);

    const entityVersionName =
      getEntityMetadata(EntityVersion)?.entityToken?.description;

    if (!entityVersionName) {
      throw new Error('Entity version name not found');
    }

    entities.push({
      name: entityVersionName,
      schema: EntityVersionSchemas.noIndex,
    });

    services.push({
      provide: versioningServiceToken,
      useFactory: VersioningServiceFactory,
      inject: [
        VersioningService,
        { token: getModelToken(entityVersionName), optional: false },
      ],
    });

    const resolver = VersioningResolverFactory(
      EntityVersion,
      versioningServiceToken,
    );
    services.push(resolver);
  }

  return {
    imports: [MongooseModule.forFeature(entities)],
    providers: services,
  };
};
