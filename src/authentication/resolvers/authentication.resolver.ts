import { UseGuards } from '@nestjs/common';
import { Mutation, Context, Query, Args, Resolver } from '@nestjs/graphql';

import { UsersService } from '../../users/services/users.service';
import { UserWithNoFieldResolver } from '../../users/entities/user-with-no-field-resolver.entity';

import { AuthenticationService } from '../services/authentication.service';
import { LoginInput } from '../dtos/login.input';
import { LocalAuthenticationGuard } from '../guards/local-authentication.guard';
import { Public } from '../decorators/public.decorator';
import { LogoutResult } from '../entities/logout-result.entity';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@Resolver()
export class AuthenticationResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Public()
  @Mutation(() => UserWithNoFieldResolver, {
    description: 'Authentication : Login mutation',
  })
  @UseGuards(LocalAuthenticationGuard)
  async login(
    @Args('credentials') _credentials: LoginInput,
    @Context() ctx: any,
  ) {
    // added by passport local strategy
    const { user } = ctx.req;

    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user._id);

    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authenticationService.getCookieWithJwtRefreshToken(user._id);

    await this.usersService.setCurrentRefreshToken(user._id, refreshToken);

    ctx.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @Mutation(() => LogoutResult, {
    description: 'Authentication : Logout mutation',
  })
  async logout(@Context() ctx: any) {
    await this.usersService.removeRefreshToken(ctx.req.user._id);
    ctx.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
    return {
      loggedOut: true,
    };
  }

  @Query(() => UserWithNoFieldResolver, {
    description: 'Authentication : Context user query',
  })
  authentication(@Context() ctx: any) {
    return ctx.req.user;
  }

  @UseGuards(JwtRefreshGuard)
  @Mutation(() => UserWithNoFieldResolver, {
    description: 'Authentication : Refresh token mutation',
  })
  refreshToken(@Context() ctx: any) {
    const user = ctx.req.user;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user._id);
    ctx.res.setHeader('Set-Cookie', accessTokenCookie);
    return user;
  }
}
