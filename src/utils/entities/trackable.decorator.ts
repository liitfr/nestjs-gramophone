import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Schema as MongooseSchema } from 'mongoose';
import { SetMetadata } from '@nestjs/common';

import { generateCollectionName } from '../string.util';
import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';

import {
  ENTITY_METADATA,
  EntityMetadata,
  enhancerCheckerFactory,
  getEntityMetadata,
} from './entity.util';

const IS_TRACKABLE = 'isTrackable';

export interface Trackable {
  creatorId: Id;
  updaterId: Id;
  createdAt: Date;
  updatedAt: Date;
}

export const checkIfIsTrackable =
  enhancerCheckerFactory<Trackable>(IS_TRACKABLE);

export function Trackable() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);
    const { entityName, entityDescription, entityEnhancers } = originalMetadata;

    @SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityEnhancers: [...(entityEnhancers || []), IS_TRACKABLE],
    })
    @ObjectType(entityName)
    @Schema({ collection: generateCollectionName(entityName) })
    class Tracked extends constructor implements Trackable {
      @Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescription}'s creator id`,
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
        description: `${entityDescription}'s updater id`,
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
        description: `${entityDescription}'s created at`,
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
        description: `${entityDescription}'s updated at`,
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

    return Tracked;
  };
}
