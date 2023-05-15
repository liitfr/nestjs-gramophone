import { InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { User } from '../entities/user.entity';

@InputType({ description: 'User Update Input' })
export class UserUpdateInput extends SimpleEntityInputFactory(User, {
  removeFields: [],
  AddFields: [],
}) {}
