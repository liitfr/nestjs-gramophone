import { PipeTransform, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import {
  PartialSimpleApiInputObj,
  SimpleApiInputObj,
} from '../../utils/resolvers/types/simple-api-input.type';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

import { User } from '../entities/user.entity';

import { CleanUserPipe } from './clean-user.pipe';

@Injectable()
export class CleanUserBeforeCreatePipe
  extends CleanUserPipe
  implements
    PipeTransform<
      PartialSimpleApiInputObj<User>,
      Promise<SimpleApiInputObj<User>>
    >
{
  override async transform(
    value: PartialSimpleApiInputObj<User>,
  ): Promise<SimpleApiInputObj<User>> {
    if (!value.password) {
      throw new CustomError(
        'Missing password',
        ErrorCode.BAD_REQUEST,
        {
          fr: 'Le mot de passe est manquant.',
        },
        {
          service: 'CleanUserBeforeCreatePipe',
          method: 'transform',
          value,
        },
      );
    }

    if (value.password.length < 8) {
      throw new CustomError(
        'Password too short',
        ErrorCode.BAD_REQUEST,
        {
          fr: 'Le mot de passe est trop court.',
        },
        {
          service: 'CleanUserBeforeCreatePipe',
          method: 'transform',
          value,
        },
      );
    }

    const result = await super.transform(value);

    const encryptedPassword = await argon2.hash(value.password);

    return { ...result, password: encryptedPassword };
  }
}
