import { Field, InputType } from '@nestjs/graphql';

import { SimpleEntityInputFactory } from '../../utils/dtos/simple-entity-input.factory';

import { User } from '../entities/user.entity';

@InputType({ isAbstract: true })
class FieldsToAddToUserCreationInput {
  @Field(() => String, {
    nullable: false,
    description: "User's password",
  })
  password: string;
}

@InputType({ description: 'User Create Input' })
export class UserCreateInput extends SimpleEntityInputFactory(User, {
  removeFields: [],
  AddFields: [FieldsToAddToUserCreationInput],
}) {}
