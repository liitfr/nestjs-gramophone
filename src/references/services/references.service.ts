import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';
import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { Reference } from '../entities/reference.entity';

const { Service, serviceToken } = SimpleServiceFactory(Reference);

export class ReferencesService extends Service {}

export const ReferencesServiceProviders = ServiceProvidersFactory(
  ReferencesService,
  serviceToken,
);
