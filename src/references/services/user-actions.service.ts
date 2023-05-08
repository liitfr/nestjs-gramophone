import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { UserAction } from '../entities/user-action.entity';
import { UserActionEnum } from '../enums/user-action.enum';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory<
  UserAction,
  typeof UserActionEnum
>(UserAction);

export class UserActionsService extends Service {}

export const UserActionsServiceProviders = ServiceProvidersFactory(
  UserActionsService,
  serviceToken,
);
