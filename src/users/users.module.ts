import { Module } from '@nestjs/common';

import { ReferencesModule } from '../references/references.module';

// 1. Services
import { UsersServiceProviders } from './services/users.service';

// 2. Resolvers
import { UsersResolver } from './resolvers/users.resolver';

@Module({
  imports: [ReferencesModule],
  providers: [...UsersServiceProviders, UsersResolver],
  exports: [...UsersServiceProviders],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
