import { Query, Resolver } from '@nestjs/graphql';

import { SimpleResolverFactory } from '../../utils/resolvers/simple-resolver.factory';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserInput } from '../dto/user.input';

const SimpleUserResolver = SimpleResolverFactory<User, UsersService>(
  User,
  UserInput,
  UsersService,
);

@Resolver(() => User)
export class UsersResolver extends SimpleUserResolver {
  @Query(() => User, {
    description: 'User : Who am I query',
  })
  whoAmI(@CurrentUser() user: User) {
    return this.simpleService.findById(user._id);
  }
}
