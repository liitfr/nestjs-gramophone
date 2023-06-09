import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

import { Id } from '../../utils/types/id.type';

import { RepositoryStore } from '../services/repository-store.service';

@ValidatorConstraint({ name: 'IdsExist', async: true })
@Injectable()
export class IdsExistRule implements ValidatorConstraintInterface {
  async validate(ids: Id[] | null | undefined, args: ValidationArguments) {
    try {
      const [entityToken, nullable] = args.constraints;

      if (nullable && (!ids || ids.length === 0)) {
        return true;
      }

      const entityRepository = RepositoryStore.getInstanceByEntity(entityToken);

      const result = await entityRepository.find({
        filter: { _id: { $in: ids } },
      });

      return result.length === (ids ?? []).length;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Some if not all of following Ids ($value) do not exist in ${args.constraints[0].description}`;
  }
}

export function IdsExist(
  entityToken: symbol,
  nullable = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IdsExist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityToken, nullable],
      options: validationOptions,
      validator: IdsExistRule,
    });
  };
}
