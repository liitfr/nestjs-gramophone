import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { Color } from '../entities/color.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory(Color);

export class ColorsService extends Service {}

export const ColorsServiceProviders = ServiceProvidersFactory(
  ColorsService,
  serviceToken,
);
