import {
  ISimpleReference,
  SimpleReference,
} from '../decorators/simple-reference.decorator';
import { UserActionEnum } from '../enums/user-action.enum';
import { CreateReferenceRepository } from '../decorators/create-reference-repository.decorator';

@CreateReferenceRepository()
@SimpleReference(UserActionEnum)
export class UserAction {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserAction extends ISimpleReference<false> {}
