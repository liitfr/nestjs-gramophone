import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { UserRole } from '../entities/user-role.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory(UserRole);

export class UserRolesService extends Service {}

export const UserRolesServiceProviders = ServiceProvidersFactory(
  UserRolesService,
  serviceToken,
);
