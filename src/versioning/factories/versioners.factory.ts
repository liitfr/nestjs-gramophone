import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Provider } from '@nestjs/common';
import { Model } from 'mongoose';

import { getEntityName } from '../../utils/entity-decorator';

import { versioners } from '../decorators/versioned.decorator';
import { VersioningService } from '../services/versioning.service';

import { modelFactory } from './model.factory';
import { resolverFactory } from './resolver.factory';

function versioningServiceFactory(
  versioningService: VersioningService<unknown>,
  model: Model<unknown>,
) {
  versioningService.setModel(model);
  return versioningService;
}

export const createVersioners = () => {
  const models = [];
  const providers: Provider<VersioningService<unknown>>[] = [VersioningService];
  for (const { serviceName, Entity } of versioners) {
    const { EntityVersion, EntityVersionSchema } = modelFactory(Entity);
    const entityVersionName = getEntityName(EntityVersion);
    models.push({
      name: entityVersionName,
      schema: EntityVersionSchema,
    });
    const providerName = `VersioningServiceFor${serviceName}`;
    providers.push({
      provide: providerName,
      useFactory: versioningServiceFactory,
      inject: [
        VersioningService,
        { token: getModelToken(entityVersionName), optional: false },
      ],
    });
    const resolver = resolverFactory(EntityVersion, providerName);
    providers.push(resolver);
  }

  return {
    imports: [MongooseModule.forFeature(models)],
    providers,
  };
};
