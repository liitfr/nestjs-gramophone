import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Provider } from '@nestjs/common';
import { Model } from 'mongoose';

import { getEntityMetadata } from '../../utils/entities/entity.util';

import { versioners } from '../decorators/versioned.decorator';
import { VersioningService } from '../services/versioning.service';

import { versioningEntityFactory } from './versioning-entity.factory';
import { versioningResolverFactory } from './versioning-resolver.factory';

function versioningServiceFactory(
  versioningService: VersioningService<unknown>,
  model: Model<unknown>,
) {
  versioningService.setModel(model);
  return versioningService;
}

export const createVersioners = () => {
  const entities = [];
  const providers: Provider<VersioningService<unknown>>[] = [VersioningService];
  for (const { repositoryName, Entity } of versioners) {
    const { EntityVersion, EntityVersionSchema } =
      versioningEntityFactory(Entity);

    const entityVersionName = getEntityMetadata(EntityVersion)?.entityName;

    entities.push({
      name: entityVersionName,
      schema: EntityVersionSchema,
    });

    const providerName = `VersioningServiceFor${repositoryName}`;

    providers.push({
      provide: providerName,
      useFactory: versioningServiceFactory,
      inject: [
        VersioningService,
        { token: getModelToken(entityVersionName), optional: false },
      ],
    });
    const resolver = versioningResolverFactory(EntityVersion, providerName);
    providers.push(resolver);
  }

  return {
    imports: [MongooseModule.forFeature(entities)],
    providers,
  };
};
