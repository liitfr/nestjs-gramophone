import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { Type } from '../entities/type.entity';
import { TypeEnum } from '../enums/type.enum';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory<
  Type,
  typeof TypeEnum
>(Type);

export class TypesService extends Service {}

export const TypesServiceProviders = ServiceProvidersFactory(
  TypesService,
  serviceToken,
);
