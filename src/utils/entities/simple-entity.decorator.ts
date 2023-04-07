import { Field, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { SetMetadata } from '@nestjs/common';

import { IdScalar } from '../scalars/id.scalar';
import { Id } from '../id.type';
import { pascalCase, pluralize } from '../string.util';

import {
  ENTITY_METADATA,
  EntityMetadata,
  enhancerCheckerFactory,
  getEntityMetadata,
} from './entity.util';

interface Options {
  isTrackable?: boolean;
  isMemoable?: boolean;
  isIdable?: boolean;
}

const IS_IDABLE = 'isIdable';
const IS_MEMOABLE = 'isMemoable';
const IS_TRACKABLE = 'isTrackable';

export function SimpleEntity(
  { isTrackable = false, isMemoable = false, isIdable = false }: Options = {
    isTrackable: false,
    isMemoable: false,
    isIdable: false,
  },
) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const originalMetadata = getEntityMetadata(constructor);
    const { entityDescription } = originalMetadata;

    if (isTrackable) {
      Object.defineProperties(constructor.prototype, {
        creatorId: { enumerable: true, configurable: true, writable: true },
        updaterId: { enumerable: true, configurable: true, writable: true },
        createdAt: { enumerable: true, configurable: true, writable: true },
        updatedAt: { enumerable: true, configurable: true, writable: true },
      });

      Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescription}'s creator id`,
      })(constructor.prototype, 'creatorId');

      Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })(constructor.prototype, 'creatorId');

      Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescription}'s updater id`,
      })(constructor.prototype, 'updaterId');

      Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        autopopulate: false,
        required: true,
      })(constructor.prototype, 'updaterId');

      Field(() => GraphQLISODateTime, {
        nullable: false,
        description: `${entityDescription}'s created at`,
        defaultValue: new Date(),
      })(constructor.prototype, 'createdAt');

      Prop({
        type: Date,
        required: true,
        default: new Date(),
      })(constructor.prototype, 'createdAt');

      Field(() => GraphQLISODateTime, {
        nullable: false,
        description: `${entityDescription}'s updated at`,
        defaultValue: new Date(),
      })(constructor.prototype, 'updatedAt');

      Prop({
        type: Date,
        required: true,
        default: new Date(),
      })(constructor.prototype, 'updatedAt');
    }

    if (isMemoable) {
      Object.defineProperties(constructor.prototype, {
        memo: { enumerable: true, configurable: true, writable: true },
        internalMemo: { enumerable: true, configurable: true, writable: true },
        automaticMemo: { enumerable: true, configurable: true, writable: true },
      });

      Field(() => String, {
        nullable: true,
        description: `${entityDescription}'s memo`,
      })(constructor.prototype, 'memo');

      Prop({
        type: String,
        required: false,
      })(constructor.prototype, 'memo');

      Field(() => String, {
        nullable: true,
        description: `${entityDescription}'s internal memo`,
      })(constructor.prototype, 'internalMemo');

      Prop({
        type: String,
        required: false,
      })(constructor.prototype, 'internalMemo');

      Field(() => String, {
        nullable: true,
        description: `${entityDescription}'s automatic memo`,
      })(constructor.prototype, 'automaticMemo');

      Prop({
        type: String,
        required: true,
        default: 'Memo automatique généré via GraphQL',
      })(constructor.prototype, 'automaticMemo');
    }

    if (isIdable) {
      Object.defineProperty(constructor.prototype, '_id', {
        enumerable: true,
        configurable: true,
        writable: true,
      });

      Field(() => IdScalar, {
        nullable: false,
        description: `${entityDescription}'s id`,
      })(constructor.prototype, '_id');
    }

    const entityToken = Symbol(constructor.name);

    const entityServiceToken = Symbol(
      `${pluralize(pascalCase(entityToken.description))}Service`,
    );

    const entityRepositoryToken = Symbol(
      `${pluralize(pascalCase(entityToken.description))}Repository`,
    );

    SetMetadata<symbol, EntityMetadata>(ENTITY_METADATA, {
      ...originalMetadata,
      entityToken,
      entityDescription,
      entityEnhancers: [
        ...(isTrackable ? [IS_TRACKABLE] : []),
        ...(isMemoable ? [IS_MEMOABLE] : []),
        ...(isIdable ? [IS_IDABLE] : []),
      ],
      entityServiceToken,
      entityRepositoryToken,
    })(constructor);
  };
}

export interface Trackable {
  creatorId: string;
  updaterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memoable {
  memo?: string;
  internalMemo?: string;
  automaticMemo?: string;
}

export interface Idable {
  _id: Id;
}

export const checkIfIsIdable = enhancerCheckerFactory<Idable>(IS_IDABLE);

export const checkIfIsMemoable = enhancerCheckerFactory<Memoable>(IS_MEMOABLE);

export const checkIfIsTrackable =
  enhancerCheckerFactory<Trackable>(IS_TRACKABLE);
