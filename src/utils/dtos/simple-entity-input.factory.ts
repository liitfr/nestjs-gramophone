import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { Trackable, checkIfIsTrackable } from '../entities/trackable.decorator';
import { Idable, checkIfIsIdable } from '../entities/idable.decorator';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';
import { getEntityMetadata } from '../entities/entity.util';

interface Options {
  isIdMandatory?: boolean;
  removeTrackable?: boolean;
}

export function SimpleEntityInputFactory(
  Entity: Type<Idable | Trackable | any>,
  { isIdMandatory = false, removeTrackable = true }: Options = {
    isIdMandatory: false,
    removeTrackable: true,
  },
) {
  if (!isIdMandatory && checkIfIsIdable(Entity)) {
    const entityMetadata = getEntityMetadata(Entity);

    if (!entityMetadata) {
      throw new Error(
        'Entity ' + entityMetadata.entityName + ' has no metadata.',
      );
    }

    const { entityDescription } = entityMetadata;

    @InputType()
    class ClassOptionalId {
      @Field(() => IdScalar, {
        nullable: true,
        description:
          `${entityDescription}'s optional id` ??
          'Optional Reference Identifier',
      })
      readonly _id?: Id;
    }

    if (removeTrackable && checkIfIsTrackable(Entity)) {
      return IntersectionType(
        OmitType(Entity, [
          'createdAt',
          'updatedAt',
          'creatorId',
          'updaterId',
          '_id',
        ] as const),
        ClassOptionalId,
        InputType,
      );
    } else {
      return IntersectionType(
        OmitType(Entity, ['_id'] as const),
        ClassOptionalId,
        InputType,
      );
    }
  } else {
    if (removeTrackable && checkIfIsTrackable(Entity)) {
      return OmitType(
        Entity,
        ['createdAt', 'updatedAt', 'creatorId', 'updaterId'] as const,
        InputType,
      );
    } else {
      return OmitType(Entity, [] as const, InputType);
    }
  }
}
