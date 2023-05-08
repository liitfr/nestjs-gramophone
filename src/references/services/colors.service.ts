import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { Color } from '../entities/color.entity';
import { ColorEnum } from '../enums/color.enum';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory<
  Color,
  typeof ColorEnum
>(Color);

export class ColorsService extends Service {}

export const ColorsServiceProviders = ServiceProvidersFactory(
  ColorsService,
  serviceToken,
);
