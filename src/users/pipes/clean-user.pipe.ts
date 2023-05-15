import { PipeTransform, Injectable } from '@nestjs/common';
import { O } from 'ts-toolbelt';

import { PartialSimpleApiInputObj } from '../../utils/resolvers/types/simple-api-input.type';
import { SimpleApiInputObj } from '../../utils/resolvers/types/simple-api-input.type';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';

import { User } from '../entities/user.entity';

@Injectable()
export abstract class CleanUserPipe
  implements
    PipeTransform<
      O.Omit<PartialSimpleApiInputObj<User>, 'password'>,
      Promise<O.Omit<SimpleApiInputObj<User>, 'password'>>
    >
{
  async transform(
    value: O.Omit<PartialSimpleApiInputObj<User>, 'password'>,
  ): Promise<O.Omit<SimpleApiInputObj<User>, 'password'>> {
    if (!value.email) {
      throw new CustomError(
        'Missing email',
        ErrorCode.BAD_REQUEST,
        {
          fr: "L'email est manquant.",
        },
        {
          service: 'CleanUserPipe',
          method: 'transform',
          value,
        },
      );
    }

    const roleIds = value.roleIds ?? [];

    const _id = value._id ?? undefined;

    const newValue = {
      ...value,
      roleIds,
      _id,
    };

    return newValue as O.Required<
      O.Compulsory<PartialSimpleApiInputObj<User>, 'email' | 'roleIds'>,
      '_id'
    >;
  }
}
