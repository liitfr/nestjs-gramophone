import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import {
  Trackable,
  checkIfIsTrackable,
} from '../entity-enhancers/trackable.decorator';
import { Idable, checkIfIsIdable } from '../entity-enhancers/idable.decorator';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';
import { ENTITY_METADATA } from '../entity-enhancers/entity.util';

interface Options {
  isIdMandatory?: boolean;
  removeTrackable?: boolean;
}

export function SimpleEntityInputFactory(
  classRef: Type<Idable | Trackable | any>,
  { isIdMandatory = false, removeTrackable = true }: Options = {
    isIdMandatory: false,
    removeTrackable: true,
  },
) {
  if (!isIdMandatory && checkIfIsIdable(classRef)) {
    const entityDescription = Reflect.getMetadata(
      ENTITY_METADATA,
      classRef,
    )?.entityDescription;

    if (!entityDescription) {
      throw new Error(
        `Entity ${classRef.name} is not decorated with @Entity()`,
      );
    }

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

    if (removeTrackable && checkIfIsTrackable(classRef)) {
      return IntersectionType(
        OmitType(classRef, [
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
        OmitType(classRef, ['_id'] as const),
        ClassOptionalId,
        InputType,
      );
    }
  } else {
    if (removeTrackable && checkIfIsTrackable(classRef)) {
      return OmitType(
        classRef,
        ['createdAt', 'updatedAt', 'creatorId', 'updaterId'] as const,
        InputType,
      );
    } else {
      return OmitType(classRef, [] as const, InputType);
    }
  }
}
