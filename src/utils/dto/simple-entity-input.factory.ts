import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import {
  Trackable,
  checkIfIsTrackable,
} from '../decorators/trackable.decorator';
import { Idable, checkIfIsIdable } from '../decorators/idable.decorator';
import { entityDescription } from '../entity-decorator';
import { MongoObjectIdScalar } from '../scalars/mongo-id.scalar';

interface Options {
  isIdMandatory?: boolean;
  removeTrackable?: boolean;
}

export function SimpleEntityInputFactory(
  classRef: Type<Idable | Trackable | any> & { [entityDescription]?: string },
  { isIdMandatory = false, removeTrackable = true }: Options = {
    isIdMandatory: false,
    removeTrackable: true,
  },
) {
  // console.log(isIdable(classRef));
  if (!isIdMandatory && checkIfIsIdable(classRef)) {
    const entityDescriptionValue = classRef[entityDescription] ?? 'Entity';
    @InputType()
    class ClassOptionalId {
      @Field(() => MongoObjectIdScalar, {
        nullable: true,
        description:
          `${entityDescriptionValue}'s optional id` ??
          'Optional Reference Identifier',
      })
      readonly _id?: MongooseTypes.ObjectId;
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
