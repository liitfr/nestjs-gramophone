import { Injectable, Optional, PipeTransform, Type } from '@nestjs/common';

import { EntityStore } from '../../utils/entities/entity-store.service';
import { CustomError, ErrorCode } from '../../utils/errors/custom.error';
import { STHandle } from '../../utils/types/handle.type';

import { RepositoryStore } from '../services/repository-store.service';

@Injectable()
export class CheckRelations<E extends object>
  implements PipeTransform<E, Promise<E>>
{
  constructor(@Optional() private readonly Entity: Type<E>) {}

  private async checkEntityRelations<T extends object>(
    Entity: STHandle<T>,
    value: T,
  ): Promise<T> {
    const entityMetadata = EntityStore.get(Entity);

    for (const { target, details } of entityMetadata.nestedEntities ?? []) {
      if (value[details.fieldName]) {
        await this.checkEntityRelations(target, value[details.fieldName]);
      }
    }

    if (!entityMetadata.entityRelations) {
      return value;
    }

    for (const { target, details } of entityMetadata.entityRelations) {
      const { idName, multiple, idDescription } = details;

      if (value[idName]) {
        const { entityToken: relationToken } = EntityStore.get(target);

        const relationRepository =
          RepositoryStore.getInstanceByEntity(relationToken);

        let result: unknown;

        if (multiple) {
          const error = new CustomError(
            `Some if not all ${idDescription} do not exist. List: ${value[idName]}`,
            ErrorCode.USER_INPUT_ERROR,
            {
              fr: `Certains ou tous les ${idDescription} n'existent pas. Liste: ${value[idName]}`,
            },
            {
              service: 'checkRelationsPipe',
              method: 'transform',
            },
          );

          try {
            result = await relationRepository.find({
              _id: { $in: value[idName] },
            });
          } catch (e) {
            throw error;
          }

          if (result !== value[idName].length) {
            throw error;
          }
        } else {
          const error = new CustomError(
            `${idDescription} does not exist. Id: ${value[idName]}`,
            ErrorCode.USER_INPUT_ERROR,
            {
              fr: `${idDescription} n'existe pas. Id: ${value[idName]}`,
            },
            {
              service: 'checkRelationsPipe',
              method: 'transform',
            },
          );

          try {
            result = await relationRepository.findById(value[idName]);
          } catch (e) {
            throw error;
          }

          if (!result) {
            throw error;
          }
        }
      }
    }

    return value;
  }

  async transform(value: E): Promise<E> {
    if (!this.Entity) {
      throw new CustomError(
        'Entity is not defined.',
        ErrorCode.UNKNOWN_ERROR,
        {
          fr: "L'entité n'est pas définie.",
        },
        {
          service: 'checkRelationsPipe',
          method: 'transform',
        },
      );
    }

    return this.checkEntityRelations(this.Entity, value);
  }
}
