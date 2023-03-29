import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types as MongooseTypes } from 'mongoose';

import { Type } from '@nestjs/common';
import {
  EntityDecorator,
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../entity-decorator';
import { pluralizeEntityName } from '../pluralize-entity-name';
import { MongoObjectIdScalar } from '../scalars/mongo-id.scalar';

export const isTrackable = Symbol('isTrackable');

export interface Trackable {
  creatorId: MongooseTypes.ObjectId;
  updaterId: MongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const checkIfIsTrackable = (
  classRef: Type,
): classRef is Type<Trackable> =>
  !!Object.getOwnPropertyDescriptor(classRef, isTrackable);

export function Trackable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const entityNameValue = getEntityName(constructor);
    const entityDescriptionValue = getEntityDescription(constructor);

    @ObjectType(entityNameValue)
    @Schema({ collection: pluralizeEntityName(entityNameValue) })
    class Tracked extends constructor implements EntityDecorator, Trackable {
      static [entityName] = entityNameValue;
      static [entityDescription] = entityDescriptionValue;
      static [isTrackable] = true;

      @Field(() => MongoObjectIdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}'s creator id`,
      })
      @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })
      creatorId: MongooseTypes.ObjectId;

      @Field(() => MongoObjectIdScalar, {
        nullable: false,
        description: `${entityDescriptionValue}'s updater id`,
      })
      @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })
      updaterId: MongooseTypes.ObjectId;

      @Field(() => GraphQLISODateTime, {
        nullable: false,
        description: `${entityDescriptionValue}'s created at`,
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
      })
      @Prop({
        type: Date,
        required: true,
        default: new Date(),
      })
      updatedAt: Date;
    }

    Object.defineProperty(Tracked, 'name', { value: constructor.name });

    return Tracked;
  };
}
