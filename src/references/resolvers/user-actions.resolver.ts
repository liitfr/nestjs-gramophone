import { UserAction } from '../entities/user-action.entity';
import { UserActionInput } from '../dtos/user-action.input';
import { UserActionsService } from '../services/user-actions.service';
import { SimpleReferenceResolverFactory } from '../factories/simple-reference-resolver.factory';

export const UserActionsResolver = SimpleReferenceResolverFactory(
  UserAction,
  UserActionInput,
  UserActionsService,
);
