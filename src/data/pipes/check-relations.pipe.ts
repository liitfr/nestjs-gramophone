import { Injectable, Optional, PipeTransform, Type } from '@nestjs/common';

import { getEntityMetadata } from '../../utils/entities/entity.util';

import { RepositoryFinder } from '../services/repository-finder';

@Injectable()
export class CheckRelations implements PipeTransform<any> {
  constructor(@Optional() private readonly Entity: Type<unknown>) {}

  async transform(value: any) {
    if (!this.Entity) {
      throw new Error('Entity is not defined');
    }

    const entityMetadata = getEntityMetadata(this.Entity);

    if (!entityMetadata || !entityMetadata.entityRelations) {
      return value;
    }

    for (const entityRelation of entityMetadata.entityRelations) {
      const { idName, nullable, multiple, Relation, idDescription } =
        entityRelation;

      if (value[idName]) {
        if (value[idName] === null && !nullable) {
          throw new Error(`${idName} cannot be null`);
        }

        const { entityToken: relationToken } = getEntityMetadata(Relation);

        const relationRepository =
          RepositoryFinder.findByEntityToken(relationToken);

        let result;

        if (multiple) {
          const errorMessage = `Some if not all ${idDescription} do not exist. List: ${value[idName]}`;

          try {
            result = await relationRepository.find({
              _id: { $in: value[idName] },
            });
          } catch (e) {
            throw new Error(errorMessage);
          }

          if (result !== value[idName].length) {
            throw new Error(errorMessage);
          }
        } else {
          const errorMessage = `${idDescription} does not exist. Id: ${value[idName]}`;

          try {
            result = await relationRepository.findById(value[idName]);
          } catch (e) {
            throw new Error(errorMessage);
          }

          if (!result) {
            throw new Error(errorMessage);
          }
        }
      }
    }

    return value;
  }
}
