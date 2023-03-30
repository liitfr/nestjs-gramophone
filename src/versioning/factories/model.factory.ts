import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types as MongooseTypes } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import {
  entityDescription,
  entityName,
  getEntityDescription,
  getEntityName,
} from '../../utils/entity-enhancers/enhancers.util';
import { generateCollectionName } from '../../utils/string.util';
import { Memoable } from '../../utils/entity-enhancers/memoable.decorator';
import { Trackable } from '../../utils/entity-enhancers/trackable.decorator';
import { Id } from '../../utils/id.type';

export function modelFactory(Entity: Type<unknown>) {
  const entityDescriptionValue = getEntityDescription(Entity);
  const entityNameValue = getEntityName(Entity);

  const EntitySchema = SchemaFactory.createForClass(Entity);

  const newEntityName = `${entityNameValue}Version`;
  const newEntityDescription = `${entityDescriptionValue} Version`;

  @Trackable()
  @Memoable()
  @ObjectType(newEntityName)
  @Schema({
    collection: generateCollectionName(newEntityName),
  })
  class EntityVersion {
    static [entityName] = newEntityName;
    static [entityDescription] = newEntityDescription;

    @Field(() => IdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s id`,
    })
    _id: Id;

    @Field(() => IdScalar, {
      nullable: false,
      description: `${newEntityDescription}\'s original id`,
    })
    @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: entityNameValue,
      autopopulate: false,
      required: true,
    })
    originalId: Id;

    @Field(() => Entity, {
      nullable: false,
      description: `${newEntityDescription}\'s version`,
    })
    @Prop({ type: EntitySchema, required: true })
    version: typeof Entity;
  }

  const EntityVersionSchema = SchemaFactory.createForClass(EntityVersion);

  return { EntityVersion, EntityVersionSchema };
}
