import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { UserAction } from '../entities/user-action.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory(UserAction);

export class UserActionsService extends Service {}

export const UserActionsServiceProviders = ServiceProvidersFactory(
  UserActionsService,
  serviceToken,
);
