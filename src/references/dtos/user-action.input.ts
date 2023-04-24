import { InputType } from '@nestjs/graphql';

import { SimpleReferenceInputFactory } from '../factories/simple-reference-input.factory';
import { UserAction } from '../entities/user-action.entity';

@InputType({ description: 'User Action Input' })
export class UserActionInput extends SimpleReferenceInputFactory(UserAction) {}
