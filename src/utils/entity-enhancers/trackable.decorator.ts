import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, {
  Schema as MongooseSchema,
  Types as MongooseTypes,
} from 'mongoose';

import { Type } from '@nestjs/common';
import {
  EntityDecorator,
  entityDescription,
  entityEnhancers,
  entityName,
  getEntityDescription,
  getEntityName,
} from './enhancers.util';
import { generateCollectionName } from '../string.util';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';

const IS_TRACKABLE = 'IS_TRACKABLE';

export interface Trackable {
  creatorId: Id;
  updaterId: Id;
  createdAt: Date;
  updatedAt: Date;
}

export const checkIfIsTrackable = (
  classRef: Type,
): classRef is Type<Trackable> => {
  return (
    Object.getOwnPropertyDescriptor(classRef, entityEnhancers)?.value ?? []
  ).includes(IS_TRACKABLE);
};

export function Trackable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: generateCollectionName(entityNameValue) })
    class Tracked extends constructor implements EntityDecorator, Trackable {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;
      static [entityEnhancers] = [];

      @Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}'s creator id`,
        defaultValue: new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5'),
      })
      @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })
      creatorId: Id;

      @Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}'s updater id`,
        defaultValue: new mongoose.Types.ObjectId('6424ca347788a0ca90372cf5'),
      })
      @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })
      updaterId: Id;

      @Field(() => GraphQLISODateTime, {
        nullable: false,
        description: `${entityDescriptionValue}'s created at`,
        defaultValue: new Date(),
      })
      @Prop({
        type: Date,
        required: true,
        default: new Date(),
      })
      createdAt: Date;

      @Field(() => GraphQLISODateTime, {
        nullable: false,
        description: `${entityDescriptionValue}'s updated at`,
        defaultValue: new Date(),
      })
      @Prop({
        type: Date,
        required: true,
        default: new Date(),
      })
      updatedAt: Date;
    }

    Object.defineProperty(Tracked, 'name', { value: constructor.name });
    Object.defineProperty(Tracked, entityEnhancers, {
      value: [
        IS_TRACKABLE,
        ...(Object.getOwnPropertyDescriptor(constructor, entityEnhancers)
          ?.value ?? []),
      ],
    });

    return Tracked;
  };
}
