import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { UserRoleEnum } from '../enums/user-role.enum';
import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';

@CreateReferenceRepository()
@SimpleReference(UserRoleEnum)
export class UserRole {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserRole extends ISimpleReference<false> {}
