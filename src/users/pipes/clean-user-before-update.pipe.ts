import { PipeTransform, Injectable } from '@nestjs/common';
import { O } from 'ts-toolbelt';

import {
  PartialSimpleApiInputObj,
  SimpleApiInputObj,
} from '../../utils/resolvers/types/simple-api-input.type';
import { FILTER_VALUE } from '../../utils/resolvers/interceptors/find-one-and-update.interceptor';
import { SimpleFilter } from '../../utils/resolvers/types/simple-filter.type';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

import { CleanUserPipe } from './clean-user.pipe';

@Injectable()
export class CleanUserBeforeUpdatePipe
  extends CleanUserPipe
  implements
    PipeTransform<
      PartialSimpleApiInputObj<User>,
      Promise<O.Omit<SimpleApiInputObj<User>, 'password'>>
    >
{
  constructor(private readonly usersService: UsersService) {
    super();
  }

  override async transform(
    value: PartialSimpleApiInputObj<User> & {
      [FILTER_VALUE]: SimpleFilter<User>;
    },
  ): Promise<O.Omit<SimpleApiInputObj<User>, 'password'>> {
    if (value.password) {
      throw new CustomError(
        'Cannot update password with this mutation',
        ErrorCode.BAD_REQUEST,
        {
          fr: 'Impossible de mettre à jour le mot de passe avec cette mutation.',
        },
        {
          service: 'CleanUserBeforeUpdatePipe',
          method: 'transform',
          value,
        },
      );
    }

    const filterResult = await this.usersService.find({
      filter: value[FILTER_VALUE],
    });

    if (filterResult.length === 0 || !filterResult[0]?._id) {
      throw new CustomError(
        'User not found',
        ErrorCode.BAD_REQUEST,
        {
          fr: "L'utilisateur n'existe pas.",
        },
        {
          service: 'CleanUserBeforeUpdatePipe',
          method: 'transform',
          value,
        },
      );
    }

    const existingUser = filterResult[0];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [FILTER_VALUE]: _filterValue, password, ...cleanValue } = value;

    return await super.transform({ ...existingUser, ...cleanValue });
  }
}
