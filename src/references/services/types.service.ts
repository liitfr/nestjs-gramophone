import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { Type } from '../entities/type.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory(Type);

export class TypesService extends Service {}

export const TypesServiceProviders = ServiceProvidersFactory(
  TypesService,
  serviceToken,
);
