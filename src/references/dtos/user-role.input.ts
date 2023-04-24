import { InputType } from '@nestjs/graphql';

import { SimpleReferenceInputFactory } from '../factories/simple-reference-input.factory';
import { UserRole } from '../entities/user-role.entity';

@InputType({ description: 'User Role Input' })
export class UserRoleInput extends SimpleReferenceInputFactory(UserRole) {}
