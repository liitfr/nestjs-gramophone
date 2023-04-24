import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { environment } from '../../environments/environment';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { Id } from '../../utils/types/id.type';

import { TokenPayload } from '../types/token-payload.type';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public getCookieWithJwtAccessToken(userId: Id) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: environment.jwtAccessTokenSecret,
      expiresIn: `${environment.jwtAccessTokenExpirationTime}s`,
    });
    return `Authentication=${token}; HttpOnly; ${
      environment.sameSiteAndSecure
        ? 'SameSite=None; Secure; '
        : 'SameSite=Lax; '
    }Path=/; Max-Age=${environment.jwtAccessTokenExpirationTime}`;
  }

  public getCookieWithJwtRefreshToken(userId: Id) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: environment.jwtRefreshTokenSecret,
      expiresIn: `${environment.jwtRefreshTokenExpirationTime}s`,
    });
    const cookie = `Refresh=${token}; HttpOnly; ${
      environment.sameSiteAndSecure
        ? 'SameSite=None; Secure; '
        : 'SameSite=Lax; '
    }Path=/; Max-Age=${environment.jwtRefreshTokenExpirationTime}`;
    return {
      cookie,
      token,
    };
  }

  public getCookiesForLogOut() {
    return [
      `Authentication=; HttpOnly; ${
        environment.sameSiteAndSecure
          ? 'SameSite=None; Secure; '
          : 'SameSite=Lax; '
      }Path=/; Max-Age=0`,
      `Refresh=; HttpOnly; ${
        environment.sameSiteAndSecure
          ? 'SameSite=None; Secure; '
          : 'SameSite=Lax; '
      }Path=/; Max-Age=0`,
    ];
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    const result = await this.usersService.find({ email });

    if (result.length > 1) {
      throw new CustomError(
        'There should be only one user with this email.',
        ErrorCode.VALIDATION_ERROR,
        {
          fr: "Il ne devrait y avoir qu'un seul utilisateur avec cet email.",
        },
        {
          service: 'authenticationService',
          method: 'getAuthenticatedUser',
        },
      );
    }

    const user = result[0];

    if (!user) {
      throw new CustomError(
        'User does not exist.',
        ErrorCode.VALIDATION_ERROR,
        {
          fr: "L'utilisateur n'existe pas.",
        },
        {
          service: 'authenticationService',
          method: 'getAuthenticatedUser',
        },
      );
    }

    await this.verifyPassword(plainTextPassword, user.password);
    this.verifyStatus(user);
    void this.usersService.ping(user);
    return user;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await argon2.verify(
      hashedPassword,
      plainTextPassword,
    );
    if (!isPasswordMatching) {
      throw new CustomError(
        'Wrong credentials provided.',
        ErrorCode.UNAUTHENTICATED,
        {
          fr: 'Aucun compte ne correspond à ces informations.',
        },
        {
          service: 'authenticationService',
          method: 'verifyPassword',
        },
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public verifyStatus(_user: User) {
    // throw error if user hasn't valid status
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: environment.jwtAccessTokenSecret,
    });
    if (payload.userId) {
      return this.usersService.findById(payload.userId);
    }
    return;
  }
}
