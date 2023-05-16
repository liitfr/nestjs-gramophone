import argon2 from 'argon2';

import { Id } from '../../utils/types/id.type';
import { ServiceProvidersFactory } from '../../utils/services/service-providers.factory';
import { SimpleServiceFactory } from '../../utils/services/simple-service.factory';

import { User } from '../entities/user.entity';

const { Service, serviceToken } = SimpleServiceFactory(User);

export class UsersService extends Service {
  async ping(user: User) {
    return this.findOneAndUpdate({
      filter: {
        _id: user._id,
      },
      update: {
        lastSeenAt: new Date(),
      },
    });
  }

  async getUserIfRefreshTokenMatches(userId: Id, refreshToken: string) {
    const user = await this.findById({ id: userId });

    if (user.currentHashedRefreshToken) {
      const isRefreshTokenMatching = await argon2.verify(
        user.currentHashedRefreshToken,
        refreshToken,
      );

      if (isRefreshTokenMatching) {
        return user;
      }
    }

    return undefined;
  }

  async setCurrentRefreshToken(userId: Id, refreshToken: string) {
    const currentHashedRefreshToken = await argon2.hash(refreshToken);
    await this.findOneAndUpdate({
      filter: { _id: userId },
      update: {
        currentHashedRefreshToken,
      },
    });
  }

  async removeRefreshToken(userId: Id) {
    return await this.findOneAndUpdate({
      filter: { _id: userId },
      update: {
        currentHashedRefreshToken: undefined,
      },
    });
  }
}

export const UsersServiceProviders = ServiceProvidersFactory(
  UsersService,
  serviceToken,
);
