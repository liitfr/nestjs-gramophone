import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { environment } from '../../environments/environment';
import { UsersService } from '../../users/services/users.service';

import { AuthenticationService } from '../services/authentication.service';
import { TokenPayload } from '../types/token-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: environment.jwtAccessTokenSecret,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.usersService.findById({ id: payload.userId });
    await this.authenticationService.verifyStatus(user);
    void this.usersService.ping(user);
    return user;
  }
}
