import { UserRole } from '../entities/user-role.entity';
import { UserRoleInput } from '../dtos/user-role.input';
import { UserRolesService } from '../services/user-roles.service';
import { SimpleReferenceResolverFactory } from '../factories/simple-reference-resolver.factory';

export const UserRolesResolver = SimpleReferenceResolverFactory(
  UserRole,
  UserRoleInput,
  UserRolesService,
);
