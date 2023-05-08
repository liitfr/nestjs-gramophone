import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';

import { UserRole } from '../entities/user-role.entity';
import { UserRoleEnum } from '../enums/user-role.enum';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

const { Service, serviceToken } = SimpleReferenceServiceFactory<
  UserRole,
  typeof UserRoleEnum
>(UserRole);

export class UserRolesService extends Service {}

export const UserRolesServiceProviders = ServiceProvidersFactory(
  UserRolesService,
  serviceToken,
);
