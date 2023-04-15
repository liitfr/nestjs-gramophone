import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

import { Id } from '../../utils/id.type';

import { RepositoryStore } from '../services/repository-store.service';

@ValidatorConstraint({ name: 'IdExists', async: true })
@Injectable()
export class IdExistsRule implements ValidatorConstraintInterface {
  async validate(id: Id | null | undefined, args: ValidationArguments) {
    try {
      const [entityToken, nullable] = args.constraints;

      if (nullable && (typeof id === 'undefined' || id === null)) {
        return true;
      }

      const entityRepository = RepositoryStore.get(entityToken);

      const result = await entityRepository.findById(id);

      return !!result;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Id ($value) does not exist in ${args.constraints[0].description}`;
  }
}

export function IdExists(
  entityToken: symbol,
  nullable = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IdExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityToken, nullable],
      options: validationOptions,
      validator: IdExistsRule,
    });
  };
}
