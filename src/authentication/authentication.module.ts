import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

// 1.  Services
import { AuthenticationService } from './services/authentication.service';

// 2.  Resolvers
import { AuthenticationResolver } from './resolvers/authentication.resolver';

// 3. Guards
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';

// 4. Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [UsersModule, JwtModule.register({}), PassportModule],
  providers: [
    AuthenticationService,
    AuthenticationResolver,
    JwtAuthenticationGuard,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthenticationModule {}
