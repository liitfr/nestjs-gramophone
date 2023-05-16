import { Query, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/factories/simple-resolver.factory';
import { FindOneAndUpdateInterceptor } from '../../utils/resolvers/interceptors/find-one-and-update.interceptor';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserCreateInput } from '../dtos/user-create.input';
import { UserUpdateInput } from '../dtos/user-update.input';
import { CleanUserBeforeCreatePipe } from '../pipes/clean-user-before-create.pipe';
import { CleanUserBeforeUpdatePipe } from '../pipes/clean-user-before-update.pipe';

const options = {
  create: {
    Payload: UserCreateInput,
    payloadPipes: [CleanUserBeforeCreatePipe] as const,
  },
  findOneAndUpdate: {
    interceptors: [FindOneAndUpdateInterceptor] as const,
    Payload: UserUpdateInput,
    payloadPipes: [CleanUserBeforeUpdatePipe] as const,
  },
};

const SimpleUsersResolver = SimpleResolverFactory<User, UsersService>(
  User,
  UserUpdateInput, // We use update input in order to omit password
  UsersService,
  options,
);

@Resolver(() => User)
export class UsersResolver extends SimpleUsersResolver {
  @Query(() => User, {
    description: 'User : Who am I query',
  })
  whoAmI(@CurrentUser() user: User) {
    return this.simpleService.findById({ id: user._id });
  }
}
